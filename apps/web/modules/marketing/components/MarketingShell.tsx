import type { ReactNode } from "react";
import { MarketingFooter } from "./MarketingFooter";
import { MarketingNav } from "./MarketingNav";

/**
 * Light shell for all public marketing pages. Fixed light colors on purpose —
 * these pages ignore the app's dark theme.
 */
export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F7F7F8] font-sans text-[#1A1A1A] antialiased">
      <MarketingNav />
      <main>{children}</main>
      <MarketingFooter />
    </div>
  );
}
