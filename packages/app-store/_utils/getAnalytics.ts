import logger from "@calcom/lib/logger";
import type { AnalyticsService } from "@calcom/types/AnalyticsService";
import type { CredentialPayload } from "@calcom/types/Credential";
import { AnalyticsServiceMap } from "../analytics.services.generated";

const log = logger.getSubLogger({ prefix: ["AnalyticsManager"] });

export const getAnalyticsService = async ({
  credential,
}: {
  credential: CredentialPayload;
}): Promise<AnalyticsService | null> => {
  if (!credential || !credential.key) return null;
  const { type: analyticsType } = credential;

  const analyticsName = analyticsType.split("_")[0];

  // AnalyticsServiceMap is generated from the apps that ship a lib/AnalyticsService.
  // None currently do, so the generated map is empty and indexing it directly
  // would resolve to `never`. Widening it keeps the lookup honest and lets an app
  // reintroduce an analytics service without touching this file.
  const analyticsServices = AnalyticsServiceMap as Record<
    string,
    Promise<{ default?: (credential: CredentialPayload) => AnalyticsService }> | undefined
  >;

  const analyticsAppImportFn = analyticsServices[analyticsName];

  if (!analyticsAppImportFn) {
    log.warn(`analytics app not implemented`);
    return null;
  }

  const analyticsApp = await analyticsAppImportFn;

  const createAnalyticsService = analyticsApp.default;

  if (!createAnalyticsService || typeof createAnalyticsService !== "function") {
    log.warn(`analytics of type ${analyticsType} is not implemented`);
    return null;
  }

  return createAnalyticsService(credential);
};
