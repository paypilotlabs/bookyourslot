"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

type FadeInProps = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
};

/**
 * Scroll-triggered fade/rise, adapted from the reactbits AnimatedContent
 * pattern. A timed failsafe reveals content even without scrolling so
 * non-scrolling renderers (search engines, full-page screenshots) always see
 * the page's text.
 */
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
      initial={{ opacity: 0, y }}
      animate={visible ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}
