/**
 * HERO — scroll-driven film.
 *
 * The hero is one pinned scroll timeline (progress 0 → 1) split into 8 scenes.
 * Everything — the picture, the copy, the HUD and the scene index — reads
 * from this file, so replacing the picture never breaks the storytelling.
 *
 * PICTURE SOURCE (first match wins):
 *   1. film.sequence   image frames scrubbed on a canvas (smoothest, Apple-style)
 *   2. film.video      one MP4/WebM scrubbed by scroll (easiest)
 *   3. real-time       the built-in Three.js film (no assets needed)
 *
 * See docs/VISUAL_CONCEPT.md for the shot list, AI-video prompts and encoding.
 */

export type HeroFilm = {
  /** Image sequence, e.g. "/media/hero/frames/stec_{index}.webp" with {index} zero-padded. */
  sequence?: {
    pattern: string;
    count: number;
    pad: number; // digits in {index}, e.g. 4 → 0001
    start?: number; // first index, default 1
    /** Optional lighter sequence for phones (portrait crop recommended). */
    mobilePattern?: string;
    mobileCount?: number;
  };
  /** Single film file scrubbed by scroll (encode with a keyframe every frame). */
  video?: {
    src: string; // "/media/hero/stec-hero-1080.mp4"
    srcMobile?: string; // "/media/hero/stec-hero-720-portrait.mp4"
  };
  /** Shown while the film loads and when motion is reduced. */
  poster?: string;
  /** Draw the surveillance / access HUD over footage (turn off if the film has its own). */
  overlayHud: boolean;
};

export const heroFilm: HeroFilm = {
  // sequence: { pattern: "/media/hero/frames/stec_{index}.webp", count: 480, pad: 4 },
  // video: { src: "/media/hero/stec-hero-1080.mp4" },
  poster: "/media/hero/poster.jpg",
  overlayHud: true,
};

/** Scroll length of the pinned hero, in viewport heights. */
export const HERO_SCROLL_VH = 1000;

export type HeroScene = {
  id: string;
  index: string;
  label: string; // scene index (right rail)
  start: number; // progress 0..1
  end: number;
  eyebrow?: string;
  title?: string;
  body?: string;
  align?: "left" | "right" | "center";
  /** Where this scene sits in a filmed master (seconds) — used only in video mode if set. */
  filmTime?: [number, number];
};

export const heroScenes: HeroScene[] = [
  {
    id: "darkness",
    index: "00",
    label: "Darkness",
    start: 0,
    end: 0.09,
    eyebrow: "S TEC SECURE",
    title: "In the dark,\nnothing goes unseen.",
    align: "center",
  },
  {
    id: "reveal",
    index: "01",
    label: "Vision",
    start: 0.09,
    end: 0.22,
    eyebrow: "01 — Surveillance Hardware",
    title: "Precision optics.\nAlways awake.",
    body: "Starlight imaging, infrared reach and intelligent detection — engineered to see what others miss.",
    align: "left",
  },
  {
    id: "architecture",
    index: "02",
    label: "Architecture",
    start: 0.22,
    end: 0.36,
    eyebrow: "02 — Designed for Modern Spaces",
    title: "Security that respects\nthe architecture.",
    body: "Concealed, considered and precisely placed — protection that disappears into the design.",
    align: "left",
  },
  {
    id: "surveillance",
    index: "03",
    label: "Surveillance",
    start: 0.36,
    end: 0.5,
    eyebrow: "03 — Intelligent Surveillance",
    title: "It doesn't just record.\nIt understands.",
    body: "People and vehicles are classified in real time. Wind, rain and shadows are ignored.",
    align: "right",
  },
  {
    id: "access",
    index: "04",
    label: "Access",
    start: 0.5,
    end: 0.64,
    eyebrow: "04 — Access Control & Video Door Phones",
    title: "Only the right people.\nAt the right time.",
    body: "Face, card and mobile credentials. See, speak and open — from anywhere.",
    align: "left",
  },
  {
    id: "automation",
    index: "05",
    label: "Automation",
    start: 0.64,
    end: 0.78,
    eyebrow: "05 — Smart Automation",
    title: "A home that\nresponds to you.",
    body: "Lighting, climate and shades move with your day — and with your security.",
    align: "right",
  },
  {
    id: "system",
    index: "06",
    label: "System",
    start: 0.78,
    end: 0.9,
    eyebrow: "06 — One Intelligent System",
    title: "Every device.\nOne mind.",
    body: "Cameras, access, alarms and automation share every event — and act as one.",
    align: "left",
  },
  {
    id: "final",
    index: "07",
    label: "S TEC",
    start: 0.9,
    end: 1,
    align: "center",
  },
];

export const heroFinal = {
  title: ["Security.", "Intelligence.", "Control."],
  subtitle: "Intelligent security and automation for modern spaces.",
  primary: { label: "Explore Solutions", href: "#solutions" },
  secondary: { label: "Book a Consultation", href: "#contact" },
};
