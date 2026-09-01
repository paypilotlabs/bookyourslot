import process from "node:process";
import AttendeeBookingReminderEmail from "@calcom/emails/templates/attendee-booking-reminder-email";
import { getCalEventResponses } from "@calcom/features/bookings/lib/getCalEventResponses";
import { getTranslation } from "@calcom/i18n/server";
import { isPrismaObjOrUndefined } from "@calcom/lib/isPrismaObj";
import { parseRecurringEvent } from "@calcom/lib/isRecurringEvent";
import prisma from "@calcom/prisma";
import { BookingStatus } from "@calcom/prisma/enums";
import type { CalendarEvent } from "@calcom/types/Calendar";
import { defaultResponderForAppDir } from "app/api/defaultResponderForAppDir";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { reminderWindow } from "./window";

/** One run will never mail more than this. Overflow is picked up an hour later. */
const MAX_PER_RUN = 200;

async function postHandler(request: NextRequest) {
  const apiKey = request.headers.get("authorization") || request.nextUrl.searchParams.get("apiKey");

  // The empty-string check is load-bearing: without it an unset CRON_API_KEY makes
  // a bare `?apiKey=` authenticate, which would leave this route open on any
  // deployment that forgot to set the variable.
  if (!process.env.CRON_API_KEY || process.env.CRON_API_KEY !== apiKey) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const bookings = await prisma.booking.findMany({
    where: { status: BookingStatus.ACCEPTED, ...reminderWindow(new Date()) },
    orderBy: { startTime: "asc" },
    take: MAX_PER_RUN,
    select: {
      id: true,
      uid: true,
      title: true,
      description: true,
      customInputs: true,
      location: true,
      startTime: true,
      endTime: true,
      metadata: true,
      responses: true,
      userPrimaryEmail: true,
      destinationCalendar: true,
      attendees: { select: { email: true, name: true, timeZone: true, locale: true } },
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          username: true,
          locale: true,
          timeZone: true,
        },
      },
      eventType: {
        select: {
          title: true,
          bookingFields: true,
          recurringEvent: true,
          disableCancelling: true,
          disableRescheduling: true,
        },
      },
    },
  });

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const booking of bookings) {
    const metadata = isPrismaObjOrUndefined(booking.metadata) ?? {};
    if (metadata.reminderSentAt) {
      skipped++;
      continue;
    }

    const { user } = booking;
    const name = user?.name || user?.username;
    if (!user || !name || !user.timeZone) {
      failed++;
      console.error(`attendeeReminder: booking ${booking.id} is missing organizer fields`);
      continue;
    }

    const tOrganizer = await getTranslation(user.locale ?? "en", "common");
    const attendeesList = await Promise.all(
      booking.attendees.map(async (attendee) => ({
        name: attendee.name,
        email: attendee.email,
        timeZone: attendee.timeZone,
        language: {
          translate: await getTranslation(attendee.locale ?? "en", "common"),
          locale: attendee.locale ?? "en",
        },
      }))
    );

    const evt: CalendarEvent = {
      // eventType.title, not booking.title — this is what goes in the subject line.
      type: booking.eventType?.title ?? booking.title,
      title: booking.title,
      description: booking.description || undefined,
      customInputs: isPrismaObjOrUndefined(booking.customInputs),
      ...getCalEventResponses({ bookingFields: booking.eventType?.bookingFields ?? null, booking }),
      location: booking.location ?? "",
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
      organizer: {
        id: user.id,
        email: booking.userPrimaryEmail ?? user.email,
        name,
        timeZone: user.timeZone,
        language: { translate: tOrganizer, locale: user.locale ?? "en" },
      },
      attendees: attendeesList,
      uid: booking.uid,
      recurringEvent: parseRecurringEvent(booking.eventType?.recurringEvent),
      // Without these the reminder offers Reschedule and Cancel links on event
      // types where the organizer deliberately turned them off.
      disableCancelling: booking.eventType?.disableCancelling ?? false,
      disableRescheduling: booking.eventType?.disableRescheduling ?? false,
      destinationCalendar: booking.destinationCalendar ? [booking.destinationCalendar] : [],
    };

    // Claim before sending. A crash between here and the send costs one missed
    // reminder; claiming afterwards would re-mail the whole window on the next run.
    // Spread the existing metadata — a bare object would drop videoCallUrl.
    await prisma.booking.update({
      where: { id: booking.id },
      data: { metadata: { ...metadata, reminderSentAt: new Date().toISOString() } },
    });

    for (const attendee of attendeesList) {
      try {
        await new AttendeeBookingReminderEmail(evt, attendee).sendEmail();
        sent++;
      } catch (error) {
        failed++;
        // Sequential, and caught per attendee: one bad address must not skip
        // everyone after it, and Promise.all would open N SMTP connections at once.
        console.error(`attendeeReminder: booking ${booking.id} send failed`, error);
      }
    }
  }

  // Logged as well as returned: n8n keeps the response, the container log is what
  // survives when nobody is looking at n8n.
  console.log(`attendeeReminder: sent=${sent} skipped=${skipped} failed=${failed}`);
  return NextResponse.json({ sent, skipped, failed, considered: bookings.length });
}

export const POST = defaultResponderForAppDir(postHandler);
