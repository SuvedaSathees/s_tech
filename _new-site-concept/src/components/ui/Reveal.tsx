"use client";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Reveals every [data-reveal] descendant as it enters the viewport.
 * Wrap a section's content once; mark elements with data-reveal (optional data-delay).
 */
export default function Reveal({ children, className, as: Tag = "div", id }: { children: React.ReactNode; className?: string; as?: "div" | "section"; id?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current!;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(root.querySelectorAll("[data-reveal]"), { opacity: 1, y: 0 });
      return;
    }
    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    const triggers = els.map((el) =>
      ScrollTrigger.create({
        trigger: el,
        start: "top 88%",
        once: true,
        onEnter: () =>
          gsap.to(el, { opacity: 1, y: 0, duration: 1.3, ease: "power3.out", delay: Number(el.dataset.delay || 0) }),
      }),
    );
    return () => triggers.forEach((t) => t.kill());
  }, []);
  return (
    <Tag ref={ref as React.RefObject<HTMLDivElement>} className={className} id={id}>
      {children}
    </Tag>
  );
}
