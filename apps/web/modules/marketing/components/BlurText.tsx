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
 */
export function BlurText({ text, delay = 0, stagger = 0.06, className }: BlurTextProps) {
  const prefersReducedMotion = useReducedMotion();
  const words = text.split(" ");

  if (prefersReducedMotion) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className} aria-label={text} role="text">
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          className="inline-block whitespace-pre"
          initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.55, delay: delay + i * stagger, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden="true">
          {word}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </span>
  );
}
