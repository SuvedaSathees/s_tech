"use client";
import { useEffect, useRef } from "react";
import { heroProgress } from "@/lib/heroProgress";
import { progressToFilmTime, isSmallScreen } from "./filmTime";

type Props = { src: string; srcMobile?: string; poster?: string; onReady: () => void };

/**
 * One film file, scrubbed by scroll. For smooth seeking, encode with a keyframe
 * on every frame (see docs/VISUAL_CONCEPT.md → Encoding).
 */
export default function VideoFilm({ src, srcMobile, poster, onReady }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current!;
    let duration = 0;
    let target = 0;
    let current = 0;
    let raf = 0;
    const onMeta = () => {
      duration = v.duration || 0;
    };
    const onData = () => onReady();
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("loadeddata", onData, { once: true });
    if (v.readyState >= 1) onMeta();
    if (v.readyState >= 2) onReady();

    // iOS needs a user gesture before it will seek a paused video
    const unlock = () => {
      v.play().then(() => v.pause()).catch(() => {});
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true, passive: true });

    const unsub = heroProgress.subscribe((p) => {
      if (duration) target = progressToFilmTime(p, duration);
    });
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!duration) return;
      current += (target - current) * 0.18;
      if (Math.abs(v.currentTime - current) > 1 / 60 && !v.seeking) v.currentTime = current;
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      unsub();
      v.removeEventListener("loadedmetadata", onMeta);
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, [onReady]);

  const file = isSmallScreen() && srcMobile ? srcMobile : src;
  return <video ref={ref} src={file} poster={poster} muted playsInline preload="auto" aria-hidden="true" />;
}
