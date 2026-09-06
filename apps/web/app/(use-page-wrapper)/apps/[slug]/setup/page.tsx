import { getServerSideProps } from "@calcom/app-store/_pages/setup/_getServerSideProps";
import { getStaticProps } from "@lib/apps/[slug]/getStaticProps";
import { buildLegacyCtx } from "@lib/buildLegacyCtx";
import type { PageProps as ServerPageProps } from "app/_types";
import { _generateMetadata } from "app/_utils";
import { withAppDirSsr } from "app/WithAppDirSsr";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import SetupView, { type PageProps as ClientPageProps } from "~/apps/[slug]/setup/setup-view";
import { isAppStoreAdmin, isClientBrowsableApp } from "../../_lib/appStoreAccess";

export const generateMetadata = async ({ params: _params }: ServerPageProps) => {
  const params = await _params;
  const metadata = await _generateMetadata(
    () => `${params.slug}`,
    () => "",
    undefined,
    undefined,
    `/apps/${params.slug}/setup`
  );
  return {
    ...metadata,
    robots: {
      index: false,
      follow: false,
    },
  };
};

const getData = withAppDirSsr<ClientPageProps>(getServerSideProps);

const ServerPage = async ({ params, searchParams }: ServerPageProps) => {
  // Same rule as the app page: a client may run the setup flow for a calendar
  // they are connecting themselves, and for nothing else.
  const slug = (await params)?.slug;
  const app = typeof slug === "string" ? await getStaticProps(slug) : null;
  if (!isClientBrowsableApp(app?.data) && !(await isAppStoreAdmin())) {
    notFound();
  }

  const context = buildLegacyCtx(await headers(), await cookies(), await params, await searchParams);

  const props = await getData(context);
  return <SetupView {...props} />;
};

export default ServerPage;
