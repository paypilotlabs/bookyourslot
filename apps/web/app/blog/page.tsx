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
        <h1 className="font-display text-6xl uppercase tracking-tight sm:text-7xl">Blog</h1>
        <p className="text-brand-navy/70 mt-4 max-w-xl">
          Guides and product news — booking pages, availability, team scheduling, and owning your scheduling
          stack.
        </p>
        <div className="mt-12 space-y-5">
          {BLOG_POSTS.map((post) => (
            <article
              key={post.slug}
              className="border-brand-navy/10 rounded-3xl border bg-white/60 p-7 transition hover:bg-white">
              <p className="text-brand-navy/50 text-xs">
                <time dateTime={post.date}>{dateFormatter.format(new Date(post.date))}</time> ·{" "}
                {post.readingMinutes} min read
              </p>
              <h2 className="font-display mt-2 text-2xl uppercase tracking-tight">
                <Link href={`/blog/${post.slug}`} className="transition hover:opacity-70">
                  {post.title}
                </Link>
              </h2>
              <p className="text-brand-navy/70 mt-2 text-sm leading-relaxed">{post.excerpt}</p>
              <Link
                href={`/blog/${post.slug}`}
                className="text-brand-navy mt-4 inline-block text-sm font-semibold underline underline-offset-4 transition hover:opacity-70">
                Read the post
              </Link>
            </article>
          ))}
        </div>
      </div>
    </MarketingShell>
  );
}
