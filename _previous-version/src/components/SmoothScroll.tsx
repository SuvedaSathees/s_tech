"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { heroStore } from "@/lib/heroStore";

gsap.registerPlugin(ScrollTrigger);

let lenisInstance: Lenis | null = null;
export const getLenis = () => lenisInstance;

export const scrollToHash = (hash: string) => {
  const el = document.querySelector(hash) as HTMLElement | null;
  if (!el) return;
  if (lenisInstance) lenisInstance.scrollTo(el, { duration: 1.6, offset: 0 });
  else el.scrollIntoView({ behavior: "smooth" });
};

/** Lenis ↔ GSAP ScrollTrigger bridge. One RAF drives both. */
export default function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    heroStore.reducedMotion = reduced;

    const lenis = new Lenis({
      duration: reduced ? 0.01 : 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !reduced,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4,
    });
    lenisInstance = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // anchor links
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a[href^='#']") as HTMLAnchorElement | null;
      if (!a) return;
      const hash = a.getAttribute("href")!;
      if (hash.length < 2) return;
      e.preventDefault();
      scrollToHash(hash);
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  return null;
}
