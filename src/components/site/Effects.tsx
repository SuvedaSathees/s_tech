"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "./Icons";

/**
 * Page-wide motion: reveal-on-scroll for [data-reveal] / [data-lines], magnetic
 * buttons and a soft cursor light (fine pointers only), and the right-edge
 * scroll rail. Everything is readable without it.
 */
export default function Effects() {
  const path = usePathname();
  const light = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLElement>(null);
  const [label, setLabel] = useState("Scroll");

  // reveal
  useEffect(() => {
    const pick = () => Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not(.in), [data-lines]:not(.in)"));
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      pick().forEach((e) => e.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    const scan = () => pick().forEach((e) => io.observe(e));
    scan();
    // content that arrives a moment after navigation
    const t1 = setTimeout(scan, 300), t2 = setTimeout(scan, 1200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      io.disconnect();
    };
  }, [path]);

  // magnetic buttons + cursor light
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const offs: (() => void)[] = [];
    document.querySelectorAll<HTMLElement>(".mag").forEach((el) => {
      const inner = el.querySelector<HTMLElement>(".in");
      const move = (e: MouseEvent) => {
        const b = el.getBoundingClientRect();
        const x = e.clientX - b.left - b.width / 2, y = e.clientY - b.top - b.height / 2;
        el.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px)`;
        if (inner) inner.style.transform = `translate(${x * 0.08}px, ${y * 0.12}px)`;
        el.style.setProperty("--mx", `${e.clientX - b.left}px`);
      };
      const leave = () => {
        el.style.transform = "";
        if (inner) inner.style.transform = "";
      };
      el.addEventListener("mousemove", move);
      el.addEventListener("mouseleave", leave);
      offs.push(() => {
        el.removeEventListener("mousemove", move);
        el.removeEventListener("mouseleave", leave);
      });
    });
    return () => offs.forEach((f) => f());
  }, [path]);

  useEffect(() => {
    const l = light.current;
    if (!l || !window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let lx = window.innerWidth / 2, ly = window.innerHeight / 2, cx = lx, cy = ly, raf = 0;
    const onMove = (e: PointerEvent) => {
      lx = e.clientX;
      ly = e.clientY;
      l.style.opacity = "1";
    };
    const follow = () => {
      cx += (lx - cx) * 0.12;
      cy += (ly - cy) * 0.12;
      l.style.transform = `translate3d(${(cx - 300).toFixed(1)}px,${(cy - 300).toFixed(1)}px,0)`;
      raf = requestAnimationFrame(follow);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(follow);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  // right-edge rail: page progress, hidden while the home film has its own cue
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = rail.current;
      if (!r) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (fill.current) fill.current.style.transform = `scaleY(${p.toFixed(4)})`;
      const film = document.querySelector<HTMLElement>("[data-own-cue]");
      const hide = film ? film.getBoundingClientRect().bottom > window.innerHeight * 0.5 : false;
      r.classList.toggle("off", hide || max < window.innerHeight * 0.4);
      const end = p > 0.96;
      r.classList.toggle("end", end);
      setLabel(end ? "Top" : "Scroll");
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    const t = setTimeout(update, 600);
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [path]);

  const toTop = () => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });

  return (
    <>
      <div ref={light} className="cursor-light" aria-hidden="true" />
      <div ref={rail} className="side-rail off" aria-hidden="true">
        <span className="lbl">{label}</span>
        <span className="trk">
          <i ref={fill} />
        </span>
        <button className="top" type="button" onClick={toTop} tabIndex={-1} aria-label="Back to top">
          <ArrowUp />
        </button>
      </div>
    </>
  );
}
