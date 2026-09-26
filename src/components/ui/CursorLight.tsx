"use client";

import { useEffect, useRef } from "react";
import { heroStore } from "@/lib/heroStore";

/** A soft, very low-intensity light that follows the cursor (desktop only). */
export default function CursorLight() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = ref.current!;
    let x = innerWidth / 2,
      y = innerHeight / 2,
      cx = x,
      cy = y,
      raf = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      heroStore.pointer.x = (x / innerWidth) * 2 - 1;
      heroStore.pointer.y = -((y / innerHeight) * 2 - 1);
      el.style.opacity = "1";
    };
    const loop = () => {
      cx += (x - cx) * 0.12;
      cy += (y - cy) * 0.12;
      el.style.transform = `translate3d(${cx - 300}px, ${cy - 300}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[60] h-[600px] w-[600px] opacity-0 mix-blend-screen transition-opacity duration-700"
      style={{ background: "radial-gradient(closest-side, rgba(150,210,255,0.06), transparent)" }}
    />
  );
}
