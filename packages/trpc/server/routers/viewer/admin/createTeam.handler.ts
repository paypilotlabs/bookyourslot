import { TeamRepository } from "@calcom/features/team/repositories/TeamRepository";
import { UserRepository } from "@calcom/features/users/repositories/UserRepository";
import prisma from "@calcom/prisma";
import { MembershipRole } from "@calcom/prisma/enums";
import { TRPCError } from "@trpc/server";
import type { TAdminCreateTeamSchema } from "./createTeam.schema";

type CreateTeamOptions = {
  input: TAdminCreateTeamSchema;
};

const handler = async ({ input }: CreateTeamOptions) => {
  const { name, slug, ownerId, memberIds } = input;

  const teamRepo = new TeamRepository(prisma);

  const existing = await teamRepo.findBySlugWithoutParent({ slug });
  if (existing) {
    throw new TRPCError({
      code: "CONFLICT",
      message: `Unable to create team: slug "${slug}" is already used by team ${existing.id} ("${existing.name}")`,
    });
  }

  // The owner is a member too, and asking for them twice is a natural mistake that would
  // otherwise fail on the [userId, teamId] unique constraint with an opaque Prisma error.
  const otherMemberIds = Array.from(new Set(memberIds)).filter((id) => id !== ownerId);
  const requestedIds = [ownerId, ...otherMemberIds];

  const userRepo = new UserRepository(prisma);
  const found = await userRepo.findByIds({ ids: requestedIds });
  if (found.length !== requestedIds.length) {
    const foundIds = new Set(found.map((user) => user.id));
    const missing = requestedIds.filter((id) => !foundIds.has(id));
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Unable to create team: no user with id ${missing.join(", ")}`,
    });
  }

  // accepted: true because this fork has no invitation flow. These memberships are provisioned
  // by an instance admin who has already decided who belongs, and an unaccepted membership is
  // invisible to every consumer that matters: host assignment and the round-robin engine both
  // filter on accepted.
  const team = await teamRepo.createWithMemberships({
    name,
    slug,
    memberships: [
      { userId: ownerId, role: MembershipRole.OWNER, accepted: true },
      ...otherMemberIds.map((userId) => ({
        userId,
        role: MembershipRole.MEMBER,
        accepted: true,
      })),
    ],
  });

  return { team, message: `Team ${team.id} created with ${team.members.length} members` };
};

export default handler;
