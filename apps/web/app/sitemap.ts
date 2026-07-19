import type { MetadataRoute } from "next";

import { WEBSITE_URL } from "@calcom/lib/constants";

import { BLOG_POSTS } from "~/marketing/blog/posts";

/** Marketing surfaces only — app and booking routes are intentionally excluded. */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: WEBSITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${WEBSITE_URL}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${WEBSITE_URL}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${WEBSITE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${WEBSITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const posts: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${WEBSITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...posts];
}
