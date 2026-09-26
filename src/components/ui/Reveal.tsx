"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Masked line reveal. Pass lines as an array → each slides up from its mask. */
export function MaskText({
  lines,
  as = "h2",
  className = "",
  delay = 0,
  stagger = 0.08,
}: {
  lines: ReactNode[];
  as?: "h1" | "h2" | "h3" | "p" | "div";
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const Tag = as as "h2";
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const spans = el.querySelectorAll(".mask-line > span");
    const ctx = gsap.context(() => {
      gsap.fromTo(
        spans,
        { yPercent: 110, rotate: 2 },
        {
          yPercent: 0,
          rotate: 0,
          duration: 1.3,
          ease: "expo.out",
          stagger,
          delay,
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [delay, stagger]);

  return (
    <Tag ref={ref} className={className}>
      {lines.map((l, i) => (
        <span key={i} className="mask-line">
          <span>{l}</span>
        </span>
      ))}
    </Tag>
  );
}

/** Fade/lift reveal for any block. */
export function Reveal({
  children,
  className = "",
  y = 30,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.4,
          delay,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [y, delay]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
