import type { PrismaClient } from "@calcom/prisma";
import type { MembershipRole } from "@calcom/prisma/enums";

type MembershipSeed = {
  userId: number;
  role: MembershipRole;
  accepted: boolean;
};

export class TeamRepository {
  constructor(private prismaClient: PrismaClient) {}

  /**
   * Standalone teams all carry parentId null, and Postgres treats nulls as distinct in a unique
   * index, so @@unique([slug, parentId]) does not stop two of them sharing a slug. The public
   * booking lookup resolves a team by slug alone, so a duplicate would silently resolve to
   * whichever row the query happened to return first. Callers check this before creating.
   */
  async findBySlugWithoutParent({ slug }: { slug: string }) {
    return this.prismaClient.team.findFirst({
      where: { slug, parentId: null },
      select: { id: true, name: true, slug: true },
    });
  }

  async createWithMemberships({
    name,
    slug,
    memberships,
  }: {
    name: string;
    slug: string;
    memberships: MembershipSeed[];
  }) {
    return this.prismaClient.team.create({
      data: {
        name,
        slug,
        members: { create: memberships },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        members: {
          select: { userId: true, role: true, accepted: true },
        },
      },
    });
  }
}
