import { AppCategories } from "@calcom/prisma/enums";
import { getStaticProps } from "@lib/apps/categories/[category]/getStaticProps";
import type { PageProps } from "app/_types";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import CategoryPage from "~/apps/categories/[category]/category-view";
import { CLIENT_BROWSABLE_CATEGORY, isAppStoreAdmin } from "../../_lib/appStoreAccess";

const querySchema = z.object({
  category: z.enum(Object.values(AppCategories) as [AppCategories, ...AppCategories[]]),
});

async function Page({ params, searchParams }: PageProps) {
  const parsed = querySchema.safeParse({ ...(await params), ...(await searchParams) });
  if (!parsed.success) {
    redirect("/apps/categories/calendar");
  }

  // Calendar is the one category a client browses for themselves, because Google
  // requires the account holder to consent and we cannot connect it for them.
  if (parsed.data.category !== CLIENT_BROWSABLE_CATEGORY && !(await isAppStoreAdmin())) {
    notFound();
  }

  const props = await getStaticProps(parsed.data.category);

  return <CategoryPage {...props} />;
}

export default Page;
