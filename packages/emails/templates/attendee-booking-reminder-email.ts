import type { CalendarEvent, Person } from "@calcom/types/Calendar";
import renderEmail from "../src/renderEmail";
import AttendeeScheduledEmail from "./attendee-scheduled-email";

export default class AttendeeBookingReminderEmail extends AttendeeScheduledEmail {
  constructor(calEvent: CalendarEvent, attendee: Person) {
    super(calEvent, attendee);
    // BaseEmail.sendEmail swallows SMTP errors and logs `${this.name}_ERROR`, so a
    // distinct name is the only way to tell a failed reminder apart from a failed
    // confirmation in the logs.
    this.name = "SEND_BOOKING_REMINDER";
  }

  protected async getNodeMailerPayload(): Promise<Record<string, unknown>> {
    return {
      ...(await super.getNodeMailerPayload()),
      // No .ics. A second CONFIRMED invite on the same UID is read by Gmail and
      // Outlook as an event *update*, not a reminder, and can rewrite the entry
      // already sitting in the attendee's calendar.
      icalEvent: undefined,
      subject: this.t("reminder_email", {
        eventType: this.calEvent.type,
        name: this.calEvent.organizer.name,
        date: this.getFormattedDate(),
      }),
      text: this.getTextBody("reminder", "email_reminder_upcoming_event_notice"),
    };
  }

  async getHtml(calEvent: CalendarEvent, attendee: Person) {
    // The parent forwards only { calEvent, attendee }, so without this override the
    // envelope reads "Reminder: ..." while the body still says "Your event has been
    // scheduled" under a green check — which a customer reads as a double booking.
    return await renderEmail("AttendeeScheduledEmail", {
      calEvent,
      attendee,
      title: "reminder",
      // title is run through t() downstream; subtitle is passed straight to the
      // DOM, so it has to arrive already translated.
      subtitle: this.t("email_reminder_upcoming_event_notice"),
      headerType: "calendarCircle",
    });
  }
}
