-- BookYourSlot operator console
--
-- Run on the VPS, from /opt/bookyourslot/deploy/production:
--
--   docker compose -f docker-compose.yml -f docker-compose.registry.yml \
--     -f docker-compose.override.yml exec -T database \
--     sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < /path/to/console.sql
--
-- Or interactively:
--   docker exec -it production-database-1 sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
--
-- Expand $POSTGRES_USER INSIDE the container. Those values live in
-- deploy/production/.env, not in your shell.
--
-- Schema gotchas, each of which has already produced a wrong answer:
--   * The User model maps to a table named "users" (lowercase, plural), and its
--     createdDate field maps to a column literally called "created"
--     (schema.prisma:420). Prisma field names are not column names — check
--     @map() before writing raw SQL.
--   * BookingStatus is stored lowercase: 'accepted', 'cancelled', 'pending'.
--   * Credential.invalid is nullable, so filter `invalid IS TRUE`, never `= true`.
--   * Feedback.rating is a String. Do not aggregate it.
--   * "Payment" is your customers' customers' money. It is not your revenue.
--   * users.lastActiveAt is only ever written on booking creation, so it is
--     max(Booking.createdAt) with extra steps. Do not read it as "last login" —
--     sessions are JWT, so the Session table is never written at all.
--   * BookingDenormalized exists but has zero consumers here and its triggers
--     swallow errors, so it can drift. Read the real "Booking" table.


-- ===========================================================================
-- 1. STANDING CHECKS — run these after every deploy
-- ===========================================================================

-- Bookings that got a "confirmed" email but never reached a calendar.
--
-- This is the one that matters. Google integration failure is SILENT here: the
-- app-keys lookup throws outside the calendar service's try block, the result is
-- swallowed, and the booking still saves and still emails the customer. The only
-- place it is ever visible is an empty uid in this table.
--
-- Expect 3 — the historical failures from the 30-31 Aug outage. Anything higher
-- is a real customer who was told their appointment was confirmed when it never
-- reached anyone's calendar. Find them, check Google at that startTime, and call
-- them.
SELECT count(*) AS bookings_with_no_calendar_event
FROM "BookingReference"
WHERE type = 'google_calendar' AND (uid = '' OR uid IS NULL);

-- ...and who they are, when it is not 3.
SELECT b.uid, b."startTime", b.status, b."createdAt", a.email AS attendee
FROM "BookingReference" r
JOIN "Booking" b ON b.id = r."bookingId"
LEFT JOIN "Attendee" a ON a."bookingId" = b.id
WHERE r.type = 'google_calendar' AND (r.uid = '' OR r.uid IS NULL)
ORDER BY b."createdAt" DESC;

-- The email kill switch. INVERTED SEMANTICS: enabled = true stops ALL outbound
-- email with only a console.warn. It must stay false. Nobody should ever "fix"
-- this by turning it on.
SELECT slug, enabled FROM "Feature" WHERE slug IN ('emails', 'email-verification');

-- Calendar credentials the app has given up on. A row here means that user's
-- sync is dead and they have not been told.
SELECT c.id, u.email, c."appId", c.invalid
FROM "Credential" c JOIN "users" u ON u.id = c."userId"
WHERE c.invalid IS TRUE;

-- Calendars whose busy-time read is failing. This one is nastier than it looks:
-- a calendar Google cannot read contributes zero busy times and is
-- indistinguishable from a calendar that is genuinely free, so double-booking
-- protection is silently off for that account.
SELECT u.email, sc."externalId", sc."syncErrorAt", sc."syncErrorCount", sc.error
FROM "SelectedCalendar" sc JOIN "users" u ON u.id = sc."userId"
WHERE sc."syncErrorAt" IS NOT NULL;


-- ===========================================================================
-- 2. CONSOLE — who your clients are and what they actually use
-- ===========================================================================

-- Everything about every account, one row each.
SELECT
  u.id,
  u.email,
  u.username,
  u.created                                                          AS signed_up,
  u.locked                                                           AS pending_approval,
  u."completedOnboarding",
  u."timeZone",
  (SELECT count(*) FROM "EventType" e WHERE e."userId" = u.id)       AS event_types,
  (SELECT array_agg(DISTINCT c."appId")
     FROM "Credential" c WHERE c."userId" = u.id)                    AS connected_apps,
  (SELECT count(*) FROM "Booking" b WHERE b."userId" = u.id)         AS bookings,
  (SELECT max(b."createdAt") FROM "Booking" b WHERE b."userId" = u.id) AS last_booking
FROM "users" u
ORDER BY u.created;

-- Signups waiting on you. The sidebar badge shows this too, but only while you
-- are logged in.
SELECT id, email, username, created
FROM "users" WHERE locked IS TRUE ORDER BY created;

-- Booking volume by week. The only growth number that means anything yet.
SELECT date_trunc('week', "createdAt")::date AS week,
       count(*)                              AS bookings,
       count(*) FILTER (WHERE status = 'cancelled') AS cancelled
FROM "Booking"
GROUP BY 1 ORDER BY 1 DESC;

-- Who has actually connected a calendar, which is the real activation moment.
-- Credential has no createdAt, so SelectedCalendar.createdAt is the best proxy
-- for when they connected. Adding that column is on the checklist and cannot be
-- backfilled.
SELECT u.email, sc.integration, sc."externalId", sc."createdAt" AS connected_at
FROM "SelectedCalendar" sc JOIN "users" u ON u.id = sc."userId"
ORDER BY sc."createdAt";

-- Event types that exist but are hidden — configured and never switched on.
SELECT u.email, e.title, e.slug, e.length, e.hidden
FROM "EventType" e JOIN "users" u ON u.id = e."userId"
WHERE e.hidden IS TRUE ORDER BY u.email;


-- ===========================================================================
-- 3. PII — what you hold on other people, for a deletion request
-- ===========================================================================

-- Attendees are third parties who never signed up for anything.
SELECT count(*) AS attendees,
       count(*) FILTER (WHERE "phoneNumber" IS NOT NULL AND "phoneNumber" <> '') AS with_phone
FROM "Attendee";

-- To erase someone on request, delete the BOOKING row, not the Attendee row.
-- Booking.responses is JSON holding their email and free-text answers, and it
-- goes with the booking. Deleting only the Attendee leaves that behind.
--   SELECT b.id, b.uid, b."startTime" FROM "Booking" b
--   JOIN "Attendee" a ON a."bookingId" = b.id WHERE a.email = 'person@example.com';
--   DELETE FROM "Booking" WHERE id = <id>;
