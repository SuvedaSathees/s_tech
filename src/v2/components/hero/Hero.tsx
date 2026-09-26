"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { HERO_SCROLL_VH, heroFilm, heroFinal, heroScenes } from "@/v2/config/hero";
import { heroProgress } from "@/v2/lib/heroProgress";
import { gsap, ScrollTrigger } from "@/v2/lib/gsap";
import { useReducedMotion } from "@/v2/lib/useReducedMotion";
import Arrow from "../ui/Arrow";
import HeroHud from "./HeroHud";
import RealtimeFilm from "./RealtimeFilm";
import VideoFilm from "./VideoFilm";
import SequenceFilm from "./SequenceFilm";

type Mode = "sequence" | "video" | "realtime" | "poster";

const FINAL_IN = 0.935;

/**
 * Pinned, scroll-driven hero. The picture layer is swappable (frame sequence,
 * video or real-time 3D); copy, HUD, scene rail and end-card are driven by one
 * GSAP timeline scrubbed by ScrollTrigger.
 */
export default function Hero() {
  const section = useRef<HTMLElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const barWrap = useRef<HTMLDivElement>(null);
  const final = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [mode, setMode] = useState<Mode>(heroFilm.sequence ? "sequence" : heroFilm.video ? "video" : "realtime");
  const [ready, setReady] = useState(false);

  const onReady = useCallback(() => setReady(true), []);
  const onUnsupported = useCallback(() => {
    setMode("poster");
    setReady(true);
  }, []);

  // never leave visitors on the loader
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 9000);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (reduced) setMode("poster");
  }, [reduced]);

  // scroll → progress, and the overlay timeline
  useEffect(() => {
    const sec = section.current!;
    const root = overlay.current!;
    // reduced motion: no scroll film — show the end-card over the poster
    const st = reduced
      ? null
      : ScrollTrigger.create({
          trigger: sec,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (s) => heroProgress.set(s.progress),
        });

    const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
    heroScenes.forEach((scene, i) => {
      const el = root.querySelector<HTMLElement>(`[data-scene="${scene.id}"]`);
      if (!el) return;
      const lines = el.querySelectorAll(".line > span");
      const extras = el.querySelectorAll(".scene-copy__eyebrow, .scene-copy__body");
      const d = Math.min(0.03, (scene.end - scene.start) * 0.28);
      if (i === 0) {
        gsap.set(el, { autoAlpha: 1 });
        tl.fromTo(el, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -24, duration: 0.025, ease: "power2.in", immediateRender: false }, 0.055);
        return;
      }
      const a = scene.start + 0.014;
      tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: d * 0.5 }, a);
      tl.fromTo(lines, { yPercent: 112 }, { yPercent: 0, duration: d, stagger: d * 0.18, ease: "power3.out" }, a);
      tl.fromTo(extras, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: d, stagger: d * 0.25, ease: "power2.out" }, a + d * 0.25);
      tl.to(el, { autoAlpha: 0, y: -28, duration: d * 0.7, ease: "power2.in" }, scene.end - d * 0.85);
    });
    // end-card
    const fin = final.current!;
    tl.fromTo(fin, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.02 }, FINAL_IN);
    tl.fromTo(fin.querySelectorAll(".w > span"), { yPercent: 110 }, { yPercent: 0, duration: 0.03, stagger: 0.008, ease: "power3.out" }, FINAL_IN);
    tl.fromTo(fin.querySelectorAll(".hero-final__sub, .hero-final__ctas"), { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.025, stagger: 0.008, ease: "power2.out" }, FINAL_IN + 0.02);
    tl.set({}, {}, 1); // timeline length = 1 → progress maps 1:1

    const railItems = rail.current ? Array.from(rail.current.querySelectorAll<HTMLElement>(".rail__item")) : [];
    let lastIdx = -1;
    const unsub = heroProgress.subscribe((p) => {
      tl.progress(p);
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
      const idx = heroScenes.findIndex((s) => p >= s.start && p < s.end);
      const i = idx === -1 ? heroScenes.length - 1 : idx;
      if (i !== lastIdx) {
        railItems.forEach((r, k) => r.classList.toggle("is-active", k === i));
        lastIdx = i;
      }
      const late = p > 0.915;
      if (rail.current) rail.current.style.opacity = late ? "0" : "1";
      if (barWrap.current) barWrap.current.style.opacity = late ? "0" : "1";
      fin.classList.toggle("is-live", p > FINAL_IN + 0.01);
    });

    if (reduced) heroProgress.set(1);
    return () => {
      unsub();
      st?.kill();
      tl.kill();
    };
  }, [reduced]);

  // first-screen intro animation (time-based, not scroll)
  useEffect(() => {
    if (!ready) return;
    const root = overlay.current!;
    const el = root.querySelector<HTMLElement>(`[data-scene="${heroScenes[0].id}"]`);
    if (!el) return;
    const tw = gsap.fromTo(
      el.querySelectorAll(".line > span, .scene-copy__eyebrow"),
      { yPercent: 110, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 1.6, stagger: 0.14, ease: "power3.out", delay: 0.5 },
    );
    return () => {
      tw.kill();
    };
  }, [ready]);

  const poster = heroFilm.poster;
  const showPoster = mode === "poster" || mode === "video" || mode === "sequence";

  return (
    <section
      id="top"
      ref={section}
      className="hero"
      style={{ height: mode === "poster" && reduced ? "100svh" : `${HERO_SCROLL_VH}vh` }}
      aria-label="S TEC SECURE — intelligent security and automation"
    >
      <div className="hero__stage">
        <div className="hero__picture">
          {poster && <div className={`hero__poster ${showPoster ? "is-on" : ""}`} style={{ backgroundImage: `url(${poster})` }} />}
          {mode === "realtime" && <RealtimeFilm onReady={onReady} onUnsupported={onUnsupported} />}
          {mode === "video" && heroFilm.video && (
            <VideoFilm src={heroFilm.video.src} srcMobile={heroFilm.video.srcMobile} poster={poster} onReady={onReady} />
          )}
          {mode === "sequence" && heroFilm.sequence && <SequenceFilm sequence={heroFilm.sequence} onReady={onReady} />}
        </div>

        <div className="hero__scrim" />
        {heroFilm.overlayHud && mode !== "poster" && <HeroHud tracking={mode === "realtime"} />}

        <div className="hero__overlay" ref={overlay}>
          {heroScenes
            .filter((s) => s.title)
            .map((s) => (
              <div key={s.id} data-scene={s.id} className={`scene-copy scene-copy--${s.align ?? "left"}`}>
                {s.eyebrow && <span className="eyebrow scene-copy__eyebrow">{s.eyebrow}</span>}
                <h2 className="scene-copy__title">
                  {s.title!.split("\n").map((line, i) => (
                    <span className="line" key={i}>
                      <span>{line}</span>
                    </span>
                  ))}
                </h2>
                {s.body && <p className="scene-copy__body">{s.body}</p>}
              </div>
            ))}
        </div>

        <div className="hero-final" ref={final}>
          <h1 className="hero-final__title">
            {heroFinal.title.map((w) => (
              <span className="w" key={w}>
                <span>
                  {w.replace(".", "")}
                  <span className="dot">.</span>
                </span>
              </span>
            ))}
          </h1>
          <p className="hero-final__sub">{heroFinal.subtitle}</p>
          <div className="hero-final__ctas">
            <a className="btn btn--gold" href={heroFinal.primary.href}>
              {heroFinal.primary.label} <Arrow />
            </a>
            <a className="btn" href={heroFinal.secondary.href}>
              {heroFinal.secondary.label}
            </a>
          </div>
        </div>

        <div className="rail" ref={rail} aria-hidden="true">
          {heroScenes.map((s) => (
            <div className="rail__item" key={s.id}>
              <span className="lbl">{s.label}</span>
              <span>{s.index}</span>
              <i />
            </div>
          ))}
        </div>

        <div className="hero__bar" ref={barWrap} aria-hidden="true">
          <span className="hero__cue">
            <i /> Scroll
          </span>
          <span className="hero__progress">
            <span ref={bar} />
          </span>
          <span>S TEC SECURE · Film</span>
        </div>

        <div className={`hero__loader ${ready ? "is-done" : ""}`} aria-hidden="true">
          <div className="hero__loader-inner">
            <span className="eyebrow">S TEC SECURE</span>
            <span className="hero__loader-bar" />
          </div>
        </div>
      </div>
    </section>
  );
}
