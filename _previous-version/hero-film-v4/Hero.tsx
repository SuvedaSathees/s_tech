"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";
import { heroStore } from "@/lib/heroStore";
import { HERO_SCROLL_VH, ramp, window4 } from "@/config/heroTimeline";
import { site } from "@/config/site";
import MagneticButton from "@/components/ui/MagneticButton";
import HeroVideo from "./HeroVideo";
import HeroFrames from "./HeroFrames";

gsap.registerPlugin(ScrollTrigger);

// Heavy WebGL scene is code-split and client-only.
const HeroCanvas = dynamic(() => import("./HeroCanvas"), { ssr: false }) as ComponentType;

const SCENE_LABELS = [
  ["00", "Darkness"],
  ["01", "CCTV reveal"],
  ["02", "Identity"],
  ["03", "The residence"],
  ["04", "Intelligence"],
  ["05", "Access"],
  ["06", "Automation"],
  ["07", "Complete system"],
  ["08", "Control"],
] as const;
const SCENE_STARTS = [0, 0.07, 0.14, 0.27, 0.41, 0.53, 0.67, 0.79, 0.9];

const ANALYSIS = [
  { at: 0.43, k: "Motion", v: "Forecourt" },
  { at: 0.445, k: "Classified", v: "Person" },
  { at: 0.46, k: "Zone", v: "Armed · After hours" },
  { at: 0.474, k: "Response", v: "Floodlight · Owner alerted" },
];

const hasWebGL = () => {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
};

export default function Hero() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"frames" | "video" | "3d" | "static" | null>(null);

  useEffect(() => {
    setMode(site.hero.frames ? "frames" : site.hero.video ? "video" : hasWebGL() ? "3d" : "static");
    if (location.search.includes("debug")) (window as unknown as { __hero: typeof heroStore }).__hero = heroStore;
  }, []);

  /* ---------------- pin + progress */
  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: section.current!,
      start: "top top",
      end: `+=${(HERO_SCROLL_VH - 100) * 0.01 * window.innerHeight}`,
      pin: stage.current!,
      pinSpacing: true,
      scrub: false,
      invalidateOnRefresh: true,
      onUpdate: (self) => (heroStore.target = self.progress),
      onToggle: (self) => (heroStore.active = self.isActive || self.progress < 1),
    });
    const io = new IntersectionObserver(([e]) => (heroStore.active = e.isIntersecting), { threshold: 0 });
    io.observe(stage.current!);
    return () => {
      st.kill();
      io.disconnect();
    };
  }, []);

  /* ---------------- overlay controller (one ticker drives every layer) */
  useEffect(() => {
    const root = stage.current!;
    const windows = Array.from(root.querySelectorAll<HTMLElement>("[data-w]")).map((el) => ({
      el,
      w: el.dataset.w!.split(",").map(Number) as [number, number, number, number],
      y: Number(el.dataset.y || 0),
      depth: Number(el.dataset.depth || 0),
      interactive: el.dataset.interactive === "1",
    }));
    const depthLayers = Array.from(root.querySelectorAll<HTMLElement>("[data-layer]")).map((el) => ({
      el,
      d: Number(el.dataset.layer),
    }));
    const anchored = Array.from(root.querySelectorAll<HTMLElement>("[data-anchor]")).map((el) => ({
      el,
      a: el.dataset.anchor!,
      w: (el.dataset.aw || "0,0,1,1").split(",").map(Number) as [number, number, number, number],
    }));
    const steps = Array.from(root.querySelectorAll<HTMLElement>("[data-step]"));
    const sceneRows = Array.from(root.querySelectorAll<HTMLElement>("[data-scene]"));
    const bar = root.querySelector<HTMLElement>("[data-progress]");
    const box = root.querySelector<HTMLElement>("[data-track]");
    const clock = root.querySelector<HTMLElement>("[data-clock]");
    const status = root.querySelector<HTMLElement>("[data-reader-status]");
    const letterTop = root.querySelector<HTMLElement>("[data-letter='t']");
    const letterBot = root.querySelector<HTMLElement>("[data-letter='b']");
    const px = { x: 0, y: 0 };

    const updateAnchored = () => {
      const p = heroStore.current;
      for (const o of anchored) {
        const an = heroStore.anchors[o.a];
        const a = an && an.visible ? window4(p, ...o.w) : 0;
        o.el.style.opacity = a.toFixed(3);
        o.el.style.visibility = a < 0.002 ? "hidden" : "visible";
        if (an) o.el.style.transform = `translate3d(${an.x}px, ${an.y}px, 0)`;
      }
      // tracking bracket from projected head/feet
      if (box) {
        const t = heroStore.anchors.subjTop,
          b = heroStore.anchors.subjBot;
        const a = t && b && t.visible ? window4(p, 0.425, 0.44, 0.52, 0.545) : 0;
        box.style.opacity = a.toFixed(3);
        box.style.visibility = a < 0.002 ? "hidden" : "visible";
        if (t && b) {
          const h = Math.max(24, b.y - t.y);
          const w = h * 0.46;
          box.style.transform = `translate3d(${t.x - w / 2}px, ${t.y - h * 0.04}px, 0)`;
          box.style.width = `${w}px`;
          box.style.height = `${h * 1.06}px`;
        }
      }
    };
    anchored.forEach((o) => (o.el.style.visibility = "hidden"));
    if (box) box.style.visibility = "hidden";
    heroStore.onAnchors = updateAnchored;
    const tick = (_t: number, dtMs: number) => {
      const dt = Math.min(dtMs / 1000, 0.1);
      // critically-damped follow = cinematic weight on every scroll input
      const k = heroStore.reducedMotion ? 1 : 1 - Math.pow(0.0009, dt);
      heroStore.current += (heroStore.target - heroStore.current) * k;
      const p = heroStore.current;
      px.x += (heroStore.pointer.x - px.x) * 0.06;
      px.y += (heroStore.pointer.y - px.y) * 0.06;

      for (const o of windows) {
        const a = window4(p, ...o.w);
        o.el.style.opacity = a.toFixed(3);
        o.el.style.visibility = a < 0.002 ? "hidden" : "visible";
        const ty = (1 - a) * o.y * (p < o.w[1] ? 1 : -1);
        o.el.style.transform = `translate3d(${px.x * o.depth * -14}px, ${ty + px.y * o.depth * 10}px, 0)`;
        if (o.interactive) o.el.style.pointerEvents = a > 0.6 ? "auto" : "none";
      }
      for (const l of depthLayers) {
        l.el.style.transform = `translate3d(${px.x * l.d * -20}px, ${px.y * l.d * 12}px, 0) scale(${1 + l.d * 0.02})`;
      }
      steps.forEach((s, i) => {
        const on = p > ANALYSIS[i].at;
        s.dataset.on = on ? "1" : "0";
      });
      // scene index
      let idx = 0;
      for (let i = 0; i < SCENE_STARTS.length; i++) if (p >= SCENE_STARTS[i]) idx = i;
      sceneRows.forEach((r, i) => (r.dataset.active = i === idx ? "1" : "0"));
      if (bar) bar.style.transform = `scaleX(${p.toFixed(4)})`;
      if (clock) {
        const d = new Date();
        clock.textContent = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
      }
      if (status) {
        const s = p < 0.605 ? "Present credential" : p < 0.632 ? "Verifying" : "Access granted";
        if (status.textContent !== s) {
          status.textContent = s;
          status.dataset.state = p < 0.605 ? "idle" : p < 0.632 ? "scan" : "ok";
        }
      }
      // cinematic letterbox retracts after the macro reveal
      const lb = 1 - ramp(p, 0.24, 0.32);
      if (letterTop) letterTop.style.transform = `scaleY(${lb})`;
      if (letterBot) letterBot.style.transform = `scaleY(${lb})`;
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      heroStore.onAnchors = null;
    };
  }, [mode]);

  return (
    <section ref={section} id="top" aria-label="S Tec Secure — Security that thinks" className="relative">
      <div ref={stage} className="relative h-[100svh] w-full overflow-hidden bg-ink">
        {/* L1 — atmospheric back layer */}
        <div
          data-layer="0.3"
          aria-hidden
          className="absolute inset-[-4%]"
          style={{
            background:
              "radial-gradient(60% 50% at 70% 40%, rgba(40,60,80,.18), transparent 70%), radial-gradient(40% 40% at 20% 80%, rgba(95,212,255,.05), transparent 70%)",
          }}
        />

        {/* L2–L5 — visual: film or real-time scene */}
        <div className="absolute inset-0">
          {mode === "frames" && <HeroFrames />}
          {mode === "video" && <HeroVideo />}
          {mode === "3d" && <HeroCanvas />}
          {mode === "static" && (
            <div
              className="absolute inset-0"
              style={{
                background: site.hero.poster
                  ? `center/cover no-repeat url(${site.hero.poster})`
                  : "radial-gradient(80% 60% at 60% 45%, #1a2129, #050505 70%)",
              }}
            />
          )}
        </div>

        {/* footage mode: soft left + bottom scrim so headlines stay legible over bright frames */}
        {(mode === "video" || mode === "frames") && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[5]"
            style={{
              background:
                "linear-gradient(90deg, rgba(0,0,0,.72) 0%, rgba(0,0,0,.38) 38%, rgba(0,0,0,0) 62%), linear-gradient(0deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,0) 35%)",
            }}
          />
        )}

        {/* L7 — light haze that drifts with depth */}
        <div
          data-layer="1.2"
          aria-hidden
          className="pointer-events-none absolute inset-[-6%] mix-blend-screen"
          style={{ background: "radial-gradient(30% 22% at 76% 24%, rgba(160,200,255,.05), transparent 70%)" }}
        />

        {/* letterbox */}
        <div data-letter="t" aria-hidden className="absolute inset-x-0 top-0 z-10 h-[7vh] origin-top bg-black" />
        <div data-letter="b" aria-hidden className="absolute inset-x-0 bottom-0 z-10 h-[7vh] origin-bottom bg-black" />

        {/* L6 — surveillance interface */}
        <div className="pointer-events-none absolute inset-0 z-20">
          {/* camera frame brackets (S4–S5) */}
          <div data-w="0.29,0.33,0.53,0.56" className="absolute inset-[9vh_4vw]">
            {["left-0 top-0 border-l border-t", "right-0 top-0 border-r border-t", "left-0 bottom-0 border-l border-b", "right-0 bottom-0 border-r border-b"].map((c) => (
              <span key={c} className={`absolute h-6 w-6 border-white/35 ${c}`} />
            ))}
            <div className="absolute left-5 top-4 flex items-center gap-3 font-mono text-[10px] tracking-[0.22em] text-white/70">
              <span className="anim-blink inline-block h-1.5 w-1.5 rounded-full bg-[#ff4a3d]" />
              REC <span className="text-white/40">·</span> CAM 01 <span className="text-white/40">·</span> FORECOURT
            </div>
            <div data-clock className="absolute right-5 top-4 font-mono text-[10px] tracking-[0.22em] text-white/60" />
          </div>

          {/* zone label on the ground */}
          <div data-anchor="zone" data-aw="0.31,0.35,0.52,0.55" className="absolute left-0 top-0">
            <div className="-translate-x-1/2 font-mono text-[10px] tracking-[0.22em] text-accent/80">ZONE A · FORECOURT</div>
          </div>

          {/* tracking bracket */}
          <div data-track className="absolute left-0 top-0 will-change-transform">
            <span className="absolute left-0 top-0 h-3 w-3 border-l border-t border-accent" />
            <span className="absolute right-0 top-0 h-3 w-3 border-r border-t border-accent" />
            <span className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-accent" />
            <span className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-accent" />
            <span className="absolute -top-6 left-0 whitespace-nowrap font-mono text-[10px] tracking-[0.2em] text-accent">PERSON · TRACKING</span>
          </div>

          {/* analysis pipeline (S5) */}
          <div data-w="0.425,0.44,0.525,0.545" data-y="16" data-depth="0.6" className="absolute bottom-[14vh] right-[5vw] w-[min(360px,80vw)]">
            <div className="eyebrow mb-4 text-accent/80">Real world → Analysis → Response</div>
            <ol className="border-l border-line-2">
              {ANALYSIS.map((a) => (
                <li
                  key={a.k}
                  data-step
                  className="group relative flex items-baseline justify-between gap-6 py-2 pl-5 font-mono text-[11px] tracking-[0.14em] text-white/25 transition-colors duration-500 data-[on='1']:text-white/85"
                >
                  <span className="absolute -left-[3px] top-1/2 h-[5px] w-[5px] -translate-y-1/2 rounded-full bg-white/20 transition-colors duration-500 group-data-[on='1']:bg-accent" />
                  <span className="uppercase">{a.k}</span>
                  <span className="text-right uppercase">{a.v}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* alert notification (S5 response) */}
          <div data-w="0.476,0.486,0.53,0.55" data-y="-14" className="glass absolute right-[5vw] top-[12vh] w-[min(320px,80vw)] border border-line-2 p-4">
            <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.2em] text-mist">
              <span>S TEC SECURE</span>
              <span>NOW</span>
            </div>
            <div className="mt-2 text-[14px] text-white">Person detected at the forecourt</div>
            <div className="mt-1 text-[12px] text-mist">Floodlight on · Recording · Tap for live view</div>
          </div>

          {/* reader status (S6) */}
          <div data-anchor="reader" data-aw="0.585,0.6,0.655,0.67" className="absolute left-0 top-0">
            <div className="ml-6 -translate-y-1/2 whitespace-nowrap">
              <div className="h-px w-10 bg-white/40" />
              <div
                data-reader-status
                data-state="idle"
                className="mt-2 font-mono text-[10px] tracking-[0.22em] uppercase text-white/80 data-[state='ok']:text-ok data-[state='scan']:text-accent"
              />
            </div>
          </div>

          {/* automation tags (S7) */}
          {[
            ["lights", "Lighting", "Arrival scene"],
            ["curtains", "Curtains", "Closing"],
            ["climate", "Climate", "24 °C · Auto"],
          ].map(([a, k, v], i) => (
            <div key={a} data-anchor={a} data-aw={`${0.672 + i * 0.012},${0.69 + i * 0.012},0.775,0.79`} className="absolute left-0 top-0">
              <div className="flex -translate-x-1/2 -translate-y-full flex-col items-center">
                <div className="glass whitespace-nowrap border border-line-2 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em]">
                  <span className="text-mist">{k}</span> <span className="ml-2 text-white">{v}</span>
                </div>
                <div className="h-8 w-px bg-gradient-to-b from-white/40 to-transparent" />
              </div>
            </div>
          ))}

          {/* ecosystem labels (S8) */}
          {[
            ["n-cctv", "CCTV"],
            ["n-access", "Access Control"],
            ["n-automation", "Home Automation"],
            ["n-doorphone", "Video Door Phone"],
            ["n-alarm", "Burglar Alarm"],
          ].map(([a, l]) => (
            <div key={a} data-anchor={a} data-aw="0.8,0.83,0.895,0.915" className="absolute left-0 top-0">
              <div className="ml-4 -translate-y-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.22em] text-white/85">{l}</div>
            </div>
          ))}
          <div data-anchor="hub" data-aw="0.8,0.835,0.895,0.915" className="absolute left-0 top-0">
            <div className="-translate-x-1/2 translate-y-8 whitespace-nowrap text-center">
              <div className="text-[12px] font-semibold tracking-[0.34em] text-white">S TEC SECURE</div>
              <div className="mt-1 font-mono text-[9px] tracking-[0.24em] text-accent/80">ONE INTELLIGENT SYSTEM</div>
            </div>
          </div>
        </div>

        {/* L6 — typography */}
        <div className="pointer-events-none absolute inset-0 z-30 mx-auto max-w-[1680px] px-5 md:px-10">
          {/* S1 — anticipation */}
          <div data-w="-1,0,0.03,0.06" className="absolute bottom-[12vh] left-1/2 -translate-x-1/2 text-center">
            <div className="eyebrow">Scroll to enter</div>
            <div className="mx-auto mt-4 h-12 w-px overflow-hidden bg-white/10">
              <div className="h-1/2 w-px animate-[scan-y_2.4s_var(--ease-cine)_infinite] bg-white/70" style={{ ["--scan" as string]: "24px" }} />
            </div>
          </div>

          {/* S3 — brand */}
          <div data-w="0.14,0.175,0.245,0.275" data-y="30" data-depth="0.5" className="absolute bottom-[14vh] left-5 md:left-10">
            <div className="eyebrow mb-6 tracking-[0.5em] text-white/70">{site.name}</div>
            <h1 className="display text-[clamp(56px,10.5vw,190px)] text-white">
              <span className="block">Security</span>
              <span className="block text-white/55">that thinks.</span>
            </h1>
          </div>

          {/* S4 — surveillance caption */}
          <div data-w="0.33,0.355,0.405,0.42" data-y="24" data-depth="0.5" className="absolute bottom-[14vh] left-5 md:left-10">
            <div className="eyebrow mb-4 text-accent/80">01 — Surveillance</div>
            <p className="display text-[clamp(32px,4.2vw,68px)] text-white">
              Every angle, watched.
              <br />
              <span className="text-white/50">Every movement, understood.</span>
            </p>
          </div>

          {/* S5 — intelligence caption */}
          <div data-w="0.425,0.445,0.525,0.545" data-y="24" data-depth="0.5" className="absolute left-5 top-[16vh] md:left-10">
            <div className="eyebrow mb-4 text-accent/80">02 — Intelligence</div>
            <p className="display text-[clamp(30px,3.8vw,60px)] text-white">
              It doesn’t just record.
              <br />
              <span className="text-white/50">It responds.</span>
            </p>
          </div>

          {/* S6 — access */}
          <div data-w="0.575,0.6,0.66,0.675" data-y="24" data-depth="0.5" className="absolute bottom-[14vh] right-5 text-right md:right-10">
            <div className="eyebrow mb-4 text-accent/80">03 — Access Control</div>
            <p className="display text-[clamp(30px,3.8vw,60px)] text-white">
              Security that also
              <br />
              <span className="text-white/50">decides who enters.</span>
            </p>
          </div>

          {/* S7 — automation statement */}
          <div data-w="0.7,0.725,0.775,0.79" data-y="30" data-depth="0.4" className="absolute bottom-[12vh] left-5 md:left-10">
            <div className="eyebrow mb-5 text-accent/80">04 — Automation</div>
            <p className="display text-[clamp(38px,6vw,104px)] text-white">
              <span className="block">One space.</span>
              <span className="block text-white/60">Many systems.</span>
              <span className="block text-white/35">One intelligent experience.</span>
            </p>
          </div>

          {/* S9 — final */}
          <div data-w="0.925,0.965,2,2" data-y="30" data-depth="0.3" data-interactive="1" className="absolute bottom-[12vh] left-5 md:left-10">
            <h2 className="display text-[clamp(52px,9vw,168px)] text-white">
              <span className="block">Security.</span>
              <span className="block text-white/60">Intelligence.</span>
              <span className="block text-white/35">Control.</span>
            </h2>
            <p className="mt-8 max-w-[420px] text-[15px] leading-relaxed text-mist">{site.statement}</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <MagneticButton href="#solutions" variant="solid">
                Explore solutions
              </MagneticButton>
              <MagneticButton href="#contact">Talk to an expert</MagneticButton>
            </div>
          </div>
        </div>

        {/* scene index — compact chapter marker, bottom right */}
        <div className="pointer-events-none absolute bottom-[3.2vh] right-5 z-30 hidden items-center gap-5 md:right-10 md:flex">
          <div className="relative h-5 min-w-[150px]">
            {SCENE_LABELS.map(([n, l]) => (
              <div
                key={n}
                data-scene
                className="absolute inset-0 flex items-center justify-end gap-3 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.22em] text-white/80 opacity-0 transition-opacity duration-500 data-[active='1']:opacity-100"
              >
                <span className="text-white/35">{n} / 08</span> {l}
              </div>
            ))}
          </div>
          <div className="relative h-px w-28 bg-white/15">
            <div data-progress className="absolute inset-0 origin-left bg-white/80" style={{ transform: "scaleX(0)" }} />
          </div>
        </div>

        {/* grain on top of everything */}
        <div aria-hidden className="grain pointer-events-none absolute inset-0 z-40" />
        {/* bottom fade into the page */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-24 bg-gradient-to-b from-transparent to-ink" style={{ opacity: 0.6 }} />
      </div>
    </section>
  );
}
