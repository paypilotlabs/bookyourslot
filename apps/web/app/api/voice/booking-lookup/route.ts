import { createHash, timingSafeEqual } from "node:crypto";
import process from "node:process";
import prisma from "@calcom/prisma";
import { BookingStatus } from "@calcom/prisma/enums";
import { defaultResponderForAppDir } from "app/api/defaultResponderForAppDir";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { significantDigits } from "./phone";

/**
 * Covers the caller whose next booking was made on the web with no phone on it and
 * whose second was made by voice. Also bounds the work one request can cause.
 */
const MAX_CANDIDATES = 10;

const bodySchema = z.object({
  email: z.string().trim().email().max(255),
  callerPhone: z.string().trim().min(1).max(32),
});

const digest = (value: string) => createHash("sha256").update(value).digest();

function isAuthorised(presented: string | null) {
  const secret = process.env.VOICE_LOOKUP_API_KEY;
  // The empty-string check is load-bearing, as in the attendeeReminder cron: without
  // it an unset variable makes an empty header authenticate, leaving the uid of every
  // upcoming booking readable on any deployment that forgot to set the variable.
  if (!secret || !presented) return false;
  // Hashing first removes the length-mismatch branch timingSafeEqual would throw on.
  return timingSafeEqual(digest(secret), digest(presented));
}

async function postHandler(request: NextRequest) {
  // Header only. The cron route also accepts ?apiKey=, which writes the secret into
  // the Traefik and container access logs; this key hands out the ability to cancel
  // someone's meeting and is worth more than that one.
  if (!isAuthorised(request.headers.get("authorization"))) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    // A shape error is a bug in the caller, not an answer about anyone's booking, so
    // it is safe to distinguish and dangerous to swallow: a lookup that silently
    // answers "not found" to a malformed call is how this repo has shipped features
    // that looked correct and did nothing.
    return NextResponse.json({ message: "Expected { email, callerPhone }" }, { status: 400 });
  }

  const callerDigits = significantDigits(parsed.data.callerPhone);
  const email = parsed.data.email.toLowerCase();
  if (!callerDigits) {
    return NextResponse.json({ found: false });
  }

  const candidates = await prisma.attendee.findMany({
    where: {
      // Attendee.email is stored exactly as typed, so a case-sensitive match makes
      // "Jane@Example.com" permanently unfindable. ILIKE means a submitted "%" is a
      // wildcard, which is why the exact comparison is repeated in the predicate below.
      email: { equals: email, mode: "insensitive" },
      // endTime, not startTime: handleCancelBooking only refuses once the booking has
      // ENDED, so a caller ringing five minutes into a missed meeting can still cancel.
      // PENDING is included so turning on requires-confirmation does not make live
      // bookings invisible to the agent while they sit in the diary.
      booking: {
        is: {
          status: { in: [BookingStatus.ACCEPTED, BookingStatus.PENDING] },
          endTime: { gt: new Date() },
        },
      },
    },
    orderBy: { booking: { startTime: "asc" } },
    take: MAX_CANDIDATES,
    select: {
      name: true,
      email: true,
      phoneNumber: true,
      timeZone: true,
      booking: {
        select: {
          uid: true,
          startTime: true,
          endTime: true,
          eventTypeId: true,
          eventType: { select: { title: true, disableCancelling: true, disableRescheduling: true } },
        },
      },
    },
  });

  // Guest rows carry a stranger's booking under the guest's own email. They are only
  // ever excluded because guest invitees are built with no phoneNumber, so the phone
  // half of this predicate is the guard, not an optimisation. The email half re-checks
  // exactly because the query above used ILIKE.
  const match = candidates.find(
    (candidate) =>
      candidate.email.toLowerCase() === email && significantDigits(candidate.phoneNumber) === callerDigits
  );

  if (!match?.booking) {
    // Logged, never returned. Ops has to be able to tell "every voice booking has a
    // NULL phone" from "somebody is probing", and the response deliberately cannot.
    const withPhone = candidates.filter((candidate) => candidate.phoneNumber).length;
    console.log(
      `voiceLookup: no match for ${email.slice(0, 1)}***@${email.split("@")[1]} ` +
        `candidates=${candidates.length} withPhone=${withPhone}`
    );
    return NextResponse.json({ found: false });
  }

  const { booking } = match;
  return NextResponse.json({
    found: true,
    booking: {
      uid: booking.uid,
      eventTypeId: booking.eventTypeId,
      // Required to rebuild responses on reschedule: bookingFields marks name required,
      // so a reschedule POST without it is a 400. Disclosed only to a caller who has
      // already presented both the email and the matching number.
      name: match.name,
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
      // Must be re-sent on reschedule. The new Attendee row takes the request's
      // timeZone unless the organizer is rescheduling, which is never true here, so
      // omitting it silently rewrites the attendee's timezone to the store's.
      timeZone: match.timeZone,
      service: booking.eventType?.title ?? null,
      // handleCancelBooking enforces disableCancelling; nothing enforces
      // disableRescheduling, so the workflow honouring canReschedule is the only guard.
      canCancel: !booking.eventType?.disableCancelling,
      canReschedule: !booking.eventType?.disableRescheduling,
    },
  });
}

export const POST = defaultResponderForAppDir(postHandler);
