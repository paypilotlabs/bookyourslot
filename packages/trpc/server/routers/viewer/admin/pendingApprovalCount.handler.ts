import { prisma } from "@calcom/prisma";

/**
 * Number of accounts waiting for an admin to approve them.
 *
 * Signups are created with `locked: true` and an admin approves by unlocking,
 * so a locked user is a pending one. `prisma.user.count` is deliberately used
 * here: excludeLockedUsersExtension only wraps the find* methods, so `count`
 * sees locked rows without needing the OR trick that listUsers relies on.
 */
const pendingApprovalCountHandler = async () => {
  return prisma.user.count({ where: { locked: true } });
};

export default pendingApprovalCountHandler;
