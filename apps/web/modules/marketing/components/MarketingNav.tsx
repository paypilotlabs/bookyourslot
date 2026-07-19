import Link from "next/link";

import { APP_NAME } from "@calcom/lib/constants";

export function MarketingNav() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
      <Link href="/" className="font-script text-2xl leading-none text-neutral-900">
        {APP_NAME}
      </Link>
      <nav className="flex items-center gap-2 sm:gap-4">
        <Link
          href="/blog"
          className="hidden rounded-full px-3 py-2 text-sm font-medium text-neutral-500 transition hover:text-neutral-900 sm:block">
          Blog
        </Link>
        <Link
          href="/auth/login"
          className="rounded-full px-4 py-2 text-sm font-medium text-neutral-600 transition hover:text-neutral-900">
          Sign in
        </Link>
        <Link
          href="/signup"
          className="rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-700">
          Get started
        </Link>
      </nav>
    </header>
  );
}
