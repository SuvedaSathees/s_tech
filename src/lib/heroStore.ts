/**
 * Tiny mutable store shared between the ScrollTrigger (writer), the R3F scene
 * and the DOM overlays (readers). Mutable on purpose: it is read every frame
 * and must never trigger React re-renders.
 */
export type Anchor = { x: number; y: number; visible: boolean };

export const heroStore = {
  /** raw scroll progress from ScrollTrigger */
  target: 0,
  /** damped progress — everything renders from this */
  current: 0,
  /** normalised pointer, -1..1 */
  pointer: { x: 0, y: 0 },
  /** screen-space positions of 3D points, written by the scene each frame */
  anchors: {} as Record<string, Anchor>,
  /** true while the hero is on screen */
  active: true,
  reducedMotion: false,
  /** called by the 3D scene right after anchors are projected (keeps DOM labels frame-locked) */
  onAnchors: null as null | (() => void),
};

export const setAnchor = (name: string, x: number, y: number, visible: boolean) => {
  const a = heroStore.anchors[name] || (heroStore.anchors[name] = { x: 0, y: 0, visible: false });
  a.x = x;
  a.y = y;
  a.visible = visible;
};
