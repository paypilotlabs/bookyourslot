import type { ReactNode } from "react";

/**
 * Typography wrapper for long-form marketing content (blog bodies, legal
 * pages) — styles plain h2/h3/p/ul/ol/a children without the tailwind
 * typography plugin.
 */
export function Prose({ children }: { children: ReactNode }) {
  return (
    <div
      className={[
        "text-[15px] leading-7 text-neutral-700",
        "[&_h2]:font-display [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:tracking-tight [&_h2]:text-neutral-900",
        "[&_h3]:mt-7 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-neutral-900",
        "[&_p]:mt-4",
        "[&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5",
        "[&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5",
        "[&_a]:font-medium [&_a]:text-neutral-900 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-neutral-600",
        "[&_strong]:text-neutral-900",
        "[&_img]:mt-6 [&_img]:w-full [&_img]:rounded-2xl [&_img]:border [&_img]:border-neutral-200/80",
      ].join(" ")}>
      {children}
    </div>
  );
}
