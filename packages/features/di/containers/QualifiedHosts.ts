import type { CredentialForCalendarService } from "@calcom/types/Credential";
import { createContainer } from "../di";
import { qualifiedHostsModule } from "../modules/QualifiedHosts";
import { DI_TOKENS } from "../tokens";

type QualifiedHost = {
  user: {
    id: number;
    credentials: CredentialForCalendarService[];
  };
  isFixed?: boolean;
  groupId?: string | null;
};

type QualifiedHostsResult = {
  qualifiedRRHosts: QualifiedHost[];
  allFallbackRRHosts: QualifiedHost[];
  fixedHosts: QualifiedHost[];
};

export type QualifiedHostsService = {
  findQualifiedHostsWithDelegationCredentials: (..._args: unknown[]) => Promise<QualifiedHostsResult>;
};

const container = createContainer();
container.load(DI_TOKENS.QUALIFIED_HOSTS_SERVICE_MODULE, qualifiedHostsModule);

/**
 * Resolves the same implementation the slots container already uses.
 *
 * This returned a no-op that answered every question with empty arrays, while
 * `AvailableSlots.ts` loaded the real module. So the booking page and the booking
 * itself disagreed about who a team event's hosts were, which was invisible while no
 * team could be created and becomes wrong the moment one can.
 *
 * A pure round-robin team still booked correctly by accident: with everything empty,
 * `loadAndValidateUsers` fell back to treating every loaded user as fixed, and the
 * per-user `isFixed` copied off the Host row still steered them into the non-fixed
 * pool. Mixed teams are where it breaks. With one fixed host and every round-robin
 * host busy, `luckyUsers` is empty, the guard that should raise
 * RoundRobinHostsUnavailableForBooking is skipped because it tests arrays the no-op
 * left empty, and the booking is written with the fixed host alone and no round-robin
 * host at all.
 *
 * The shape above is the contract `loadAndValidateUsers` relies on and is deliberately
 * unchanged; only where the implementation comes from has changed.
 */
export function getQualifiedHostsService(): QualifiedHostsService {
  return container.get<QualifiedHostsService>(DI_TOKENS.QUALIFIED_HOSTS_SERVICE);
}
