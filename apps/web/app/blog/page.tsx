import { APP_NAME, WEBSITE_URL } from "@calcom/lib/constants";
import Link from "next/link";
import { BLOG_POSTS } from "~/marketing/blog/posts";
import { MarketingShell } from "~/marketing/components/MarketingShell";

export const metadata = {
  title: `Blog — ${APP_NAME}`,
  description:
    "Guides and product news from BookYourSlot: booking pages, availability, team scheduling, and running scheduling on your own terms.",
  alternates: { canonical: `${WEBSITE_URL}/blog` },
};

const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "long" });

export default function BlogIndexPage() {
  return (
    <MarketingShell>
      <div className="mx-auto w-full max-w-3xl px-6 pb-24 pt-10">
        <h1 className="font-display text-4xl tracking-tight sm:text-5xl">Blog</h1>
        <p className="mt-3 max-w-xl text-neutral-600">
          Guides and product news — booking pages, availability, team scheduling, and owning your scheduling
          stack.
        </p>
        <div className="mt-12 space-y-5">
          {BLOG_POSTS.map((post) => (
            <article
              key={post.slug}
              className="rounded-3xl border border-neutral-200/80 bg-white p-7 shadow-[0_1px_2px_rgba(16,16,16,0.04)] transition-shadow hover:shadow-[0_12px_32px_-16px_rgba(16,16,16,0.18)]">
              <p className="text-xs text-neutral-500">
                <time dateTime={post.date}>{dateFormatter.format(new Date(post.date))}</time> ·{" "}
                {post.readingMinutes} min read
              </p>
              <h2 className="font-display mt-2 text-xl tracking-tight">
                <Link href={`/blog/${post.slug}`} className="transition hover:text-neutral-600">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">{post.excerpt}</p>
              <Link
                href={`/blog/${post.slug}`}
                className="mt-4 inline-block text-sm font-semibold text-neutral-900 underline underline-offset-4 transition hover:text-neutral-600">
                Read the post
              </Link>
            </article>
          ))}
        </div>
      </div>
    </MarketingShell>
  );
}
