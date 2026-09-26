"use client";
import { useEffect, useRef } from "react";
import type { HeroFilm } from "@/v2/config/hero";
import { heroProgress } from "@/v2/lib/heroProgress";
import { isSmallScreen } from "./filmTime";

type Props = { sequence: NonNullable<HeroFilm["sequence"]>; onReady: () => void };

/**
 * Image-sequence film drawn to a canvas (the approach used for Apple product pages).
 * Frames load coarse-to-fine, so scrubbing works immediately and sharpens as it loads.
 */
export default function SequenceFilm({ sequence, onReady }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const mobile = isSmallScreen() && sequence.mobilePattern;
    const pattern = mobile ? sequence.mobilePattern! : sequence.pattern;
    const count = mobile ? sequence.mobileCount ?? sequence.count : sequence.count;
    const start = sequence.start ?? 1;
    const url = (i: number) => pattern.replace("{index}", String(start + i).padStart(sequence.pad, "0"));

    const frames: (HTMLImageElement | null)[] = new Array(count).fill(null);
    let alive = true;
    let ready = false;

    // coarse-to-fine load order
    const order: number[] = [];
    const seen = new Set<number>();
    for (let step = 32; step >= 1; step = Math.floor(step / 2)) {
      for (let i = 0; i < count; i += step) if (!seen.has(i)) (seen.add(i), order.push(i));
      if (step === 1) break;
    }
    let cursor = 0;
    const load = () => {
      if (!alive || cursor >= order.length) return;
      const i = order[cursor++];
      const img = new Image();
      img.decoding = "async";
      img.src = url(i);
      img.onload = () => {
        frames[i] = img;
        if (!ready) {
          ready = true;
          onReady();
        }
        load();
      };
      img.onerror = () => load();
    };
    for (let k = 0; k < 6; k++) load(); // 6 parallel lanes

    let lastDrawn = -1;
    const resize = () => {
      lastDrawn = -1;
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    let target = 0;
    let current = 0;
    const unsub = heroProgress.subscribe((p) => (target = p * (count - 1)));
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      current += (target - current) * 0.2;
      let idx = Math.round(current);
      if (!frames[idx]) {
        for (let d = 1; d < count; d++) {
          if (frames[idx - d]) { idx = idx - d; break; }
          if (frames[idx + d]) { idx = idx + d; break; }
        }
      }
      const img = frames[idx];
      if (!img || idx === lastDrawn) return;
      lastDrawn = idx;
      const cw = canvas.width, ch = canvas.height;
      const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * s, h = img.naturalHeight * s;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      unsub();
      window.removeEventListener("resize", resize);
    };
  }, [sequence, onReady]);

  return <canvas ref={canvasRef} aria-hidden="true" />;
}
