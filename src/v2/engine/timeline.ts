/**
 * The film, as data: 8 shots on one 0..1 scroll timeline.
 * Scene ranges mirror src/config/hero.ts (copy/HUD); this file owns the picture:
 * camera paths, lens, lighting cues, device states and post-processing.
 */
import * as THREE from "three";
import type { WorldState } from "./world/world";

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const range = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
export const smooth = (x: number) => x * x * (3 - 2 * x);
export const inOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const outCubic = (x: number) => 1 - Math.pow(1 - x, 3);
const lerp = THREE.MathUtils.lerp;
/** Fade in over [a,b], hold, fade out over [c,d]. */
export const window4 = (p: number, a: number, b: number, c: number, d: number) =>
  Math.min(smooth(range(p, a, b)), 1 - smooth(range(p, c, d)));

/** Vehicle path along the driveway (shared with the world so the POV can track it). */
export const carPositionAt = (t: number) => new THREE.Vector3(12.6, 0, THREE.MathUtils.lerp(78, 15, t));

export type Frame = {
  body: THREE.Vector3; // hero camera body centre (rest pose)
  lens: THREE.Vector3;
  axis: THREE.Vector3; // optical axis (rest pose)
  up: THREE.Vector3;
  side: THREE.Vector3;
  panel: THREE.Vector3;
  door: THREE.Vector3;
  car: THREE.Vector3;
};

export type Evaluated = {
  pos: THREE.Vector3;
  target: THREE.Vector3;
  fov: number;
  focus: number; // metres
  aperture: number;
  world: WorldState;
  post: { fade: number; flash: number; ir: number; system: number; letterbox: number; grain: number; exposure: number; bloom: number };
  pov: boolean;
};

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** Point in the hero camera's local frame (side, up, axis) around its body. */
const local = (f: Frame, s: number, u: number, a: number, origin: THREE.Vector3 = f.body) =>
  origin.clone().addScaledVector(f.side, s).addScaledVector(f.up, u).addScaledVector(f.axis, a);

const curveAt = (pts: THREE.Vector3[], t: number) =>
  pts.length === 2 ? pts[0].clone().lerp(pts[1], t) : new THREE.CatmullRomCurve3(pts, false, "centripetal").getPoint(t);

export function evaluate(p: number, time: number, f: Frame): Evaluated {
  let pos: THREE.Vector3, target: THREE.Vector3, fov: number, aperture: number;
  let pov = false;

  const lensFront = local(f, 0, 0, 0.04, f.lens);
  const wideA = V(-1.8, 2.1, 22.5);
  const buildingLook = V(1.6, 3.1, 0);

  if (p < 0.09) {
    // 00 — Darkness: slow creep toward the lens
    const t = smooth(range(p, 0, 0.09));
    pos = curveAt([local(f, -0.1, 0.03, 0.46), local(f, -0.12, 0.035, 0.38)], t);
    target = local(f, 0, 0, -0.03, f.lens);
    fov = 24;
    aperture = 0.03;
  } else if (p < 0.22) {
    // 01 — Reveal: orbit from the lens to the side profile (logo side)
    const t = inOut(range(p, 0.09, 0.22));
    pos = curveAt([local(f, -0.12, 0.035, 0.38), local(f, -0.3, 0.07, 0.26), local(f, -0.42, 0.1, 0.02)], t);
    target = local(f, 0, 0, -0.03, f.lens).lerp(local(f, 0, 0.01, 0), t);
    fov = lerp(24, 27, t);
    aperture = 0.028;
  } else if (p < 0.36) {
    // 02 — Architecture: pull back and around, the villa emerges from darkness
    const t = inOut(range(p, 0.22, 0.36));
    pos = curveAt([local(f, -0.42, 0.1, 0.02), local(f, -1.1, 0.35, 0.9), V(6.2, 2.9, 10.5), V(1.8, 2.4, 17.5), wideA], t);
    target = local(f, 0, 0.01, 0).lerp(buildingLook, smooth(clamp01(t * 1.35)));
    fov = lerp(27, 37, t);
    aperture = lerp(0.02, 0.0004, smooth(clamp01(t * 1.6)));
  } else if (p < 0.4) {
    // 03a — Push into the camera's lens
    const t = inOut(range(p, 0.36, 0.4));
    pos = curveAt([wideA, V(4.2, 2.8, 12.5), local(f, 0, 0.02, 0.9, f.lens), lensFront], t);
    target = buildingLook.clone().lerp(f.lens, smooth(clamp01(t * 1.4)));
    fov = lerp(37, 20, t);
    aperture = lerp(0.0004, 0.01, t);
  } else if (p < 0.5) {
    // 03b — POV: the camera's own infrared feed, tracking the vehicle
    pov = true;
    const t = range(p, 0.4, 0.495);
    pos = local(f, 0, 0, 0.06, f.lens);
    const rest = local(f, 0, -2.2, 12, f.lens);
    const track = carPositionAt(smooth(range(p, 0.4, 0.487))).add(V(0, 0.8, 0));
    target = rest.lerp(track, smooth(range(t, 0.05, 0.3)) * 0.85);
    fov = 58;
    aperture = 0;
  } else if (p < 0.64) {
    // 04 — Access: reader verifies, pivot door opens, warm light spills out
    const t = range(p, 0.5, 0.64);
    const push = smooth(range(t, 0, 0.5));
    const back = inOut(range(t, 0.5, 0.95));
    pos = t < 0.5
      ? curveAt([V(7.62, 1.5, 1.1), V(7.5, 1.46, 0.88)], push)
      : curveAt([V(7.5, 1.46, 0.88), V(6.9, 1.55, 2.2), V(6.55, 1.62, 3.5)], back);
    target = f.panel.clone().add(V(0, 0.02, 0)).lerp(V(6.8, 1.55, -2.0), back);
    fov = 34;
    aperture = lerp(0.006, 0.0025, back);
  } else if (p < 0.78) {
    // 05 — Automation: glide along the pool as the house comes alive
    const t = inOut(range(p, 0.64, 0.78));
    pos = curveAt([V(3.4, 0.95, 13.2), V(-2.2, 1.0, 13.8), V(-7.8, 1.1, 12.8)], t);
    target = curveAt([V(0.2, 2.6, -2.0), V(-3.4, 2.6, -2.2), V(-6.8, 2.6, -1.8)], t);
    fov = 34;
    aperture = 0.0009;
  } else if (p < 0.9) {
    // 06 — System: rise to a high three-quarter view, the network lights up
    const t = inOut(range(p, 0.78, 0.9));
    pos = curveAt([V(-7.8, 1.1, 12.8), V(-12, 6, 18), V(-19, 16, 27), V(-21, 21, 31)], t);
    target = V(-6.8, 2.6, -1.8).lerp(V(2.5, 0.5, 5), smooth(clamp01(t * 1.5)));
    fov = lerp(36, 38, t);
    aperture = 0.0003;
  } else {
    // 07 — Final hero: descend to the signature frame
    const t = inOut(range(p, 0.9, 1));
    pos = curveAt([V(-21, 21, 31), V(-13, 7.5, 30), V(-4.4, 1.75, 27.5)], t);
    target = V(2.5, 0.5, 5).lerp(V(1.4, 3.5, 0), t);
    fov = lerp(38, 33, t);
    aperture = 0.0005;
  }

  /* ---------- lighting & device cues ---------- */
  const worldUp = smooth(range(p, 0.2, 0.31)); // the villa emerges
  const facade = smooth(range(p, 0.23, 0.33));
  const base = 0.38 * smooth(range(p, 0.24, 0.34));
  // automation: zones ramp right → left, then stay on
  const zone = (a: number) => Math.max(base, smooth(range(p, a, a + 0.03)));
  const interior: [number, number, number] = p < 0.64 ? [base, base, base] : [zone(0.645), zone(0.675), zone(0.705)];
  const carT = p >= 0.4 && p < 0.5 ? smooth(range(p, 0.4, 0.487)) : -1;

  const world: WorldState = {
    time,
    sky: worldUp,
    fog: lerp(0.03, 0.0105, worldUp),
    envArch: 0.08 + 0.92 * worldUp,
    envDevice: p < 0.24 ? lerp(0.08, 1.15, smooth(range(p, 0.06, 0.16))) : 0.7,
    facade,
    interior,
    foyer: Math.max(0.3 * facade, smooth(range(p, 0.565, 0.6))),
    door: smooth(range(p, 0.575, 0.63)),
    shades: p < 0.64 ? 0 : 0.35 + 0.65 * smooth(range(p, 0.715, 0.77)),
    pool: smooth(range(p, 0.725, 0.76)),
    key: window4(p, 0.05, 0.14, 0.24, 0.3),
    keySweep: range(p, 0.05, 0.24),
    rim: window4(p, 0.015, 0.075, 0.24, 0.3),
    irGlow: p < 0.2 ? lerp(0.35, 1, smooth(range(p, 0, 0.05))) : lerp(1, 0.25, smooth(range(p, 0.2, 0.3))),
    dust: window4(p, 0.03, 0.1, 0.19, 0.25) * 0.9,
    cctvPan: p < 0.4 ? -0.16 * smooth(range(p, 0.13, 0.21)) + 0.1 * smooth(range(p, 0.28, 0.36)) : 0,
    cctvTilt: 0,
    cctvVisible: !pov,
    panel: p < 0.535 ? "idle" : p < 0.572 ? "scan" : "granted",
    panelT: time,
    car: carT,
    headlights: carT >= 0 ? 1 : 0,
    system: window4(p, 0.8, 0.845, 0.9, 0.93),
    cones: window4(p, 0.8, 0.85, 0.9, 0.93),
    touchScene: p < 0.7 ? 0 : 1,
  };

  /* ---------- post ---------- */
  const dip = (c: number, w = 0.008) => 1 - (1 - smooth(clamp01(Math.abs(p - c) / w)));
  const fade = Math.min(dip(0.5, 0.009), dip(0.64, 0.006));
  const flash = Math.max(0, 1 - Math.abs(p - 0.4) / 0.006) * 0.9;
  const ir = p >= 0.4 && p < 0.5 ? 1 : 0;
  const post = {
    fade,
    flash,
    ir,
    system: world.system,
    letterbox: 1 - smooth(range(p, 0.9, 0.96)),
    grain: ir ? 0.12 : 0.055,
    exposure: p < 0.22 ? 1.05 : 1.0,
    bloom: ir ? 0.25 : p < 0.22 ? 0.55 : 0.8,
  };

  // camera "breathing" — a whisper of handheld life
  const br = pov ? 0.25 : 1;
  const d = pos.distanceTo(target);
  const amp = Math.min(0.012 * d, 0.05) * br;
  pos.x += Math.sin(time * 0.37) * amp * 0.6 + Math.sin(time * 0.91) * amp * 0.25;
  pos.y += Math.sin(time * 0.53 + 1.3) * amp * 0.45;

  return { pos, target, fov, focus: d, aperture, world, post, pov };
}
