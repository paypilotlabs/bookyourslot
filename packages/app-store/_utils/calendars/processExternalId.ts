import type { DestinationCalendar } from "@calcom/prisma/client";

/**
 * When inviting attendees to a calendar event, sometimes the external ID is only used for internal purposes
 * Need to process the correct external ID for the calendar service
 */
const processExternalId = (destinationCalendar: DestinationCalendar) => {
  // The Outlook app is removed, but rows written while it existed still carry this
  // integration type, and this runs on the booking path. Keep honouring them.
  if (destinationCalendar.integration === "office365_calendar") {
    return destinationCalendar.primaryEmail || destinationCalendar.externalId;
  }

  return destinationCalendar.externalId;
};

export default processExternalId;
