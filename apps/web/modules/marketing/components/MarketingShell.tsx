import type { ReactNode } from "react";
import { MarketingFooter } from "./MarketingFooter";
import { MarketingNav } from "./MarketingNav";

/**
 * Shell for all public marketing pages: editorial palette, fixed colors on
 * purpose — these pages ignore the app's dark theme. The logged-in app keeps
 * its own clean look.
 */
export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-brand-cream text-brand-navy min-h-screen font-sans antialiased">
      <MarketingNav />
      <main>{children}</main>
      <MarketingFooter />
    </div>
  );
}
