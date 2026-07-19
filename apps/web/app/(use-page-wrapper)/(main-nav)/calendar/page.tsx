import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { _generateMetadata, getTranslate } from "app/_utils";
import { ShellMainAppDir } from "app/(use-page-wrapper)/(main-nav)/ShellMainAppDir";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import CalendarView from "~/calendar/views/calendar-view";

export const generateMetadata = async () =>
  await _generateMetadata(
    (t) => t("calendar"),
    (t) => t("calendar_page_description"),
    undefined,
    undefined,
    "/calendar"
  );

const Page = async () => {
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });

  if (!session?.user?.id) {
    return redirect("/auth/login");
  }

  const t = await getTranslate();

  return (
    <ShellMainAppDir heading={t("calendar")} subtitle={t("calendar_page_description")}>
      <CalendarView />
    </ShellMainAppDir>
  );
};

export default Page;
