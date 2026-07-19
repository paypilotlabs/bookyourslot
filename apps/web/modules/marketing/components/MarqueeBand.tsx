const PHRASES = ["Own your scheduling", "Your guests", "Your data", "Your brand"];

/**
 * Editorial statement band. Pure CSS marquee (mk-marquee keyframes in
 * globals.css); prefers-reduced-motion turns the animation off.
 */
export function MarqueeBand() {
  const line = PHRASES.map((phrase) => `${phrase}  ·  `).join("");

  return (
    <section aria-label={PHRASES.join(". ")} className="bg-brand-lime overflow-hidden py-8 sm:py-10">
      <div className="mk-marquee flex w-max" aria-hidden="true">
        {[0, 1].map((copy) => (
          <span
            key={copy}
            className="font-display text-brand-navy whitespace-pre pr-4 text-5xl uppercase leading-none tracking-tight sm:text-7xl">
            {line}
          </span>
        ))}
      </div>
    </section>
  );
}
