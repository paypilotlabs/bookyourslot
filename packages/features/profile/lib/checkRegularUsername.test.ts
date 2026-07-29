import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFindByUsernameAndOrganizationId = vi.fn();
const mockFindManyByOrgSlugOrRequestedSlug = vi.fn();
const mockIsUsernameReservedDueToMigration = vi.fn();

vi.mock("@calcom/features/di/containers/UserRepository", () => ({
  getUserRepository: () => ({
    findByUsernameAndOrganizationId: (...args: unknown[]) => mockFindByUsernameAndOrganizationId(...args),
  }),
}));
vi.mock("@calcom/features/profile/repositories/ProfileRepository", () => ({
  ProfileRepository: {
    findManyByOrgSlugOrRequestedSlug: (...args: unknown[]) => mockFindManyByOrgSlugOrRequestedSlug(...args),
  },
}));
vi.mock("@calcom/lib/server/username", () => ({
  isUsernameReservedDueToMigration: (...args: unknown[]) => mockIsUsernameReservedDueToMigration(...args),
}));

import { checkRegularUsername } from "./checkRegularUsername";

describe("checkRegularUsername", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsUsernameReservedDueToMigration.mockResolvedValue(false);
    mockFindByUsernameAndOrganizationId.mockResolvedValue(null);
    mockFindManyByOrgSlugOrRequestedSlug.mockResolvedValue([]);
  });

  it("reports a taken username as unavailable", async () => {
    mockFindByUsernameAndOrganizationId.mockResolvedValue({ id: 7 });

    const result = await checkRegularUsername("smiledental");

    expect(result.available).toBe(false);
  });

  it("reports a free username as available", async () => {
    const result = await checkRegularUsername("smiledental");

    expect(result.available).toBe(true);
  });

  // The endpoint used to consult profiles only, which are never populated outside
  // an organization, so every username looked free and the collision surfaced
  // only after the signup form was submitted.
  it("checks the global namespace when there is no organization", async () => {
    await checkRegularUsername("smiledental");

    expect(mockFindByUsernameAndOrganizationId).toHaveBeenCalledWith({
      username: "smiledental",
      organizationId: null,
    });
  });

  it("slugifies before checking, so equivalent inputs collide", async () => {
    await checkRegularUsername("Smile Dental");

    expect(mockFindByUsernameAndOrganizationId).toHaveBeenCalledWith({
      username: "smile-dental",
      organizationId: null,
    });
  });

  it("still honours reserved-by-migration usernames", async () => {
    mockIsUsernameReservedDueToMigration.mockResolvedValue(true);

    const result = await checkRegularUsername("smiledental");

    expect(result.available).toBe(false);
  });

  it("uses profiles rather than the global namespace inside an organization", async () => {
    mockFindManyByOrgSlugOrRequestedSlug.mockResolvedValue([{ user: { id: 3 } }]);

    const result = await checkRegularUsername("smiledental", "acme");

    expect(result.available).toBe(false);
    expect(mockFindByUsernameAndOrganizationId).not.toHaveBeenCalled();
  });
});
