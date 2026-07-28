"use client";

import { motion, useReducedMotion } from "framer-motion";

type BlurTextProps = {
  text: string;
  delay?: number;
  stagger?: number;
  className?: string;
};

/**
 * Word-by-word blur/rise reveal, adapted from the reactbits BlurText pattern
 * for framer-motion v10, the repo's pinned version (no `motion/react` import).
 *
 * The reveal deliberately animates only `y` and `blur`, never `opacity`. An
 * opacity-0 initial state is written into the server-rendered HTML, which means
 * anything that does not execute JavaScript (crawlers, Google's OAuth branding
 * review) sees the headline as hidden. Animating position and blur keeps the
 * same visual reveal while the text stays fully opaque and readable in the
 * markup. For the same reason the words are not aria-hidden: they are the real
 * heading text, so screen readers should read them.
 */
export function BlurText({ text, delay = 0, stagger = 0.06, className }: BlurTextProps) {
  const prefersReducedMotion = useReducedMotion();
  const words = text.split(" ");

  if (prefersReducedMotion) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          className="inline-block whitespace-pre"
          initial={{ y: 14, filter: "blur(8px)" }}
          animate={{ y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.55, delay: delay + i * stagger, ease: [0.22, 1, 0.36, 1] }}>
          {word}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </span>
  );
}
