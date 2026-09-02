import prismaMock from "@calcom/testing/lib/__mocks__/prismaMock";
import { MembershipRole } from "@calcom/prisma/enums";
import { TRPCError } from "@trpc/server";
import { describe, expect, it } from "vitest";
import handler from "./createTeam.handler";

const input = {
  name: "Voxpilot",
  slug: "voxpilot",
  ownerId: 1,
  memberIds: [2, 3],
};

describe("admin.createTeam", () => {
  it("refuses a slug another standalone team already uses", async () => {
    prismaMock.team.findFirst.mockResolvedValue({ id: 7, name: "Taken", slug: "voxpilot" } as never);

    await expect(handler({ input })).rejects.toThrow(TRPCError);
    await expect(handler({ input })).rejects.toThrow(/already used by team 7/);
    expect(prismaMock.team.create).not.toHaveBeenCalled();
  });

  it("names the ids that do not exist rather than failing on a foreign key", async () => {
    prismaMock.team.findFirst.mockResolvedValue(null as never);
    prismaMock.user.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }] as never);

    await expect(handler({ input })).rejects.toThrow(/no user with id 3/);
    expect(prismaMock.team.create).not.toHaveBeenCalled();
  });

  it("makes the owner an OWNER once, even when they are also listed as a member", async () => {
    prismaMock.team.findFirst.mockResolvedValue(null as never);
    prismaMock.user.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }] as never);
    prismaMock.team.create.mockResolvedValue({
      id: 9,
      name: "Voxpilot",
      slug: "voxpilot",
      members: [],
    } as never);

    // The owner appears in memberIds too, which would otherwise violate @@unique([userId, teamId]).
    await handler({ input: { ...input, memberIds: [2, 2, 1] } });

    const created = prismaMock.team.create.mock.calls[0][0].data.members.create;
    expect(created).toEqual([
      { userId: 1, role: MembershipRole.OWNER, accepted: true },
      { userId: 2, role: MembershipRole.MEMBER, accepted: true },
    ]);
  });
});
