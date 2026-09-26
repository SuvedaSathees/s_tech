/**
 * The hero is ONE continuous story mapped onto scroll progress 0 → 1.
 * Both the footage (video mode) and the real-time scene (3D mode) read these
 * ranges, so overlays stay in sync regardless of which visual layer is used.
 *
 * If you cut a real film, time each scene to these proportions of the total
 * runtime (see docs/HERO_FILM_BRIEF.md).
 */
export const SCENES = {
  darkness: [0.0, 0.07],
  reveal: [0.07, 0.19],
  brand: [0.14, 0.27],
  surveillance: [0.27, 0.41],
  intelligence: [0.41, 0.53],
  access: [0.53, 0.67],
  automation: [0.67, 0.79],
  ecosystem: [0.79, 0.9],
  final: [0.9, 1.0],
} as const;

export type SceneName = keyof typeof SCENES;

/** Total pinned scroll length of the hero, in viewport heights. */
export const HERO_SCROLL_VH = 1100;

// ---------- easing helpers shared by 3D + overlays ----------
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const smooth = (t: number) => t * t * (3 - 2 * t);
export const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

/** 0→1 as p goes a→b */
export const ramp = (p: number, a: number, b: number) => smooth(clamp01((p - a) / (b - a)));

/** fade in over [a,b], hold, fade out over [c,d] */
export const window4 = (p: number, a: number, b: number, c: number, d: number) =>
  Math.min(ramp(p, a, b), 1 - ramp(p, c, d));

export const sceneProgress = (p: number, s: SceneName) => {
  const [a, b] = SCENES[s];
  return clamp01((p - a) / (b - a));
};
