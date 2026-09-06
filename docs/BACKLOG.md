# Engineering backlog

Work that would make BookYourSlot more reliable, safer, or faster. Distinct from
the **feature roadmap** in [deploy/production/CHECKLIST.md](../deploy/production/CHECKLIST.md),
which tracks integrations and product capabilities.

Every item below was verified against the running system, not assumed. Where
something turned out to be already handled it is listed under
[Already done](#already-done) rather than quietly dropped.

**Last audited 6 September 2026**, all 17 items against the code and the live VPS.
That pass moved seven items to Already done (4, 5, 8, 9, 13, 14, 17) and corrected four
descriptions (7, 10, 12, 13c) that would have sent someone to fix the wrong thing. Item numbers are stable across edits because
other documents cite them.

Items only the operator can run have no diff and live in
[OPS-RUNBOOK.md](OPS-RUNBOOK.md); the rows here link to it rather than repeat it.

Ordered by what actually bites first.

---

## P1 — Risk of losing data

### 1. There is no scheduled backup

`crontab -l` on the VPS contains no `pg_dump`, and `/root/backups/` is **empty**.
The only backups in existence are 7 pre-deploy snapshots in
`/opt/bookyourslot/backups/`, written by `remote-deploy.sh` when a deploy runs.

That means **your backup age equals your deploy frequency**. Go a quiet month
without shipping and the newest copy of your customers' bookings is a month old.

The corrected cron is already in
[deploy/production/README.md](../deploy/production/README.md); it just needs
installing, and `/root/backups` creating first. **Pull the VPS checkout before reading
that file off the box** — see the structural note at the end.

*Effort: 10 minutes. Commands in [OPS-RUNBOOK.md](OPS-RUNBOOK.md).*

### 2. No backup has ever been restored

A backup nobody has restored is a belief, not a recovery plan. Restore the newest
snapshot into a scratch database and confirm the bookings are actually in it.

Note the 7 existing snapshots predate the `--clean --if-exists` change, so they
restore only into an **empty** target.

*Effort: 30 minutes, once. Commands in [OPS-RUNBOOK.md](OPS-RUNBOOK.md).*

### 3. Every backup is on the same disk as the database

`/opt/bookyourslot/backups/` and `/root/backups/` both live on the same volume as
the Postgres data. That survives a bad deploy or a dropped table; it does not
survive the disk. One `rclone`/`scp` line to anywhere off-box closes it.

*Effort: 20 minutes.*

---

## P2 — Process

### 6. Branch protection is absent

The repo is private on the free plan, so the GitHub API returns
"Upgrade to GitHub Pro". CI is therefore **advisory**: a red PR can be merged and
`main` can be pushed to directly. Costs a few dollars a month, or accept it and
rely on discipline.

*Effort: minutes, plus a subscription decision. Verified still returning 403 on 6 September 2026.*

---

## P3 — Correctness gaps found by audit

### 7. Duplicate bookings are only blocked for exact matches

`Booking.idempotencyKey` is a **single-column nullable unique index**, not a composite:
the `(startTime, endTime, organizer)` tuple is hashed into the value by application
code, and a Prisma extension sets it on `ACCEPTED` inserts. Postgres enforces it, so
two guests cannot take the identical confirmed slot.

- **Overlapping but not identical** — 10:00-10:30 against 10:15-10:45, or two
  durations on a multi-duration event type. Different keys, both insert. **Still open.**
  The only protection is `ensureAvailableUsers`, a read that is not atomic with the
  insert. There is no exclusion constraint and no range type.
- ~~Requires-confirmation events leave the key NULL~~ — **closed** in `16ac9f2`. A
  `PENDING` booking on an event type with `requiresConfirmation` *and*
  `requiresConfirmationWillBlockSlot` now gets a key of its own. It stays NULL for plain
  requires-confirmation and for paid-awaiting-payment rows, deliberately: several people
  are meant to be able to request the same slot and let the host pick one.

The remaining gap does not bite today, and closing it means touching the booking path,
so it wants its own PR and its own tests.

*Effort: medium. Needs care — this is the booking path.*

---

## P4 — Cleanup

### 10. Decide what `packages/lib/rateLimit.ts` is for

**This item used to say "delete it". That is now contested by the file itself**, and the
decision has to come before any code moves.

The mechanics are unchanged: 150 lines whose only runtime behaviour is returning
`{ success: true, remaining: 999 }`, because `UNKEY_ROOT_KEY` is unset. 21 production
call sites, all no-ops that read like a protection.

But the file's own docblock now argues to keep them: they are the **identity-keyed**
layer, and Traefik structurally cannot provide it. Traefik limits per source address; a
spray from hundreds of addresses against one account is caught here and nowhere else.
Setting `UNKEY_ROOT_KEY` switches that on with no code change.

Both readings are defensible. Pick one:

- **Set `UNKEY_ROOT_KEY`** and the call sites become real. Costs an Unkey account.
- **Accept the no-op** and leave the docblock as the explanation. Costs nothing, and the
  code keeps looking like a control that is not one.
- **Delete it** as originally written. Then also handle `smsLockState.ts`, which imports
  `rateLimiter` directly and is not mentioned in the original item.

Note `checkRateLimitAndThrowError` is not exported from `rateLimit.ts`; it has its own
file. The original item was wrong about that too.

*Effort: the decision is 10 minutes. Acting on it is 2 hours whichever way it goes.*

### 11. Rotate the Postgres password

It was printed into an assistant transcript while inspecting the resolved compose
config. Postgres is reachable only over the tailnet and the internal Docker
network, never publicly, so this is hygiene rather than an emergency.

Note `POSTGRES_PASSWORD` only applies at first init: an existing volume needs
`ALTER USER ... WITH PASSWORD` inside the container, then `DATABASE_URL` updated
to match, then a restart.

*Effort: 30 minutes, brief downtime. Commands in [OPS-RUNBOOK.md](OPS-RUNBOOK.md).*

### 12. One stale row in the feature roadmap

**This item was wrong about two of the three rows it named.** Checked against
`CHECKLIST.md` directly:

- Google sign-in reads "Keys in place, round-trip untested", not "needs keys". Accurate
  as written: the wiring is complete and nobody has clicked it through.
- The owner calendar dashboard already reads "Shipped". Accurate: `/calendar` renders.
- The Unique display font reads "Skipped for now". Also accurate. `unique.woff2` does
  **not** exist and `--font-display` falls back. The font that does serve is Manoyri, a
  different face on `--font-script`. The row could say "wired, binary out-of-band" but
  it is not false.

The one genuinely stale row is elsewhere: `CHECKLIST.md` asks to remove
`displayDebug={true}` from `BookingPageErrorBoundary.tsx`. That prop is passed nowhere
and defaults to `false`. The box should be ticked.

*Effort: 5 minutes.*

---

## P5 — Product

### 13b. Nothing alerts when reminders stop

If n8n is stopped, paused, or its credential expires,
reminders cease and the only symptom is silence. The uptime monitor watches the
booking page, not the schedulers.

Cheapest version is an n8n error workflow on the four HTTP nodes. A stronger
version is a daily check that the container log contains recent
`attendeeReminder[` lines.

*Effort: 30 minutes for the n8n error workflow. Steps in [OPS-RUNBOOK.md](OPS-RUNBOOK.md).*

### 13c. `GOOGLE_CALENDAR_API_KEY` is still unset

Verified unset in the running container. The holiday feature builds its client
eagerly: `getUserAvailability.ts:847` calls `getHolidayService()`, which reaches
`HolidayServiceCachingProxy`'s constructor, which calls
`getGoogleCalendarClient()`, which **throws** when the key is absent. That throw is
outside the try/catch, which only wraps `fetchHolidays`.

**The throw is fixed. Setting the key is not, and that is what is left.**

This item used to call itself latent, on the grounds that zero users had set a holiday
country. That reasoning was backwards: nobody had set one because **nobody could**.
`getHolidayService()` has six callers and five reach it outside any try/catch, including
`getSupportedCountries`, which populates the country dropdown. So the settings page threw
before it could render, and `holidays-view.tsx` printed the raw message: customers saw
the literal string `GOOGLE_CALENDAR_API_KEY environment variable is not set`.

The guard now lives in `fetchHolidays` instead of the client's constructor, so it throws
inside `refreshCache`'s existing catch, which logs. Every caller degrades to "no holidays
blocked" and the settings page loads.

What remains: `GOOGLE_CALENDAR_API_KEY` is still unset, so picking a country yields an
empty holiday list. The panel says "no holidays found", which is true but does not say
why, and a customer could read a selected country as holidays being blocked when nothing
is. Setting the key closes it properly. Surfacing a distinct "lookup unavailable" state
through tRPC is the larger alternative and has not been done.

*Effort: minutes to set the key.*

### 15. Search Console and Bing

Both unticked. Indexing takes weeks to earn, so the clock only starts once the
sitemap is submitted.

*Effort: 30 minutes. Steps in [OPS-RUNBOOK.md](OPS-RUNBOOK.md).*

### 16. Turn on call transfer

The Retell `transfer_call` config is written and dormant in
[automations/retell-agent-script.md](../automations/retell-agent-script.md) under
"Not enabled yet: transfer to a human". Schema verified against Retell's
`create-retell-llm` OpenAPI in September 2026, so this is a paste, not a design task.

Enabling is four steps, only one of which is in this repository:

1. Get a transfer number from the client. It must not forward back to the Retell
   number or the transfer loops into the agent.
2. Paste the tool JSON into the agent's `general_tools`, substituting the number.
3. Make the three prompt edits listed in that section. The line "Never claim you can
   transfer" is accurate while this is off, and it is the thing that must change when
   it is on. A tool added without the prompt edits is a tool the model never invokes.
4. Place a real call and let the destination ring out. Failure behaviour for a
   single-prompt agent is undocumented and there is no `transfer_failed` disconnection
   reason. Claim nothing about recovery until it has been observed.

Every already-provisioned agent needs the prompt re-pasted by hand. The script file is
a paste source, not deployed config, so editing it changes nothing on a running agent.

*Effort: 30 minutes for the first client, 5 for each after.*

---

## Already done

Verified as handled, recorded so they are not re-investigated:

- **CI builds on every PR.** `06efc74`. `ci.yml` gained a second job, `Next build`, that
  builds the way the Dockerfile does. The gap it closes is the one that let a lint
  auto-fix add `import process from "node:process"` to `packages/lib/constants.ts` and
  leave main unbuildable across three merges with CI green throughout.
- **Every GitHub Action is pinned to a commit SHA.** Same commit. All eight `uses:`
  references carry a 40-character SHA with the version as a trailing comment, and
  Dependabot keeps them current. The job holds the deploy SSH key, which is why a mutable
  tag mattered.
- **Login costs the same time whichever way it fails.** A cost-12 compare against
  `DUMMY_PASSWORD_HASH` runs even when there is no stored hash, so an unknown address, a
  locked account, a social-login-only account and a wrong password are one throw after
  one compare. The message was already identical; the timing now is too.
- **The public booking page loads once per request.** `d03ab4d`. React's `cache()` keyed
  on a JSON string, because `cache()` compares arguments by identity and the page passes
  objects. `generateMetadata` and the page component now share one load on the
  highest-traffic path in the product.
- **The reminder schedulers are running.** `bysSchedulers001` is imported and active in
  n8n. Of 58 workflows on that instance exactly two are active, and both are ours. What
  is still missing is an alert for when they stop, which is 13b.
- **The booking round trip is proven on production.** Eight bookings exist: two were
  rescheduled, four cancelled, and each carries a `google_calendar` reference. The
  accepted ones carry a Meet URL. Book, sync, reschedule and cancel have all run against
  the live system.
- **The voice availability chain answers when the request fails.** `Read free slots` now
  sets `neverError`, `fullResponse` and `onError`, and the formatting node returns a
  spoken fallback instead of letting the run die before the responder. A 500 or a changed
  response shape no longer reads as an empty calendar. **Takes effect only once the
  workflow is re-imported into n8n** — see [OPS-RUNBOOK.md](OPS-RUNBOOK.md).
- **The holidays settings page loads without `GOOGLE_CALENDAR_API_KEY`.** The guard moved
  from `GoogleCalendarClient`'s constructor into `fetchHolidays`, so it throws inside
  `refreshCache`'s existing catch rather than out of six unguarded callers. Setting the
  key is still outstanding and is 13c.

- **Attendee reminders, three bands.** 48h, 24h and 30m, each with its own dedupe
  marker, bands tiling the runway so no booking collects the same reminder twice.
  The 24h band deliberately reuses the original `reminderSentAt` key so anyone
  reminded under the single-window version is not reminded again. Scheduling them
  is item 13 above and is not done.
- **The reminder email carries the meeting link.** It did not at first: the event
  was rebuilt from the database, which loses the `videoCallData` the booking
  handler had in memory, so the Where block named the provider and linked to
  nothing. Fixed by passing `metadata.videoCallUrl` through as
  `additionalInformation.hangoutLink`, and proven on a live booking.
- **New accounts get a working Google Meet link.** `installGoogleVideo` was read in
  three places and set in none, so onboarding never installed Meet, and event types
  were created with `locations=[]`. Confirmed fixed on a live account that connected
  Google Calendar and came out with `meet=true` and a Meet location on its event
  type.
- **Teams can be provisioned.** An admin-only mutation creates a team and its
  memberships atomically, and team event types are now properly authorized: the
  permission service in the create handler is a stub returning `true`, which was
  harmless only while no team could exist.
- **Uptime alerts say what actually failed.** The previous wording called every
  curl failure "could not connect", including a response that was merely slow, which
  is what made the 3 September page unattributable. Now separates DNS, no
  connection, timeout, TLS failure and everything else, with the phase timings
  attached.

- **Docker log rotation** — `/etc/docker/daemon.json` sets `max-size: 10m`,
  `max-file: 3`. Disk is at 12% of 193G.
- **Rate limiting** — live at Traefik, verified in production including that a
  spoofed client IP does not mint a fresh bucket.
- **Login account enumeration** — wrong password, unknown address and pending
  account now return an identical message.
- **Booking conflicts** — a guest who loses a race is told the slot went, rather
  than shown a database error.
- **`IMAGE_TAG` pinned** in `.env`, so auto-rollback has a real target.
- **Host-local compose overrides** — `docker-compose.override.yml`, picked up by
  `remote-deploy.sh`.

---

## A structural note

The deploy pipeline updates the **image** and `IMAGE_TAG`. It never updates the
**source checkout** on the VPS. Anything read from disk at runtime — compose
files, `remote-deploy.sh`, the fonts directory — only changes when someone runs
`git pull` on the box.

That drift is silent and cumulative: the host once sat six commits behind while
every deploy reported success. The rule worth remembering:

> **App code deploys itself. Anything under `deploy/production/` needs a manual pull.**

Measured on 6 September 2026: the checkout at `/opt/bookyourslot` was **33 commits behind
`origin/main`**. So the compose files, `remote-deploy.sh` and the backup cron documented
in the box's own `deploy/production/README.md` were all stale, and installing that cron
by reading it off the server would have installed an outdated line. `git pull` there
before acting on anything this document points at.
