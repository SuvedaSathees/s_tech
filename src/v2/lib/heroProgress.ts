/** Tiny pub/sub for the hero's scroll progress (no React re-renders per frame). */
type Fn = (p: number) => void;
const subs = new Set<Fn>();
let value = 0;

export const heroProgress = {
  get: () => value,
  set(p: number) {
    value = p;
    subs.forEach((f) => f(p));
  },
  subscribe(f: Fn) {
    subs.add(f);
    f(value);
    return () => {
      subs.delete(f);
    };
  },
};

/** Tracked subject from the real-time film (normalised screen box), for the HUD. */
export type HeroTarget = { x: number; y: number; w: number; h: number; dist: number } | null;
type TFn = (t: HeroTarget) => void;
const tsubs = new Set<TFn>();
let target: HeroTarget = null;
export const heroTarget = {
  get: () => target,
  set(t: HeroTarget) {
    target = t;
    tsubs.forEach((f) => f(t));
  },
  subscribe(f: TFn) {
    tsubs.add(f);
    return () => {
      tsubs.delete(f);
    };
  },
};
