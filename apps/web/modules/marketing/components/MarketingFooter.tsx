import { APP_NAME, SUPPORT_MAIL_ADDRESS } from "@calcom/lib/constants";
import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
];

export function MarketingFooter() {
  return (
    <footer className="bg-brand-navy">
      <div className="text-brand-cream/60 mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-6 px-6 py-12 text-sm sm:flex-row">
        <div className="flex flex-col items-center gap-2.5 sm:items-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/bys-wordmark-cream.svg" alt={APP_NAME} className="h-5 w-auto" />
          <span>
            © {new Date().getFullYear()} {APP_NAME}. Scheduling on your own terms.
          </span>
        </div>
        <div className="flex flex-col items-center gap-2 sm:items-end">
          <nav className="flex flex-wrap justify-center gap-5">
            {FOOTER_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-brand-cream transition">
                {link.label}
              </Link>
            ))}
          </nav>
          <a
            href={`mailto:${SUPPORT_MAIL_ADDRESS}`}
            className="text-brand-lime/80 hover:text-brand-lime transition">
            {SUPPORT_MAIL_ADDRESS}
          </a>
        </div>
      </div>
    </footer>
  );
}
