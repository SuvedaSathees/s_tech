import * as THREE from "three";
import { clamp01, ramp, smoother } from "@/config/heroTimeline";

/** World layout in metres. Villa front faces +Z. */
export const W = {
  /** CCTV head (under the roof overhang, front-right corner) */
  cctv: new THREE.Vector3(5.8, 3.2, 5.6),
  cctvMountY: 3.385,
  /** where the camera watches by default */
  cctvAim: new THREE.Vector3(2.2, 0.2, 10.5),
  /** pivot entrance door */
  door: { x: -4.8, z: 4.3, w: 1.3, h: 2.9 },
  reader: new THREE.Vector3(-3.92, 1.32, 4.36),
  doorPhone: new THREE.Vector3(-6.5, 1.45, 12.84),
  siren: new THREE.Vector3(-6.7, 2.85, 4.36),
  pir: new THREE.Vector3(6.9, 2.95, 4.05),
  automation: new THREE.Vector3(2.4, 3.3, -0.6),
  hub: new THREE.Vector3(-0.4, 8.6, 4.2),
};

/**
 * Subject path (a resident arriving at night). Keyed on hero progress.
 * Returns position, heading and walk-phase weight.
 */
const path = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(9.5, 0, 17.5),
    new THREE.Vector3(5.5, 0, 12.8),
    new THREE.Vector3(1.2, 0, 9.6),
    new THREE.Vector3(-2.4, 0, 7.3),
    new THREE.Vector3(-4.3, 0, 5.1),
  ],
  false,
  "centripetal",
);
const inside = new THREE.Vector3(-4.8, 0, 2.2);

export const SUBJECT = {
  walkIn: [0.335, 0.505] as const, // S4→S5 approach across forecourt (pauses at detection)
  walkToDoor: [0.54, 0.605] as const,
  verify: [0.605, 0.635] as const,
  enter: [0.648, 0.69] as const,
};

const tmp = new THREE.Vector3();
export function subjectState(p: number, out: THREE.Vector3) {
  // u along path 0..1: first 60% during walkIn, remaining during walkToDoor
  const a = clamp01((p - SUBJECT.walkIn[0]) / (SUBJECT.walkIn[1] - SUBJECT.walkIn[0]));
  const b = clamp01((p - SUBJECT.walkToDoor[0]) / (SUBJECT.walkToDoor[1] - SUBJECT.walkToDoor[0]));
  const u = a * 0.6 + b * 0.4;
  path.getPointAt(Math.min(u, 0.999), out);
  path.getTangentAt(Math.min(u, 0.999), tmp);
  let heading = Math.atan2(tmp.x, tmp.z);
  const e = clamp01((p - SUBJECT.enter[0]) / (SUBJECT.enter[1] - SUBJECT.enter[0]));
  if (e > 0) {
    const from = path.getPointAt(0.999);
    out.lerpVectors(from, inside, smoother(e));
    heading = Math.atan2(inside.x - from.x, inside.z - from.z);
  }
  // when verifying, face the reader
  const v = ramp(p, SUBJECT.verify[0], SUBJECT.verify[0] + 0.01) * (1 - ramp(p, SUBJECT.enter[0] - 0.005, SUBJECT.enter[0]));
  heading = heading * (1 - v) + Math.atan2(W.reader.x - out.x, W.reader.z - out.z) * v;
  const moving =
    (a > 0 && a < 1 ? 1 : 0) || (b > 0 && b < 1 ? 1 : 0) || (e > 0 && e < 1 ? 1 : 0);
  const visible = p > SUBJECT.walkIn[0] - 0.01 && e < 0.98;
  return { heading, moving: moving as number, visible, walkDist: u * path.getLength() + e * 3.2 };
}
