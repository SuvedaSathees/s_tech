"use client";

import { useEffect, useRef } from "react";
import { heroStore } from "@/lib/heroStore";
import { site } from "@/config/site";

/**
 * Image-sequence film layer (used when site.hero.frames is set).
 * Frames are drawn to a canvas and load coarse-to-fine, so scrubbing works
 * immediately and sharpens as the rest of the sequence arrives.
 */
export default function HeroFrames() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cfg = site.hero.frames;
    const canvas = ref.current;
    if (!cfg || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const start = cfg.start ?? 1;
    const url = (i: number) => cfg.pattern.replace("{index}", String(start + i).padStart(cfg.pad, "0"));
    const frames: (HTMLImageElement | null)[] = new Array(cfg.count).fill(null);
    let alive = true;

    // coarse → fine load order: every 32nd frame, then 16th, 8th ...
    const order: number[] = [];
    const seen = new Set<number>();
    for (let step = 32; step >= 1; step = step >> 1) for (let i = 0; i < cfg.count; i += step) if (!seen.has(i)) (seen.add(i), order.push(i));
    let cursor = 0;
    const next = () => {
      if (!alive || cursor >= order.length) return;
      const i = order[cursor++];
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        frames[i] = img;
        next();
      };
      img.onerror = () => next();
      img.src = url(i);
    };
    for (let k = 0; k < 6; k++) next();

    let last = -1;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      last = -1;
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!heroStore.active) return;
      let idx = Math.round(heroStore.current * (cfg.count - 1));
      if (!frames[idx]) {
        for (let d = 1; d < cfg.count; d++) {
          if (frames[idx - d]) { idx -= d; break; }
          if (frames[idx + d]) { idx += d; break; }
        }
      }
      const img = frames[idx];
      if (!img || idx === last) return;
      last = idx;
      const s = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
      const w = img.naturalWidth * s, h = img.naturalHeight * s;
      ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden />;
}
