import { heroScenes } from "@/config/hero";

/**
 * Map hero progress (0..1) to a time in the master film.
 * If every scene declares `filmTime`, mapping is piecewise per scene
 * (so a film's cuts land exactly on the copy); otherwise it is linear.
 */
export function progressToFilmTime(p: number, duration: number) {
  const timed = heroScenes.every((s) => s.filmTime);
  if (!timed) return p * duration;
  const s = heroScenes.find((sc) => p >= sc.start && p <= sc.end) ?? heroScenes[heroScenes.length - 1];
  const [t0, t1] = s.filmTime!;
  const u = (p - s.start) / Math.max(1e-6, s.end - s.start);
  return Math.min(duration, t0 + u * (t1 - t0));
}

export const isSmallScreen = () => typeof window !== "undefined" && window.matchMedia("(max-width: 760px)").matches;
