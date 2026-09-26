"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger and Lenis
 * stay frame-locked. In-page anchor links scroll smoothly too.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      document.documentElement.classList.add("reduced");
      return;
    }
    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: true });
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a[href^='#']") as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute("href")!;
      if (id.length < 2) return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: id === "#top" ? 0 : -8, duration: 1.6 });
      history.replaceState(null, "", id);
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
