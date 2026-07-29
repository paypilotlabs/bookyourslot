import process from "node:process";
import { getUserRepository } from "@calcom/features/di/containers/UserRepository";
import { ProfileRepository } from "@calcom/features/profile/repositories/ProfileRepository";
import { isUsernameReservedDueToMigration } from "@calcom/lib/server/username";
import slugify from "@calcom/lib/slugify";

export async function checkRegularUsername(_username: string, currentOrgDomain?: string | null) {
  const isCheckingUsernameInGlobalNamespace = !currentOrgDomain;
  const username = slugify(_username);

  const premium = !!process.env.NEXT_PUBLIC_IS_E2E && username.length < 5;

  const profiles = currentOrgDomain
    ? await ProfileRepository.findManyByOrgSlugOrRequestedSlug({
        orgSlug: currentOrgDomain,
        usernames: [username],
      })
    : null;

  // Outside an organization there are no profiles to consult, so the global
  // namespace has to be checked against the users themselves. Without this the
  // endpoint reported every username as available and the collision only
  // surfaced when the unique index rejected the finished signup form.
  const user = isCheckingUsernameInGlobalNamespace
    ? await getUserRepository().findByUsernameAndOrganizationId({ username, organizationId: null })
    : (profiles?.[0]?.user ?? null);

  if (user) {
    return {
      available: false as const,
      premium,
      message: "A user exists with that username",
    };
  }

  const isUsernameAvailable = isCheckingUsernameInGlobalNamespace
    ? !(await isUsernameReservedDueToMigration(username))
    : true;

  return {
    available: isUsernameAvailable,
    premium,
  };
}
