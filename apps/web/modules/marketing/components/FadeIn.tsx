"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

/**
 * Scroll-triggered rise, adapted from the reactbits AnimatedContent pattern.
 *
 * Like BlurText, this animates only `y` and never `opacity`. The previous
 * opacity-0 initial state was written into the server-rendered HTML, so any
 * renderer that does not execute JavaScript saw these sections as hidden, which
 * covers search crawlers and Google's OAuth branding review. The timed failsafe
 * below was an attempt at the same problem, but it still required JS to fire.
 * Keeping content opaque solves it at the source; the rise still reads as a
 * reveal for everyone else.
 */
type FadeInProps = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
};

export function FadeIn({ children, delay = 0, y = 24, className }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const prefersReducedMotion = useReducedMotion();
  const [failsafe, setFailsafe] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFailsafe(true), 1800);
    return () => clearTimeout(timer);
  }, []);

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const visible = isInView || failsafe;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ y }}
      animate={visible ? { y: 0 } : undefined}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}
