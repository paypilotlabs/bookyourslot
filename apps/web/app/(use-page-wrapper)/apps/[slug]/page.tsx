import { getStaticProps } from "@lib/apps/[slug]/getStaticProps";
import type { PageProps as _PageProps } from "app/_types";
import { generateAppMetadata } from "app/_utils";
import { notFound } from "next/navigation";
import { z } from "zod";
import AppView from "~/apps/[slug]/slug-view";
import { isAppStoreAdmin, isClientBrowsableApp } from "../_lib/appStoreAccess";

const paramsSchema = z.object({
  slug: z.string(),
});

export const generateMetadata = async ({ params }: _PageProps) => {
  const p = paramsSchema.safeParse(await params);

  if (!p.success) {
    return notFound();
  }
  const slugFromUrl = p.data.slug;
  const props = await getStaticProps(slugFromUrl);

  if (!props) {
    notFound();
  }
  const { name, logo, dirName: appStoreDirSlug, slug: appSlug, description } = props.data;

  return await generateAppMetadata(
    { slug: appStoreDirSlug ?? appSlug, logoUrl: logo, name, description },
    () => name,
    () => description,
    undefined,
    undefined,
    `/apps/${appSlug}`
  );
};

async function Page({ params }: _PageProps) {
  const p = paramsSchema.safeParse(await params);

  if (!p.success) {
    return notFound();
  }

  const props = await getStaticProps(p.data.slug);

  if (!props) {
    notFound();
  }

  // A client can open Google, Apple or CalDAV so they can connect their own
  // calendar. Every other app page is the operator's business, not theirs.
  if (!isClientBrowsableApp(props.data) && !(await isAppStoreAdmin())) {
    return notFound();
  }

  return <AppView {...props} />;
}

export default Page;
