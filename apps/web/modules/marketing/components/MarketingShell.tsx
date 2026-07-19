import type { ReactNode } from "react";
import { MarketingFooter } from "./MarketingFooter";
import { MarketingNav } from "./MarketingNav";

/**
 * Shell for all public marketing pages. Neutrals follow the visitor's color
 * scheme via the mk-* tokens while the navy nav/footer stay constant. The
 * logged-in app keeps its own look.
 */
export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-mk-bg text-mk-ink min-h-screen font-sans antialiased">
      <MarketingNav />
      <main>{children}</main>
      <MarketingFooter />
    </div>
  );
}
