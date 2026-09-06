"use client";

import AssignAllTeamMembers from "@calcom/features/eventtypes/components/AssignAllTeamMembers";
import type { CheckedSelectOption } from "@calcom/features/eventtypes/components/CheckedTeamSelect";
import { CheckedTeamSelect } from "@calcom/features/eventtypes/components/CheckedTeamSelect";
import type { EventTypeSetupProps, FormValues, Host } from "@calcom/features/eventtypes/lib/types";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { SchedulingType } from "@calcom/prisma/enums";
import { Label } from "@calcom/ui/components/form";
import { RadioAreaGroup as RadioArea } from "@calcom/ui/components/radio";
import { useCallback, useState } from "react";
import { useFormContext } from "react-hook-form";

type TeamMembers = EventTypeSetupProps["teamMembers"];

type EventTeamAssignmentTabProps = {
  team: EventTypeSetupProps["team"];
  teamMembers: TeamMembers;
  eventType: EventTypeSetupProps["eventType"];
};

/**
 * Only ROUND_ROBIN and COLLECTIVE are offered. MANAGED is a template that pushes copies
 * of an event type down to members and only makes sense inside an organization, and
 * ORGANIZATIONS_ENABLED is empty on this deployment by standing rule.
 */
const SCHEDULING_TYPES = [
  { value: SchedulingType.ROUND_ROBIN, label: "round_robin", description: "round_robin_description" },
  { value: SchedulingType.COLLECTIVE, label: "collective", description: "collective_description" },
] as const;

const toOption = (member: TeamMembers[number], host?: Host): CheckedSelectOption => ({
  avatar: member.avatar,
  label: member.name || member.email,
  value: String(member.id),
  priority: host?.priority ?? 2,
  weight: host?.weight ?? 100,
  isFixed: host?.isFixed,
  defaultScheduleId: member.defaultScheduleId,
  groupId: null,
});

/**
 * Turns the picker's options into the shape the update handler stores.
 *
 * `isFixed` is the part worth care. The server coerces it to true for a collective
 * event only when `schedulingType` is itself dirty, and it is not dirty on the common
 * edit where somebody just adds a host. A collective host saved with isFixed false is
 * then treated as a round-robin candidate: instead of everyone attending, one person is
 * picked and the meeting silently becomes something else. So it is decided here.
 *
 * Priority 2 and weight 100 match the server's own defaults, sent explicitly so the
 * stored row does not depend on which side filled them in.
 */
export const toHosts = (options: readonly CheckedSelectOption[], collective: boolean): Host[] =>
  options.map((option) => ({
    userId: Number(option.value),
    isFixed: collective ? true : (option.isFixed ?? false),
    priority: option.priority ?? 2,
    weight: option.weight ?? 100,
    groupId: null,
  }));

export const EventTeamAssignmentTab = ({ team, teamMembers, eventType }: EventTeamAssignmentTabProps) => {
  const { t } = useLocale();
  const { setValue, watch } = useFormContext<FormValues>();

  const schedulingType = watch("schedulingType");
  const hosts = watch("hosts") ?? [];
  const [assignAll, setAssignAll] = useState(watch("assignAllTeamMembers") ?? false);

  const isCollective = schedulingType === SchedulingType.COLLECTIVE;

  const writeHosts = useCallback(
    (options: readonly CheckedSelectOption[], collective: boolean) => {
      setValue("hosts", toHosts(options, collective), { shouldDirty: true });
    },
    [setValue]
  );

  const onSchedulingTypeChange = (next: SchedulingType) => {
    setValue("schedulingType", next, { shouldDirty: true });
    // Nothing on the server migrates hosts when the scheduling type changes, so a
    // collective host list carried into round robin would leave every host fixed and the
    // rotation would never happen. Rewrite them under the new rules instead.
    writeHosts(
      hosts
        .map((host) => {
          const member = teamMembers.find((m) => m.id === host.userId);
          return member ? toOption(member, host) : null;
        })
        .filter((option): option is CheckedSelectOption => option !== null),
      next === SchedulingType.COLLECTIVE
    );
  };

  const selected = hosts
    .map((host) => {
      const member = teamMembers.find((m) => m.id === host.userId);
      return member ? toOption(member, host) : null;
    })
    .filter((option): option is CheckedSelectOption => option !== null);

  const options = teamMembers.map((member) => toOption(member));

  return (
    <div className="flex flex-col gap-6">
      <div className="border-subtle rounded-md border p-6">
        <Label>{t("scheduling_type")}</Label>
        <RadioArea.Group
          value={schedulingType ?? SchedulingType.ROUND_ROBIN}
          onValueChange={(value) => onSchedulingTypeChange(value as SchedulingType)}
          className="mt-2 flex flex-col gap-3">
          {SCHEDULING_TYPES.map((type) => (
            <RadioArea.Item
              key={type.value}
              value={type.value}
              data-testid={`scheduling-type-${type.value}`}
              className="w-full text-sm">
              <strong className="block">{t(type.label)}</strong>
              <p className="text-default">{t(type.description)}</p>
            </RadioArea.Item>
          ))}
        </RadioArea.Group>
      </div>

      <div className="border-subtle rounded-md border p-6">
        <Label>{t("add_members")}</Label>
        <AssignAllTeamMembers
          assignAllTeamMembers={assignAll}
          setAssignAllTeamMembers={setAssignAll}
          onActive={() => writeHosts(options, isCollective)}
          onInactive={() => writeHosts([], isCollective)}
        />
        {!assignAll && (
          <div className="mt-4">
            <CheckedTeamSelect
              data-testid="team-host-select"
              options={options}
              value={selected}
              groupId={null}
              isRRWeightsEnabled={!isCollective && !!eventType.isRRWeightsEnabled}
              onChange={(value) => writeHosts(value, isCollective)}
              placeholder={t("add_members")}
            />
          </div>
        )}
        {team ? null : <p className="text-subtle mt-3 text-sm">{t("nothing_to_see_here")}</p>}
      </div>
    </div>
  );
};

export default EventTeamAssignmentTab;
