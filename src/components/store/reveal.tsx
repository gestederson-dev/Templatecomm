"use client";

import { useReveal } from "@/hooks/use-reveal";

/** Wrapper client para usar scroll-reveal (§6 do design system) dentro de Server Components. */
export function Reveal({ className = "", stagger = false, children }: { className?: string; stagger?: boolean; children: React.ReactNode }) {
  const { ref, inView } = useReveal<HTMLDivElement>();
  const base = stagger ? "salmar-stagger" : "salmar-reveal";

  return (
    <div ref={ref} className={`${base} ${inView ? "in" : ""} ${className}`}>
      {children}
    </div>
  );
}
