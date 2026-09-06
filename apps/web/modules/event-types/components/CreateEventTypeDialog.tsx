import process from "node:process";
import { Dialog } from "@calcom/features/components/controlled-dialog";
import CreateEventTypeForm from "@calcom/features/eventtypes/components/CreateEventTypeForm";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { useTypedQuery } from "@calcom/lib/hooks/useTypedQuery";
import type { EventType } from "@calcom/prisma/client";
import type { MembershipRole } from "@calcom/prisma/enums";
import { SchedulingType } from "@calcom/prisma/enums";
import { trpc } from "@calcom/trpc/react";
import { Button } from "@calcom/ui/components/button";
import { DialogClose, DialogContent, DialogFooter } from "@calcom/ui/components/dialog";
import { showToast } from "@calcom/ui/components/toast";
import { isValidPhoneNumber } from "libphonenumber-js/max";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useCreateEventType } from "~/event-types/hooks/useCreateEventType";

const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL ?? "";

// this describes the uniform data needed to create a new event type on Profile or Team
export interface EventTypeParent {
  teamId: number | null | undefined; // if undefined, then it's a profile
  membershipRole?: MembershipRole | null;
  name?: string | null;
  slug?: string | null;
  image?: string | null;
}

export interface ProfileOption {
  teamId: number | null | undefined;
  label: string | null;
  image: string;
  membershipRole: MembershipRole | null | undefined;
  slug: string | null;
  permissions: {
    canCreateEventType: boolean;
  };
}

const locationFormSchema = z.array(
  z.object({
    locationType: z.string(),
    locationAddress: z.string().optional(),
    displayLocationPublicly: z.boolean().optional(),
    locationPhoneNumber: z
      .string()
      .refine((val) => isValidPhoneNumber(val))
      .optional(),
    locationLink: z.string().url().optional(), // URL validates as new URL() - which requires HTTPS:// In the input field
  })
);

const querySchema = z.object({
  eventPage: z.string().optional(),
  teamId: z.union([z.string().transform((val) => +val), z.number()]).optional(),
  title: z.string().optional(),
  slug: z.string().optional(),
  length: z.union([z.string().transform((val) => +val), z.number()]).optional(),
  description: z.string().optional(),
  schedulingType: z.nativeEnum(SchedulingType).optional(),
  locations: z
    .string()
    .transform((jsonString) => locationFormSchema.parse(JSON.parse(jsonString)))
    .optional(),
});

export function CreateEventTypeDialog({ profileOptions }: { profileOptions: ProfileOption[] }) {
  const { t } = useLocale();
  const router = useRouter();
  const orgBranding = null;

  const {
    data: { teamId, eventPage: pageSlug },
  } = useTypedQuery(querySchema);

  const teamProfile = profileOptions.find((profile) => profile.teamId === teamId);

  const permissions = teamProfile?.permissions ?? { canCreateEventType: false };

  const onSuccessMutation = (eventType: EventType) => {
    router.replace(`/event-types/${eventType.id}${teamId ? "?tabName=team" : ""}`);
    showToast(
      t("event_type_created_successfully", {
        eventTypeTitle: eventType.title,
      }),
      "success"
    );
  };

  const onErrorMutation = (err: string) => {
    showToast(err, "error");
  };

  const SubmitButton = (isPending: boolean) => {
    return (
      <DialogFooter showDivider>
        <DialogClose />
        <Button type="submit" loading={isPending}>
          {t("continue")}
        </Button>
      </DialogFooter>
    );
  };

  const { form, createMutation, isManagedEventType } = useCreateEventType(onSuccessMutation, onErrorMutation);

  const urlPrefix = WEBSITE_URL;

  return (
    <Dialog
      name="new"
      clearQueryParamsOnClose={["eventPage", "type", "description", "title", "length", "slug", "locations"]}>
      <DialogContent
        type="creation"
        enableOverflow
        title={teamId ? t("add_new_team_event_type") : t("add_new_event_type")}
        description={t("new_event_type_to_book_description")}>
        <CreateEventTypeForm
          urlPrefix={urlPrefix}
          isPending={createMutation.isPending}
          form={form}
          isManagedEventType={isManagedEventType}
          handleSubmit={(values) => {
            // teamId and schedulingType are injected here rather than held in the form.
            // The create handler only attaches the event type to a team when it receives
            // both, so without this the dialog would render for a team and then quietly
            // produce a personal event type. Injecting after validation also sidesteps the
            // client-side refine that demands a schedulingType whenever the form itself
            // carries a teamId.
            //
            // Round robin is the default because it is the shape people mean by "the team
            // takes bookings". It is changed, and hosts are assigned, on the team tab that
            // this dialog redirects to.
            createMutation.mutate(
              teamId ? { ...values, teamId, schedulingType: SchedulingType.ROUND_ROBIN } : values
            );
          }}
          SubmitButton={SubmitButton}
          pageSlug={pageSlug}
        />
      </DialogContent>
    </Dialog>
  );
}
