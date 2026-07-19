import { APP_NAME } from "@calcom/lib/constants";
import Link from "next/link";

/**
 * Constant navy bar in both color schemes. The wordmark is an outlined
 * Manoyri SVG so production doesn't need the licensed font file. Per the
 * CTA policy the nav carries no signup button; the only signup CTA lives
 * in the landing hero.
 */
export function MarketingNav() {
  return (
    <header className="bg-brand-navy">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="transition hover:opacity-80">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/bys-wordmark-lime.svg" alt={APP_NAME} className="h-6 w-auto" />
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/how-it-works"
            className="text-brand-cream/70 hover:text-brand-cream hidden rounded-full px-3 py-2 text-sm font-medium transition sm:block">
            How it works
          </Link>
          <Link
            href="/blog"
            className="text-brand-cream/70 hover:text-brand-cream rounded-full px-3 py-2 text-sm font-medium transition">
            Blog
          </Link>
          <Link
            href="/about"
            className="text-brand-cream/70 hover:text-brand-cream hidden rounded-full px-3 py-2 text-sm font-medium transition sm:block">
            About
          </Link>
          <Link
            href="/auth/login"
            className="border-brand-cream/30 text-brand-cream hover:border-brand-cream/70 rounded-full border px-4 py-2 text-sm font-medium transition">
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
