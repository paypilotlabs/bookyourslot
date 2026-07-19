import { APP_NAME, SUPPORT_MAIL_ADDRESS } from "@calcom/lib/constants";
import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-neutral-200/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-6 px-6 py-10 text-sm text-neutral-500 sm:flex-row">
        <div className="flex flex-col items-center gap-1 sm:items-start">
          <span className="font-script text-xl text-neutral-900">{APP_NAME}</span>
          <span>
            © {new Date().getFullYear()} {APP_NAME}. Scheduling on your own terms.
          </span>
        </div>
        <div className="flex flex-col items-center gap-2 sm:items-end">
          <nav className="flex gap-5">
            {FOOTER_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-neutral-900">
                {link.label}
              </Link>
            ))}
          </nav>
          <a href={`mailto:${SUPPORT_MAIL_ADDRESS}`} className="transition hover:text-neutral-900">
            {SUPPORT_MAIL_ADDRESS}
          </a>
        </div>
      </div>
    </footer>
  );
}
