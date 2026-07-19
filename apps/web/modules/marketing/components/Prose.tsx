import type { ReactNode } from "react";

/**
 * Typography wrapper for long-form marketing content (blog bodies, legal
 * pages). Styles plain h2/h3/p/ul/ol/a children without the tailwind
 * typography plugin, using the scheme-aware mk-* tokens.
 */
export function Prose({ children }: { children: ReactNode }) {
  return (
    <div
      className={[
        "text-mk-ink/85 text-[15px] leading-7",
        "[&_h2]:font-display [&_h2]:text-mk-ink [&_h2]:mt-10 [&_h2]:text-3xl [&_h2]:uppercase [&_h2]:tracking-tight",
        "[&_h3]:text-mk-ink [&_h3]:mt-7 [&_h3]:text-base [&_h3]:font-semibold",
        "[&_p]:mt-4",
        "[&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5",
        "[&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5",
        "[&_a]:text-mk-ink [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:opacity-70",
        "[&_strong]:text-mk-ink",
        "[&_img]:border-mk-border [&_img]:mt-6 [&_img]:w-full [&_img]:rounded-2xl [&_img]:border",
      ].join(" ")}>
      {children}
    </div>
  );
}
