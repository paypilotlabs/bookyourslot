import type { ReactNode } from "react";

/** Schedulo-style browser chrome around a product screenshot. Shapes only — no icons. */
export function BrowserFrame({
  children,
  url = "bookyourslot.online",
}: {
  children: ReactNode;
  url?: string;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-neutral-200/80 bg-white shadow-[0_24px_60px_-24px_rgba(23,23,23,0.25)]">
      <div className="flex items-center gap-3 border-b border-neutral-100 bg-neutral-50/80 px-5 py-3">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
        </div>
        <div className="mx-auto w-full max-w-xs rounded-full bg-white px-4 py-1 text-center text-xs text-neutral-400 ring-1 ring-neutral-200">
          {url}
        </div>
        <div className="w-10" aria-hidden="true" />
      </div>
      {children}
    </div>
  );
}
