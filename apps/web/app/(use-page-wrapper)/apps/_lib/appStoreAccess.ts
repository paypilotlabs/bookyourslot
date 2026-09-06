import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { UserPermissionRole } from "@calcom/prisma/enums";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { cookies, headers } from "next/headers";

/**
 * BookYourSlot is sold as a managed service: the operator decides which integrations
 * a client gets, and the client never browses for them. The app store is therefore
 * admin-only, which also removes three cards that were actively misleading anyone who
 * found them. Stripe advertises payments the webhook cannot complete, "BAA for HIPAA"
 * is a paid link to a different company and would read to a doctor as a compliance
 * claim, and WhatsApp reads as reminders when it only attaches a chat link.
 *
 * One category stays open to clients, and it has to. Google requires the account
 * holder to click consent, so a calendar connection is the single thing that cannot
 * be done on a client's behalf however much else is managed for them.
 */
export const CLIENT_BROWSABLE_CATEGORY = "calendar";

export async function isAppStoreAdmin(): Promise<boolean> {
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });
  return session?.user?.role === UserPermissionRole.ADMIN;
}

/** True when a client may open this app's page without being an admin. */
export function isClientBrowsableApp(app: { categories?: string[]; variant?: string } | undefined): boolean {
  if (!app) return false;
  return (
    app.categories?.includes(CLIENT_BROWSABLE_CATEGORY) === true || app.variant === CLIENT_BROWSABLE_CATEGORY
  );
}
