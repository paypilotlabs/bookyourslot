import process from "node:process";
import { IdentityProvider, UserPermissionRole } from "@calcom/prisma/enums";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ErrorCode } from "./ErrorCode";

// Mock dependencies
vi.mock("@calcom/prisma", () => ({
  prisma: {
    user: {
      update: vi.fn(),
    },
  },
  default: {
    user: {
      update: vi.fn(),
    },
  },
}));

const mockFindByEmailAndIncludeProfilesAndPassword = vi.fn();

vi.mock("@calcom/features/users/repositories/UserRepository", () => {
  return {
    UserRepository: vi.fn().mockImplementation(function () {
      return {
        findByEmailAndIncludeProfilesAndPassword: mockFindByEmailAndIncludeProfilesAndPassword,
      };
    }),
  };
});

vi.mock("./verifyPassword", () => ({
  verifyPassword: vi.fn(),
}));

vi.mock("@calcom/lib/checkRateLimitAndThrowError", () => ({
  checkRateLimitAndThrowError: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@calcom/lib/server/PiiHasher", () => ({
  hashEmail: vi.fn((email: string) => `hashed_${email}`),
}));

vi.mock("@calcom/lib/totp", () => ({
  totpAuthenticatorCheck: vi.fn(),
}));

vi.mock("@calcom/lib/crypto", () => ({
  symmetricDecrypt: vi.fn(),
  symmetricEncrypt: vi.fn(),
}));

vi.mock("@calcom/lib/auth/isPasswordValid", () => ({
  isPasswordValid: vi.fn(),
}));

vi.mock("@calcom/lib/env", () => ({
  isENVDev: false,
}));

vi.mock("@calcom/lib/constants", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@calcom/lib/constants")>();
  return {
    ...actual,
    IS_TEAM_BILLING_ENABLED: false,
    ENABLE_PROFILE_SWITCHER: false,
    WEBAPP_URL: "http://localhost:3000",
  };
});

vi.mock("@calcom/lib/logger", () => ({
  default: {
    getSubLogger: vi.fn(() => ({
      debug: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
    })),
  },
}));

vi.mock("@calcom/lib/safeStringify", () => ({
  safeStringify: vi.fn((obj) => JSON.stringify(obj)),
}));

vi.mock("./next-auth-custom-adapter", () => ({
  default: vi.fn(() => ({
    linkAccount: vi.fn(),
  })),
}));

vi.mock("@calcom/i18n/server", () => ({
  getTranslation: vi.fn().mockResolvedValue((key: string) => key),
}));

vi.mock("@calcom/features/profile/repositories/ProfileRepository", () => ({
  ProfileRepository: {
    findAllProfilesForUserIncludingMovedUser: vi.fn(),
    findByUpIdWithAuth: vi.fn(),
  },
}));

// Additional mocks for signIn/JWT callback tests
const mockCredentialRepoFindFirst = vi.fn();
const mockCredentialRepoFindFirstByUserIdAndType = vi.fn();
const mockCredentialRepoCreate = vi.fn();
const mockBuildCredentialCreateData = vi.fn();
const mockUpdateProfilePhotoGoogle = vi.fn();
const mockGetIdentityProvider = vi.fn();
const mockWaitUntil = vi.fn();
const mockPrismaUserFindFirst = vi.fn();
const mockPrismaUserCreate = vi.fn();
const mockPrismaUserUpdate = vi.fn();
const mockPrismaTeamFindFirst = vi.fn();
const mockPrismaSelectedCalendarCreate = vi.fn();
const mockLinkAccount = vi.fn();

vi.mock("@calcom/features/credentials/repositories/CredentialRepository", () => ({
  CredentialRepository: {
    findFirstByAppIdAndUserId: (...args: unknown[]) => mockCredentialRepoFindFirst(...args),
    findFirstByUserIdAndType: (...args: unknown[]) => mockCredentialRepoFindFirstByUserIdAndType(...args),
    create: (...args: unknown[]) => mockCredentialRepoCreate(...args),
  },
}));

vi.mock("@calcom/features/credentials/services/CredentialDataService", () => ({
  buildCredentialCreateData: (...args: unknown[]) => mockBuildCredentialCreateData(...args),
}));

vi.mock("@calcom/app-store/_utils/oauth/updateProfilePhotoGoogle", () => ({
  updateProfilePhotoGoogle: (...args: unknown[]) => mockUpdateProfilePhotoGoogle(...args),
}));

vi.mock("@calcom/features/auth/lib/identityProviders", () => ({
  getIdentityProvider: (...args: unknown[]) => mockGetIdentityProvider(...args),
}));

vi.mock("@vercel/functions", () => ({
  waitUntil: (...args: unknown[]) => mockWaitUntil(...args),
}));

vi.mock("@calcom/lib/default-cookies", () => ({
  defaultCookies: vi.fn(() => ({})),
}));

vi.mock("@calcom/lib/random", () => ({
  randomString: vi.fn(() => "abc123"),
}));

vi.mock("@calcom/lib/slugify", () => ({
  default: vi.fn((s: string) => s.toLowerCase().replace(/\s+/g, "-")),
}));

vi.mock("@calcom/app-store/googlecalendar/lib/CalendarService", () => ({
  createGoogleCalendarServiceWithGoogleType: vi.fn(),
}));

vi.mock("googleapis-common", () => ({
  OAuth2Client: vi.fn(),
}));

vi.mock("@googleapis/calendar", () => ({
  calendar_v3: {
    Calendar: vi.fn(),
  },
}));

vi.mock("next-auth/jwt", () => ({
  encode: vi.fn(),
}));

vi.mock("./signJwt", () => ({
  default: vi.fn().mockResolvedValue("mock-jwt"),
}));

vi.mock("./dub", () => ({
  dub: { track: { lead: vi.fn() } },
}));

vi.mock("../signup/utils/getOrgUsernameFromEmail", () => ({
  getOrgUsernameFromEmail: vi.fn((email: string) => email.split("@")[0]),
}));

vi.mock("next-auth/providers/credentials", () => ({ default: vi.fn(() => ({ id: "credentials" })) }));
vi.mock("next-auth/providers/email", () => ({ default: vi.fn() }));
vi.mock("next-auth/providers/google", () => ({ default: vi.fn() }));

describe("CredentialsProvider authorize", () => {
  let authorizeCredentials: typeof import("./next-auth-options").authorizeCredentials;
  let verifyPassword: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockFindByEmailAndIncludeProfilesAndPassword.mockReset();

    const verifyPasswordModule = await import("./verifyPassword");
    verifyPassword = verifyPasswordModule.verifyPassword;

    // Import the exported authorize function directly
    const authModule = await import("./next-auth-options");
    authorizeCredentials = authModule.authorizeCredentials;
  });

  const createMockUser = (overrides: Partial<any> = {}) => ({
    id: 1,
    email: "test@example.com",
    name: "Test User",
    username: "testuser",
    role: UserPermissionRole.USER,
    locked: false,
    identityProvider: IdentityProvider.CAL,
    twoFactorEnabled: false,
    twoFactorSecret: null,
    backupCodes: null,
    password: {
      hash: "$2a$10$hashedpassword",
    },
    allProfiles: [
      {
        id: 1,
        upId: "usr_123",
        username: "testuser",
      },
    ],
    teams: [],
    ...overrides,
  });

  // A pending (locked) account must be indistinguishable from a wrong password
  // and from an address that has no account at all. Anything else lets an
  // attacker enumerate which addresses are registered without knowing a
  // password, which is the signal a brute-forcer is actually after.
  describe("Account enumeration", () => {
    it("gives a locked account the same error as a wrong password", async () => {
      const mockUser = createMockUser({ locked: true });
      mockFindByEmailAndIncludeProfilesAndPassword.mockResolvedValue(mockUser);

      await expect(
        authorizeCredentials({ email: "pending@example.com", password: "whatever" } as any)
      ).rejects.toThrow(ErrorCode.IncorrectEmailPassword);
    });

    it("never leaks that a locked account exists", async () => {
      const mockUser = createMockUser({ locked: true });
      mockFindByEmailAndIncludeProfilesAndPassword.mockResolvedValue(mockUser);

      await expect(
        authorizeCredentials({ email: "pending@example.com", password: "whatever" } as any)
      ).rejects.not.toThrow(ErrorCode.UserAccountLocked);
    });

    it("gives an unknown address the same error too", async () => {
      mockFindByEmailAndIncludeProfilesAndPassword.mockResolvedValue(null);

      await expect(
        authorizeCredentials({ email: "nobody@example.com", password: "whatever" } as any)
      ).rejects.toThrow(ErrorCode.IncorrectEmailPassword);
    });

    // Same message is not enough on its own. Bcrypt at cost 12 takes ~220ms, so
    // a path that skips the compare answers in microseconds and response time
    // becomes the oracle the message no longer is. Every rejection has to spend
    // the compare, even the ones with no hash of their own to check.
    it.each([
      ["an unknown address", null],
      ["a pending account", { locked: true }],
      ["a social-login-only account", { password: null }],
    ])("still runs a password compare for %s", async (_label, overrides) => {
      mockFindByEmailAndIncludeProfilesAndPassword.mockResolvedValue(
        overrides === null ? null : createMockUser(overrides)
      );

      await expect(
        authorizeCredentials({ email: "probe@example.com", password: "whatever" } as any)
      ).rejects.toThrow(ErrorCode.IncorrectEmailPassword);

      expect(verifyPassword).toHaveBeenCalledTimes(1);
    });
  });

  describe("Password validation", () => {
    it("should throw error when user has no password hash with CAL identity provider", async () => {
      const mockUser = createMockUser({
        password: null,
        identityProvider: IdentityProvider.CAL,
      });
      mockFindByEmailAndIncludeProfilesAndPassword.mockResolvedValue(mockUser);

      await expect(
        authorizeCredentials({
          email: "test@example.com",
          password: "password123",
        } as any)
      ).rejects.toThrow(ErrorCode.IncorrectEmailPassword);
    });

    it("should throw error when user has no password hash with Google identity provider", async () => {
      const mockUser = createMockUser({
        password: null,
        identityProvider: IdentityProvider.GOOGLE,
      });
      mockFindByEmailAndIncludeProfilesAndPassword.mockResolvedValue(mockUser);

      await expect(
        authorizeCredentials({
          email: "test@example.com",
          password: "password123",
        } as any)
      ).rejects.toThrow(ErrorCode.IncorrectEmailPassword);
    });

    it("should throw error when user has no password hash with SAML identity provider", async () => {
      const mockUser = createMockUser({
        password: null,
        identityProvider: IdentityProvider.SAML,
      });
      mockFindByEmailAndIncludeProfilesAndPassword.mockResolvedValue(mockUser);

      await expect(
        authorizeCredentials({
          email: "test@example.com",
          password: "password123",
        } as any)
      ).rejects.toThrow(ErrorCode.IncorrectEmailPassword);
    });

    it("should throw error when user has no password hash even with TOTP code provided", async () => {
      const mockUser = createMockUser({
        password: null,
        identityProvider: IdentityProvider.CAL,
      });
      mockFindByEmailAndIncludeProfilesAndPassword.mockResolvedValue(mockUser);

      await expect(
        authorizeCredentials({
          email: "test@example.com",
          password: "password123",
          totpCode: "123456",
        } as any)
      ).rejects.toThrow(ErrorCode.IncorrectEmailPassword);
    });

    it("should throw error when user has no password hash with Google identity provider and TOTP code", async () => {
      const mockUser = createMockUser({
        password: null,
        identityProvider: IdentityProvider.GOOGLE,
      });
      mockFindByEmailAndIncludeProfilesAndPassword.mockResolvedValue(mockUser);

      await expect(
        authorizeCredentials({
          email: "test@example.com",
          password: "password123",
          totpCode: "123456",
        } as any)
      ).rejects.toThrow(ErrorCode.IncorrectEmailPassword);
    });

    it("should throw error when user has no password hash with SAML identity provider and TOTP code", async () => {
      const mockUser = createMockUser({
        password: null,
        identityProvider: IdentityProvider.SAML,
      });
      mockFindByEmailAndIncludeProfilesAndPassword.mockResolvedValue(mockUser);

      await expect(
        authorizeCredentials({
          email: "test@example.com",
          password: "password123",
          totpCode: "123456",
        } as any)
      ).rejects.toThrow(ErrorCode.IncorrectEmailPassword);
    });
  });

  describe("Inactive admin reason", () => {
    it("sets reason to 'both' when password is invalid and 2FA is disabled", async () => {
      const { isPasswordValid } = await import("@calcom/lib/auth/isPasswordValid");
      vi.mocked(isPasswordValid).mockReturnValue(false);
      vi.mocked(verifyPassword).mockResolvedValue(true);

      const mockUser = createMockUser({
        role: UserPermissionRole.ADMIN,
        identityProvider: IdentityProvider.CAL,
        twoFactorEnabled: false,
      });
      mockFindByEmailAndIncludeProfilesAndPassword.mockResolvedValue(mockUser);

      const result = await authorizeCredentials({
        email: mockUser.email,
        password: "password123",
        totpCode: "",
        backupCode: "",
      });

      expect(result?.role).toBe("INACTIVE_ADMIN");
      expect(result?.inactiveAdminReason).toBe("both");
    });

    it("sets reason to '2fa' when password is valid and 2FA is disabled", async () => {
      const { isPasswordValid } = await import("@calcom/lib/auth/isPasswordValid");
      vi.mocked(isPasswordValid).mockReturnValue(true);
      vi.mocked(verifyPassword).mockResolvedValue(true);

      const mockUser = createMockUser({
        role: UserPermissionRole.ADMIN,
        identityProvider: IdentityProvider.CAL,
        twoFactorEnabled: false,
      });
      mockFindByEmailAndIncludeProfilesAndPassword.mockResolvedValue(mockUser);

      const result = await authorizeCredentials({
        email: mockUser.email,
        password: "password123",
        totpCode: "",
        backupCode: "",
      });

      expect(result?.role).toBe("INACTIVE_ADMIN");
      expect(result?.inactiveAdminReason).toBe("2fa");
    });

    it("sets reason to 'password' when password is invalid and 2FA is enabled", async () => {
      const originalKey = process.env.CALENDSO_ENCRYPTION_KEY;
      process.env.CALENDSO_ENCRYPTION_KEY = "test";

      try {
        const { isPasswordValid } = await import("@calcom/lib/auth/isPasswordValid");
        vi.mocked(isPasswordValid).mockReturnValue(false);
        vi.mocked(verifyPassword).mockResolvedValue(true);

        const { symmetricDecrypt } = await import("@calcom/lib/crypto");
        vi.mocked(symmetricDecrypt).mockReturnValue("a".repeat(32));

        const { totpAuthenticatorCheck } = await import("@calcom/lib/totp");
        vi.mocked(totpAuthenticatorCheck).mockReturnValue(true);

        const mockUser = createMockUser({
          role: UserPermissionRole.ADMIN,
          identityProvider: IdentityProvider.CAL,
          twoFactorEnabled: true,
          twoFactorSecret: "encrypted_secret",
        });
        mockFindByEmailAndIncludeProfilesAndPassword.mockResolvedValue(mockUser);

        const result = await authorizeCredentials({
          email: mockUser.email,
          password: "password123",
          totpCode: "123456",
          backupCode: "",
        });

        expect(result?.role).toBe("INACTIVE_ADMIN");
        expect(result?.inactiveAdminReason).toBe("password");
      } finally {
        process.env.CALENDSO_ENCRYPTION_KEY = originalKey;
      }
    });

    it("does not set inactiveAdminReason when admin requirements are met", async () => {
      const originalKey = process.env.CALENDSO_ENCRYPTION_KEY;
      process.env.CALENDSO_ENCRYPTION_KEY = "test";

      try {
        const { isPasswordValid } = await import("@calcom/lib/auth/isPasswordValid");
        vi.mocked(isPasswordValid).mockReturnValue(true);
        vi.mocked(verifyPassword).mockResolvedValue(true);

        const { symmetricDecrypt } = await import("@calcom/lib/crypto");
        vi.mocked(symmetricDecrypt).mockReturnValue("a".repeat(32));

        const { totpAuthenticatorCheck } = await import("@calcom/lib/totp");
        vi.mocked(totpAuthenticatorCheck).mockReturnValue(true);

        const mockUser = createMockUser({
          role: UserPermissionRole.ADMIN,
          identityProvider: IdentityProvider.CAL,
          twoFactorEnabled: true,
          twoFactorSecret: "encrypted_secret",
        });
        mockFindByEmailAndIncludeProfilesAndPassword.mockResolvedValue(mockUser);

        const result = await authorizeCredentials({
          email: mockUser.email,
          password: "password123",
          totpCode: "123456",
          backupCode: "",
        });

        expect(result?.role).toBe(UserPermissionRole.ADMIN);
        expect(result?.inactiveAdminReason).toBeUndefined();
      } finally {
        process.env.CALENDSO_ENCRYPTION_KEY = originalKey;
      }
    });
  });
});

describe("Azure AD signIn callback", () => {
  let getOptions: typeof import("./next-auth-options").getOptions;
  let signInCallback: NonNullable<ReturnType<typeof getOptions>["callbacks"]>["signIn"];

  beforeEach(async () => {
    vi.clearAllMocks();
    mockGetIdentityProvider.mockImplementation((provider: string) => {
      const map: Record<string, string> = {
        "azure-ad": "AZUREAD",
        google: "GOOGLE",
        saml: "SAML",
        "saml-idp": "SAML",
        cal: "CAL",
      };
      return map[provider] ?? null;
    });

    // Mock prisma methods used in signIn callback
    const prismaModule = await import("@calcom/prisma");
    const prismaDefault = (prismaModule as any).default;
    prismaDefault.user = {
      ...prismaDefault.user,
      findFirst: mockPrismaUserFindFirst,
      create: mockPrismaUserCreate,
      update: mockPrismaUserUpdate,
    };
    prismaDefault.team = {
      findFirst: mockPrismaTeamFindFirst,
    };
    prismaDefault.selectedCalendar = {
      create: mockPrismaSelectedCalendarCreate,
    };

    mockPrismaUserFindFirst.mockResolvedValue(null);
    mockPrismaUserCreate.mockResolvedValue({ id: 100, email: "new@example.com", twoFactorEnabled: false });
    mockPrismaUserUpdate.mockResolvedValue({});
    mockPrismaTeamFindFirst.mockResolvedValue(null);

    // Setup mock adapter
    const adapterModule = await import("./next-auth-custom-adapter");
    (adapterModule.default as any).mockReturnValue({ linkAccount: mockLinkAccount });
    mockLinkAccount.mockResolvedValue(undefined);

    mockWaitUntil.mockImplementation((p: Promise<any>) => p.catch(() => {}));

    const authModule = await import("./next-auth-options");
    getOptions = authModule.getOptions;
    const options = getOptions({ getDubId: () => undefined, getTrackingData: () => ({}) as any });
    signInCallback = options.callbacks!.signIn! as any;
  });

  describe("Azure AD email verification (xms_edov)", () => {
    const baseParams = {
      user: { id: "1", email: "user@example.com", name: "User", emailVerified: null },
      account: {
        provider: "azure-ad",
        providerAccountId: "azure-123",
        type: "oauth" as const,
      },
      credentials: undefined,
      email: undefined,
    };

    it("allows login when xms_edov is true (boolean)", async () => {
      mockPrismaUserFindFirst.mockResolvedValue({
        id: 1,
        email: "user@example.com",
        accounts: [{ provider: "azure-ad" }],
        twoFactorEnabled: false,
        identityProvider: "AZUREAD",
      });

      const result = await signInCallback({
        ...baseParams,
        profile: { email_verified: false, xms_edov: true } as any,
      } as any);

      expect(result).toBe(true);
    });

    it("allows login when xms_edov is string 'true'", async () => {
      mockPrismaUserFindFirst.mockResolvedValue({
        id: 1,
        email: "user@example.com",
        accounts: [{ provider: "azure-ad" }],
        twoFactorEnabled: false,
        identityProvider: "AZUREAD",
      });

      const result = await signInCallback({
        ...baseParams,
        profile: { xms_edov: "true" } as any,
      } as any);

      expect(result).toBe(true);
    });

    it("allows login when xms_edov is string '1'", async () => {
      mockPrismaUserFindFirst.mockResolvedValue({
        id: 1,
        email: "user@example.com",
        accounts: [{ provider: "azure-ad" }],
        twoFactorEnabled: false,
        identityProvider: "AZUREAD",
      });

      const result = await signInCallback({
        ...baseParams,
        profile: { xms_edov: "1" } as any,
      } as any);

      expect(result).toBe(true);
    });

    it("allows login when xms_edov is number 1", async () => {
      mockPrismaUserFindFirst.mockResolvedValue({
        id: 1,
        email: "user@example.com",
        accounts: [{ provider: "azure-ad" }],
        twoFactorEnabled: false,
        identityProvider: "AZUREAD",
      });

      const result = await signInCallback({
        ...baseParams,
        profile: { xms_edov: 1 } as any,
      } as any);

      expect(result).toBe(true);
    });

    it("rejects login when xms_edov is false", async () => {
      const result = await signInCallback({
        ...baseParams,
        profile: { xms_edov: false } as any,
      } as any);

      expect(result).toBe("/auth/error?error=unverified-email");
    });

    it("rejects login when xms_edov is undefined", async () => {
      const result = await signInCallback({
        ...baseParams,
        profile: {} as any,
      } as any);

      expect(result).toBe("/auth/error?error=unverified-email");
    });

    it("rejects login when xms_edov is 0", async () => {
      const result = await signInCallback({
        ...baseParams,
        profile: { xms_edov: 0 } as any,
      } as any);

      expect(result).toBe("/auth/error?error=unverified-email");
    });

    it("rejects login when xms_edov is string '0'", async () => {
      const result = await signInCallback({
        ...baseParams,
        profile: { xms_edov: "0" } as any,
      } as any);

      expect(result).toBe("/auth/error?error=unverified-email");
    });

    it("allows non-AZUREAD with email_verified=true", async () => {
      mockPrismaUserFindFirst.mockResolvedValue({
        id: 1,
        email: "user@example.com",
        accounts: [{ provider: "google" }],
        twoFactorEnabled: false,
        identityProvider: "GOOGLE",
      });

      const result = await signInCallback({
        user: { id: "1", email: "user@example.com", name: "User", emailVerified: null },
        account: { provider: "google", providerAccountId: "google-123", type: "oauth" as const },
        profile: { email_verified: true } as any,
        credentials: undefined,
        email: undefined,
      } as any);

      expect(result).toBe(true);
    });

    it("rejects non-AZUREAD with email_verified=false", async () => {
      const result = await signInCallback({
        user: { id: "1", email: "user@example.com", name: "User", emailVerified: null },
        account: { provider: "google", providerAccountId: "google-123", type: "oauth" as const },
        profile: { email_verified: false } as any,
        credentials: undefined,
        email: undefined,
      } as any);

      expect(result).toBe("/auth/error?error=unverified-email");
    });
  });

  describe("Azure AD identity provider conversion (signIn callback)", () => {
    it("CAL user with verified email converts to AZUREAD on Azure AD login", async () => {
      // No existing user with AZUREAD identity
      mockPrismaUserFindFirst
        .mockResolvedValueOnce(null) // First call: lookup by identityProvider + providerAccountId
        .mockResolvedValueOnce(null) // Legacy lookup
        .mockResolvedValueOnce({
          // Lookup by email
          id: 50,
          email: "user@example.com",
          emailVerified: new Date(),
          identityProvider: "CAL",
          password: { hash: "hashed" },
          twoFactorEnabled: false,
        });

      const result = await signInCallback({
        user: { id: "1", email: "user@example.com", name: "User", emailVerified: null },
        account: { provider: "azure-ad", providerAccountId: "azure-conv-1", type: "oauth" as const },
        profile: { xms_edov: true } as any,
        credentials: undefined,
        email: undefined,
      } as any);

      expect(mockPrismaUserUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            identityProvider: "AZUREAD",
            identityProviderId: "azure-conv-1",
          }),
        })
      );
      expect(result).toBe(true);
    });

    it("GOOGLE user auto-merges on Azure AD login when email is verified", async () => {
      mockPrismaUserFindFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(null).mockResolvedValueOnce({
        id: 51,
        email: "user@example.com",
        emailVerified: new Date(),
        identityProvider: "GOOGLE",
        password: null,
        twoFactorEnabled: false,
      });

      const result = await signInCallback({
        user: { id: "1", email: "user@example.com", name: "User", emailVerified: null },
        account: { provider: "azure-ad", providerAccountId: "azure-conv-2", type: "oauth" as const },
        profile: { xms_edov: true } as any,
        credentials: undefined,
        email: undefined,
      } as any);

      // With isVerified=true and non-CAL provider, auto-merge path is taken (returns true directly)
      expect(result).toBe(true);
    });

    it("AZUREAD user auto-merges on Google login when email is verified", async () => {
      mockPrismaUserFindFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(null).mockResolvedValueOnce({
        id: 52,
        email: "user@example.com",
        emailVerified: new Date(),
        identityProvider: "AZUREAD",
        password: null,
        twoFactorEnabled: false,
      });

      const result = await signInCallback({
        user: { id: "1", email: "user@example.com", name: "User", emailVerified: null },
        account: { provider: "google", providerAccountId: "google-conv-1", type: "oauth" as const },
        profile: { email_verified: true } as any,
        credentials: undefined,
        email: undefined,
      } as any);

      // With isVerified=true and non-CAL provider, auto-merge path is taken (returns true directly)
      expect(result).toBe(true);
    });

    it("unverified CAL account blocks Azure AD linking (anti-hijack)", async () => {
      mockPrismaUserFindFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: 53,
          email: "user@example.com",
          emailVerified: null,
          identityProvider: "CAL",
          password: { hash: "hashed" },
          twoFactorEnabled: false,
        });

      const result = await signInCallback({
        user: { id: "1", email: "user@example.com", name: "User", emailVerified: null },
        account: { provider: "azure-ad", providerAccountId: "azure-hijack-1", type: "oauth" as const },
        profile: { xms_edov: true } as any,
        credentials: undefined,
        email: undefined,
      } as any);

      expect(result).toBe("/auth/error?error=unverified-email");
    });
  });
});
