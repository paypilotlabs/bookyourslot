"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { UserPermissionRole } from "@calcom/prisma/enums";
import { trpc } from "@calcom/trpc/react";
import { Badge } from "@calcom/ui/components/badge";
import Link from "next/link";
import { useSession } from "next-auth/react";

/**
 * Admin-only count of signups waiting for approval, shown next to the other
 * shell actions. Follows UnconfirmedBookingBadge: a count query rendered as a
 * Badge inside a Link, returning null when there is nothing to act on.
 *
 * There is no realtime transport in this app, so "live" is polling on the same
 * cadence the Calendar and Bookings views already use.
 */
export default function PendingApprovalsBadge() {
  const { t } = useLocale();
  const { data: session } = useSession();
  const isAdmin = session?.user.role === UserPermissionRole.ADMIN;

  const { data: pendingCount } = trpc.viewer.admin.pendingApprovalCount.useQuery(undefined, {
    // Never fetch for non-admins: the procedure is admin-gated server side and
    // would throw UNAUTHORIZED for everyone else.
    enabled: isAdmin,
    staleTime: 25 * 1000,
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: true,
  });

  if (!isAdmin || !pendingCount) return null;

  return (
    <Link href="/settings/admin/users?pending=1" aria-label={t("pending_approvals_tooltip")}>
      <Badge
        rounded
        title={t("pending_approvals_tooltip")}
        variant="orange"
        className="cursor-pointer hover:bg-orange-800 hover:text-orange-100">
        {pendingCount}
      </Badge>
    </Link>
  );
}
