import { getServerSideProps } from "@lib/apps/categories/getServerSideProps";
import { buildLegacyCtx } from "@lib/buildLegacyCtx";
import type { PageProps } from "app/_types";
import { withAppDirSsr } from "app/WithAppDirSsr";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import Page from "~/apps/categories/categories-view";
import { isAppStoreAdmin } from "../_lib/appStoreAccess";

const getData = withAppDirSsr(getServerSideProps);

async function ServerPage({ params, searchParams }: PageProps) {
  if (!(await isAppStoreAdmin())) notFound();

  const props = await getData(
    buildLegacyCtx(await headers(), await cookies(), await params, await searchParams)
  );

  return <Page {...props} />;
}

export default ServerPage;
