import { DynamicComponent } from "@calcom/app-store/_components/DynamicComponent";
import dynamic from "next/dynamic";

export const AppSetupMap = {
  "apple-calendar": dynamic(() => import("@calcom/web/components/apps/applecalendar/Setup")),
  "caldav-calendar": dynamic(() => import("@calcom/web/components/apps/caldavcalendar/Setup")),
  make: dynamic(() => import("@calcom/web/components/apps/make/Setup")),
  stripe: dynamic(() => import("@calcom/web/components/apps/stripepayment/Setup")),
};

export const AppSetupPage = (props: { slug: string }) => {
  return <DynamicComponent<typeof AppSetupMap> componentMap={AppSetupMap} {...props} />;
};

export default AppSetupPage;
