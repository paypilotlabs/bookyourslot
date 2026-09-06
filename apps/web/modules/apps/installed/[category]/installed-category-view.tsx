"use client";

import { type ActiveAppCategoryKeys, APP_CATEGORY_ENTRIES } from "@calcom/app-store/_utils/getAppCategories";
import getAppCategoryTitle from "@calcom/app-store/_utils/getAppCategoryTitle";
import { AppList, type HandleDisconnect } from "@calcom/features/apps/components/AppList";
import type { UpdateUsersDefaultConferencingAppParams } from "@calcom/features/apps/components/AppSetDefaultLinkDialog";
import type { RemoveAppParams } from "@calcom/features/apps/components/DisconnectIntegrationModal";
import DisconnectIntegrationModal from "@calcom/features/apps/components/DisconnectIntegrationModal";
import type { BulkUpdatParams } from "@calcom/features/eventtypes/components/BulkEditDefaultForEventsModal";
import { SUPPORT_MAIL_ADDRESS } from "@calcom/lib/constants";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { AppCategories } from "@calcom/prisma/enums";
import type { RouterOutputs } from "@calcom/trpc/react";
import { trpc } from "@calcom/trpc/react";
import { Button } from "@calcom/ui/components/button";
import { EmptyScreen } from "@calcom/ui/components/empty-screen";
import { ShellSubHeading } from "@calcom/ui/components/layout";
import { showToast } from "@calcom/ui/components/toast";
import AppListCardWebWrapper from "@calcom/web/modules/apps/components/AppListCardWebWrapper";
import { SkeletonLoader } from "@calcom/web/modules/apps/components/SkeletonLoader";
import { CalendarListContainer } from "@components/apps/CalendarListContainer";
import InstalledAppsLayout from "@components/apps/layouts/InstalledAppsLayout";
import { QueryCell } from "@lib/QueryCell";
import { useSession } from "next-auth/react";
import { useReducer } from "react";

interface IntegrationsContainerProps {
  variant?: AppCategories;
  exclude?: AppCategories[];
  handleDisconnect: HandleDisconnect;
}

const LEGACY_CATEGORY_MAP: Partial<Record<AppCategories, ActiveAppCategoryKeys>> = {
  video: "conferencing",
};

const IntegrationsContainer = ({
  variant,
  exclude,
  handleDisconnect,
}: IntegrationsContainerProps): JSX.Element => {
  const { t } = useLocale();
  const utils = trpc.useUtils();
  const query = trpc.viewer.apps.integrations.useQuery({
    variant,
    exclude,
    onlyInstalled: true,
    includeTeamInstalledApps: true,
  });

  const { data: defaultConferencingApp } = trpc.viewer.apps.getUsersDefaultConferencingApp.useQuery();

  const updateDefaultAppMutation = trpc.viewer.apps.updateUserDefaultConferencingApp.useMutation();

  const updateLocationsMutation = trpc.viewer.eventTypes.bulkUpdateToDefaultLocation.useMutation();

  const isActiveCategory = (v: AppCategories): v is ActiveAppCategoryKeys => v in APP_CATEGORY_ENTRIES;

  const resolveEmptyStateVariant = (v?: AppCategories): ActiveAppCategoryKeys => {
    if (!v) return "other";
    if (isActiveCategory(v)) return v;
    return LEGACY_CATEGORY_MAP[v] || "other";
  };

  const { data: eventTypesQueryData, isFetching: isEventTypesFetching } =
    trpc.viewer.eventTypes.bulkEventFetch.useQuery();

  const handleUpdateUserDefaultConferencingApp = ({
    appSlug,
    appLink,
    onSuccessCallback,
    onErrorCallback,
  }: UpdateUsersDefaultConferencingAppParams) => {
    updateDefaultAppMutation.mutate(
      { appSlug, appLink },
      {
        onSuccess: () => {
          showToast("Default app updated successfully", "success");
          utils.viewer.apps.getUsersDefaultConferencingApp.invalidate();
          onSuccessCallback();
        },
        onError: (error) => {
          showToast(`Error: ${error.message}`, "error");
          onErrorCallback();
        },
      }
    );
  };

  const handleBulkUpdateDefaultLocation = ({ eventTypeIds, callback }: BulkUpdatParams) => {
    updateLocationsMutation.mutate(
      {
        eventTypeIds,
      },
      {
        onSuccess: () => {
          utils.viewer.apps.getUsersDefaultConferencingApp.invalidate();
          callback();
        },
      }
    );
  };

  const handleConnectDisconnectIntegrationMenuToggle = () => {
    utils.viewer.apps.integrations.invalidate();
  };

  const handleBulkEditDialogToggle = () => {
    utils.viewer.apps.getUsersDefaultConferencingApp.invalidate();
  };

  return (
    <QueryCell
      query={query}
      customLoader={<SkeletonLoader />}
      success={({ data }) => {
        if (!data.items.length) {
          const resolvedVariant = resolveEmptyStateVariant(variant);
          const emptyHeaderCategory = getAppCategoryTitle(resolvedVariant, true);

          return (
            <EmptyScreen
              Icon={APP_CATEGORY_ENTRIES[resolvedVariant].icon}
              headline={t("no_category_apps", {
                category: emptyHeaderCategory,
              })}
              description={t(`no_category_apps_description_${resolvedVariant}`)}
              buttonRaw={
                <Button
                  color="secondary"
                  data-testid={`connect-${resolvedVariant}-apps`}
                  href={`/apps/categories/${resolvedVariant}`}>
                  {t(`connect_${resolvedVariant}_apps`)}
                </Button>
              }
            />
          );
        }
        return (
          <div className="border-subtle rounded-md border p-7">
            <ShellSubHeading
              title={t(variant || "other")}
              subtitle={t(`installed_app_${variant || "other"}_description`)}
              className="mb-6"
              actions={
                <Button
                  data-testid="add-apps"
                  href={variant ? `/apps/categories/${variant}` : "/apps"}
                  color="secondary"
                  StartIcon="plus">
                  {t("add")}
                </Button>
              }
            />

            <AppList
              handleDisconnect={handleDisconnect}
              data={data}
              variant={variant}
              defaultConferencingApp={defaultConferencingApp}
              handleUpdateUserDefaultConferencingApp={handleUpdateUserDefaultConferencingApp}
              handleBulkUpdateDefaultLocation={handleBulkUpdateDefaultLocation}
              isBulkUpdateDefaultLocationPending={updateDefaultAppMutation.isPending}
              eventTypes={eventTypesQueryData?.eventTypes}
              isEventTypesFetching={isEventTypesFetching}
              handleConnectDisconnectIntegrationMenuToggle={handleConnectDisconnectIntegrationMenuToggle}
              handleBulkEditDialogToggle={handleBulkEditDialogToggle}
              AppListCardComponent={AppListCardWebWrapper}
            />
          </div>
        );
      }}
    />
  );
};

type ModalState = {
  isOpen: boolean;
  credentialId: null | number;
  teamId?: number;
};

type PageProps = {
  category: AppCategories;
  connectedCalendars: RouterOutputs["viewer"]["calendars"]["connectedCalendars"];
  installedCalendars: RouterOutputs["viewer"]["apps"]["integrations"];
};

/**
 * The store is admin-only, so a client has no way to discover an integration or ask
 * for one in-product. This is that route: one line telling them integrations are
 * managed for them, and where to write. Deliberately a single block rather than a
 * card per uninstalled app, which would advertise Stripe, the BAA link and Cal Video,
 * none of which this deployment can deliver.
 *
 * Hidden from admins, who are the people being emailed.
 */
const RequestIntegrationBlock = () => {
  const { t } = useLocale();
  const session = useSession();

  if (session.data?.user?.role === "ADMIN") return null;

  return (
    <div className="border-subtle mt-6 rounded-md border p-7">
      <h3 className="text-emphasis text-sm font-semibold leading-none">{t("need_another_integration")}</h3>
      <p className="text-default mt-2 text-sm">
        {t("integrations_are_managed_for_you")}{" "}
        <a className="text-emphasis font-medium underline" href={`mailto:${SUPPORT_MAIL_ADDRESS}`}>
          {SUPPORT_MAIL_ADDRESS}
        </a>
      </p>
    </div>
  );
};

export default function InstalledApps({ category, connectedCalendars, installedCalendars }: PageProps) {
  const { t } = useLocale();
  const utils = trpc.useUtils();
  const categoryList: AppCategories[] = Object.values(AppCategories).filter((category) => {
    // Exclude calendar and other from categoryList, we handle those slightly differently below
    return !(category in { other: null, calendar: null });
  });

  const [data, updateData] = useReducer(
    (data: ModalState, partialData: Partial<ModalState>) => ({ ...data, ...partialData }),
    {
      isOpen: false,
      credentialId: null,
    }
  );

  const handleModelClose = () => {
    updateData({ isOpen: false, credentialId: null });
  };

  const handleDisconnect = (credentialId: number, app: string, teamId?: number) => {
    updateData({ isOpen: true, credentialId, teamId });
  };

  const deleteCredentialMutation = trpc.viewer.credentials.delete.useMutation();

  const handleRemoveApp = ({ credentialId, teamId, callback }: RemoveAppParams) => {
    deleteCredentialMutation.mutate(
      { id: credentialId, teamId },
      {
        onSuccess: () => {
          showToast(t("app_removed_successfully"), "success");
          callback();
          utils.viewer.apps.integrations.invalidate();
          utils.viewer.calendars.connectedCalendars.invalidate();
        },
        onError: () => {
          showToast(t("error_removing_app"), "error");
          callback();
        },
      }
    );
  };

  return (
    <>
      <InstalledAppsLayout heading={t("installed_apps")} subtitle={t("manage_your_connected_apps")}>
        {categoryList.includes(category) && (
          <IntegrationsContainer handleDisconnect={handleDisconnect} variant={category} />
        )}
        {category === "calendar" && (
          <CalendarListContainer
            connectedCalendars={connectedCalendars}
            installedCalendars={installedCalendars}
          />
        )}
        {category === "other" && (
          <IntegrationsContainer
            handleDisconnect={handleDisconnect}
            variant={category}
            exclude={[...categoryList, "calendar"]}
          />
        )}
        <RequestIntegrationBlock />
      </InstalledAppsLayout>
      <DisconnectIntegrationModal
        handleModelClose={handleModelClose}
        isOpen={data.isOpen}
        credentialId={data.credentialId}
        teamId={data.teamId}
        handleRemoveApp={handleRemoveApp}
      />
    </>
  );
}
