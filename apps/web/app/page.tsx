import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { checkOnboardingRedirect } from "@calcom/features/auth/lib/onboardingUtils";
import { APP_NAME, SEO_IMG_DEFAULT, SUPPORT_MAIL_ADDRESS, WEBSITE_URL } from "@calcom/lib/constants";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { JsonLd } from "~/marketing/components/JsonLd";
import LandingView, { LANDING_FAQ } from "~/marketing/views/landing-view";

const TITLE = `${APP_NAME} · Scheduling that runs your business`;
const DESCRIPTION =
  "Give every practitioner a beautiful booking page with availability rules, Google Calendar sync, and automatic email confirmations, all on your own domain.";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: WEBSITE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: WEBSITE_URL,
    siteName: APP_NAME,
    type: "website",
    images: [{ url: SEO_IMG_DEFAULT, width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const RedirectPage = async () => {
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });

  if (!session?.user?.id) {
    return (
      <>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": `${WEBSITE_URL}/#organization`,
                name: APP_NAME,
                url: WEBSITE_URL,
                email: SUPPORT_MAIL_ADDRESS,
                logo: `${WEBSITE_URL}/android-chrome-512x512.png`,
                founder: {
                  "@type": "Person",
                  name: "Lohith Kumar Nerukonda",
                  url: `${WEBSITE_URL}/about`,
                },
              },
              {
                "@type": "WebSite",
                "@id": `${WEBSITE_URL}/#website`,
                name: APP_NAME,
                url: WEBSITE_URL,
                publisher: { "@id": `${WEBSITE_URL}/#organization` },
              },
              {
                "@type": "SoftwareApplication",
                name: APP_NAME,
                url: WEBSITE_URL,
                applicationCategory: "BusinessApplication",
                operatingSystem: "Web",
                description: DESCRIPTION,
                offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              },
              {
                "@type": "FAQPage",
                mainEntity: LANDING_FAQ.map((item) => ({
                  "@type": "Question",
                  name: item.question,
                  acceptedAnswer: { "@type": "Answer", text: item.answer },
                })),
              },
            ],
          }}
        />
        <LandingView />
      </>
    );
  }

  // Check if user needs onboarding and redirect before going to event-types
  const organizationId = session.user.profile?.organizationId ?? null;
  const onboardingPath = await checkOnboardingRedirect(session.user.id, {
    checkEmailVerification: true,
    organizationId,
  });
  if (onboardingPath) {
    redirect(onboardingPath);
  }

  redirect("/event-types");
};

export default RedirectPage;
