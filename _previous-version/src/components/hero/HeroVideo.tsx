"use client";

import { useEffect, useRef } from "react";
import { heroStore } from "@/lib/heroStore";
import { site } from "@/config/site";

/**
 * Scroll-scrubbed film layer. Used automatically when site.hero.video is set.
 * The film must be encoded all-intra (keyframe every frame) for smooth
 * seeking — see docs/HERO_FILM_BRIEF.md.
 */
export default function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current!;
    let raf = 0;
    let lastSeek = -1;
    const loop = () => {
      if (v.duration && heroStore.active) {
        const t = heroStore.current * (v.duration - 0.05);
        // seek only when the change is perceptible; avoid seek storms
        if (Math.abs(t - lastSeek) > 1 / 60 && !v.seeking) {
          v.currentTime = t;
          lastSeek = t;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      v.pause();
      raf = requestAnimationFrame(loop);
    };
    if (v.readyState >= 1) start();
    else v.addEventListener("loadedmetadata", start, { once: true });
    return () => cancelAnimationFrame(raf);
  }, []);

  const portrait = typeof window !== "undefined" && window.innerHeight > window.innerWidth;
  const src = portrait && site.hero.videoMobile ? site.hero.videoMobile : site.hero.video;

  return (
    <video
      ref={ref}
      className="absolute inset-0 h-full w-full object-cover"
      src={src}
      poster={site.hero.poster || undefined}
      muted
      playsInline
      preload="auto"
      aria-hidden
    />
  );
}
