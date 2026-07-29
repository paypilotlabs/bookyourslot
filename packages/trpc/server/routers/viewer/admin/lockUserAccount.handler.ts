import { sendAccountApprovedEmail } from "@calcom/emails/auth-email-service";
import { sendEmailVerification } from "@calcom/features/auth/lib/verifyEmail";
import { GlobalWatchlistRepository } from "@calcom/features/watchlist/lib/repository/GlobalWatchlistRepository";
import { normalizeEmail } from "@calcom/features/watchlist/lib/utils/normalization";
import { getTranslation } from "@calcom/i18n/server";
import { WEBAPP_URL } from "@calcom/lib/constants";
import { prisma } from "@calcom/prisma";
import type { TrpcSessionUser } from "../../../types";
import type { TAdminLockUserAccountSchema } from "./lockUserAccount.schema";

type GetOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TAdminLockUserAccountSchema;
};

const lockUserAccountHandler = async ({ input }: GetOptions) => {
  const { userId, locked } = input;

  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      locked,
    },
    select: {
      id: true,
      email: true,
      name: true,
      locale: true,
      username: true,
      emailVerified: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (!locked) {
    const globalWatchlistRepo = new GlobalWatchlistRepository(prisma);
    const normalizedEmail = normalizeEmail(user.email);
    const watchlistEntry = await globalWatchlistRepo.findBlockedEmail(normalizedEmail);
    if (watchlistEntry) {
      await globalWatchlistRepo.deleteEntry(watchlistEntry.id);
    }

    // Unlocking is the approval step, and this is the only mail the applicant
    // receives: signup deliberately sends nothing, because a verification link
    // issued while the account is still pending leads nowhere. Sent here, the
    // link works and doubles as "you are approved".
    if (!user.emailVerified) {
      await sendEmailVerification({
        email: user.email,
        username: user.username || "",
      });
    } else {
      // OAuth signups arrive with emailVerified already set, so the branch above
      // never fires for them. Without this one an approved Google or Microsoft
      // business is never told it can sign in, and goes dark permanently.
      const t = await getTranslation(user.locale ?? "en", "common");
      await sendAccountApprovedEmail({
        language: t,
        user: { name: user.name, email: user.email },
        loginLink: `${WEBAPP_URL}/auth/login`,
      });
    }
  }

  return {
    success: true,
    userId,
    locked,
  };
};

export default lockUserAccountHandler;
