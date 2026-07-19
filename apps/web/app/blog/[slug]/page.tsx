import { APP_NAME, WEBSITE_URL } from "@calcom/lib/constants";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_POSTS, getPost } from "~/marketing/blog/posts";
import { JsonLd } from "~/marketing/components/JsonLd";
import { MarketingShell } from "~/marketing/components/MarketingShell";
import { Prose } from "~/marketing/components/Prose";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} — ${APP_NAME}`,
    description: post.description,
    alternates: { canonical: `${WEBSITE_URL}/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      url: `${WEBSITE_URL}/blog/${post.slug}`,
    },
  };
}

const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "long" });

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <MarketingShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          dateModified: post.date,
          author: { "@type": "Organization", name: APP_NAME, url: WEBSITE_URL },
          publisher: { "@type": "Organization", name: APP_NAME, url: WEBSITE_URL },
          mainEntityOfPage: `${WEBSITE_URL}/blog/${post.slug}`,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Blog", item: `${WEBSITE_URL}/blog` },
            {
              "@type": "ListItem",
              position: 2,
              name: post.title,
              item: `${WEBSITE_URL}/blog/${post.slug}`,
            },
          ],
        }}
      />
      <article className="mx-auto w-full max-w-3xl px-6 pb-24 pt-10">
        <Link href="/blog" className="text-sm font-medium text-neutral-500 transition hover:text-neutral-900">
          ← All posts
        </Link>
        <p className="mt-8 text-xs text-neutral-500">
          <time dateTime={post.date}>{dateFormatter.format(new Date(post.date))}</time> ·{" "}
          {post.readingMinutes} min read · {APP_NAME} Team
        </p>
        <h1 className="font-display mt-3 text-balance text-4xl leading-tight tracking-tight sm:text-5xl">
          {post.title}
        </h1>
        <div className="mt-8">
          <Prose>{post.body}</Prose>
        </div>
        <div className="mt-14 rounded-3xl bg-gradient-to-br from-rose-100 via-violet-200 to-sky-200 p-8 text-center">
          <p className="font-display text-xl text-neutral-900">Put your scheduling on autopilot</p>
          <Link
            href="/signup"
            className="mt-5 inline-block rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700">
            Get started free
          </Link>
        </div>
      </article>
    </MarketingShell>
  );
}
