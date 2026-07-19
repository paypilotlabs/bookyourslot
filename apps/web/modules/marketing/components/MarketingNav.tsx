import { APP_NAME } from "@calcom/lib/constants";
import Link from "next/link";

export function MarketingNav() {
  return (
    <header className="bg-brand-navy">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="font-script text-brand-lime text-2xl leading-none">
          {APP_NAME}
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/blog"
            className="text-brand-cream/70 hover:text-brand-cream hidden rounded-full px-3 py-2 text-sm font-medium transition sm:block">
            Blog
          </Link>
          <Link
            href="/about"
            className="text-brand-cream/70 hover:text-brand-cream hidden rounded-full px-3 py-2 text-sm font-medium transition sm:block">
            About
          </Link>
          <Link
            href="/auth/login"
            className="text-brand-cream/80 hover:text-brand-cream rounded-full px-4 py-2 text-sm font-medium transition">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="bg-brand-lime text-brand-navy rounded-full px-5 py-2.5 text-sm font-semibold transition hover:brightness-110">
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}
