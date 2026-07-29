import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSendEmailVerification = vi.fn().mockResolvedValue({ ok: true, skipped: false });
const mockSendAccountApprovedEmail = vi.fn().mockResolvedValue(undefined);
const mockFindBlockedEmail = vi.fn();
const mockDeleteEntry = vi.fn();

vi.mock("@calcom/features/auth/lib/verifyEmail", () => ({
  sendEmailVerification: (...args: unknown[]) => mockSendEmailVerification(...args),
}));
vi.mock("@calcom/emails/auth-email-service", () => ({
  sendAccountApprovedEmail: (...args: unknown[]) => mockSendAccountApprovedEmail(...args),
}));
vi.mock("@calcom/i18n/server", () => ({
  getTranslation: vi.fn().mockResolvedValue((key: string) => key),
}));
vi.mock("@calcom/features/watchlist/lib/repository/GlobalWatchlistRepository", () => ({
  GlobalWatchlistRepository: class {
    findBlockedEmail = mockFindBlockedEmail;
    deleteEntry = mockDeleteEntry;
  },
}));
vi.mock("@calcom/features/watchlist/lib/utils/normalization", () => ({
  normalizeEmail: vi.fn((e: string) => e.toLowerCase()),
}));
vi.mock("@calcom/prisma", () => {
  const mockPrisma = {
    user: {
      update: vi.fn(),
    },
  };
  return { default: mockPrisma, prisma: mockPrisma };
});

import { prisma } from "@calcom/prisma";
import lockUserAccountHandler from "./lockUserAccount.handler";

describe("lockUserAccountHandler", () => {
  const mockUser = {
    id: 1,
    email: "admin@example.com",
    organizationId: null,
    profile: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.user.update).mockResolvedValue({
      id: 42,
      email: "test@example.com",
      username: "testuser",
    } as never);
    mockFindBlockedEmail.mockResolvedValue(null);
    mockDeleteEntry.mockResolvedValue(undefined);
    mockSendEmailVerification.mockResolvedValue({ ok: true, skipped: false });
    mockSendAccountApprovedEmail.mockResolvedValue(undefined);
  });

  // OAuth signups are created with emailVerified already set, so the verification
  // mail is skipped for them. Before the approved-email branch existed they were
  // approved in total silence and never learned they could sign in.
  describe("approving an account whose email is already verified", () => {
    beforeEach(() => {
      vi.mocked(prisma.user.update).mockResolvedValue({
        id: 42,
        email: "oauth@example.com",
        name: "OAuth Business",
        locale: "en",
        username: "oauthbusiness",
        emailVerified: new Date("2026-01-01T00:00:00Z"),
      } as never);
    });

    it("sends the account-approved email instead of a verification email", async () => {
      await lockUserAccountHandler({
        ctx: { user: mockUser as never },
        input: { userId: 42, locked: false },
      });

      expect(mockSendEmailVerification).not.toHaveBeenCalled();
      expect(mockSendAccountApprovedEmail).toHaveBeenCalledTimes(1);
      expect(mockSendAccountApprovedEmail.mock.calls[0][0]).toMatchObject({
        user: { name: "OAuth Business", email: "oauth@example.com" },
      });
    });

    it("does not email anyone when locking rather than approving", async () => {
      await lockUserAccountHandler({
        ctx: { user: mockUser as never },
        input: { userId: 42, locked: true },
      });

      expect(mockSendAccountApprovedEmail).not.toHaveBeenCalled();
      expect(mockSendEmailVerification).not.toHaveBeenCalled();
    });
  });

  it("sends only the verification email when the address is not yet verified", async () => {
    await lockUserAccountHandler({
      ctx: { user: mockUser as never },
      input: { userId: 42, locked: false },
    });

    expect(mockSendEmailVerification).toHaveBeenCalledTimes(1);
    expect(mockSendAccountApprovedEmail).not.toHaveBeenCalled();
  });

  describe("unlocking a user", () => {
    it("should remove watchlist entry when unlocking a user", async () => {
      const watchlistEntry = { id: "watchlist-entry-123" };
      mockFindBlockedEmail.mockResolvedValue(watchlistEntry);

      await lockUserAccountHandler({
        ctx: { user: mockUser as never },
        input: { userId: 42, locked: false },
      });

      expect(mockDeleteEntry).toHaveBeenCalledWith("watchlist-entry-123");
    });

    it("should send verification email after unlocking and removing from watchlist", async () => {
      const watchlistEntry = { id: "watchlist-entry-123" };
      mockFindBlockedEmail.mockResolvedValue(watchlistEntry);

      await lockUserAccountHandler({
        ctx: { user: mockUser as never },
        input: { userId: 42, locked: false },
      });

      expect(mockSendEmailVerification).toHaveBeenCalledWith({
        email: "test@example.com",
        username: "testuser",
      });
    });

    it("should send verification email even when no watchlist entry exists", async () => {
      mockFindBlockedEmail.mockResolvedValue(null);

      await lockUserAccountHandler({
        ctx: { user: mockUser as never },
        input: { userId: 42, locked: false },
      });

      expect(mockDeleteEntry).not.toHaveBeenCalled();
      expect(mockSendEmailVerification).toHaveBeenCalledWith({
        email: "test@example.com",
        username: "testuser",
      });
    });

    it("should call deleteEntry before sendEmailVerification", async () => {
      const callOrder: string[] = [];
      mockFindBlockedEmail.mockResolvedValue({ id: "entry-1" });
      mockDeleteEntry.mockImplementation(async () => {
        callOrder.push("deleteEntry");
      });
      mockSendEmailVerification.mockImplementation(async () => {
        callOrder.push("sendEmailVerification");
        return { ok: true, skipped: false };
      });

      await lockUserAccountHandler({
        ctx: { user: mockUser as never },
        input: { userId: 42, locked: false },
      });

      expect(callOrder).toEqual(["deleteEntry", "sendEmailVerification"]);
    });
  });

  describe("locking a user", () => {
    it("should not remove watchlist entry when locking a user", async () => {
      await lockUserAccountHandler({
        ctx: { user: mockUser as never },
        input: { userId: 42, locked: true },
      });

      expect(mockFindBlockedEmail).not.toHaveBeenCalled();
      expect(mockDeleteEntry).not.toHaveBeenCalled();
    });

    it("should not send verification email when locking a user", async () => {
      await lockUserAccountHandler({
        ctx: { user: mockUser as never },
        input: { userId: 42, locked: true },
      });

      expect(mockSendEmailVerification).not.toHaveBeenCalled();
    });
  });
});
