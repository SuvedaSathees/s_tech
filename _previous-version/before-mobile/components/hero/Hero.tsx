"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";
import { heroStore } from "@/lib/heroStore";
import { HERO_SCROLL_VH, window4 } from "@/config/heroTimeline";
import { site, whatsappLink } from "@/config/site";
import MagneticButton from "@/components/ui/MagneticButton";
import HeroVideo from "./HeroVideo";
import HeroFrames from "./HeroFrames";

gsap.registerPlugin(ScrollTrigger);

// Real-time fallback scene (only when no film is configured).
const HeroCanvas = dynamic(() => import("./HeroCanvas"), { ssr: false }) as ComponentType;

/**
 * Six chapters, one real evening at home — each maps to a slice of the film.
 * `w` = [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd] in scroll progress.
 * Keep these in sync with the cut of /media/hero/stec-hero-720.mp4.
 */
const CHAPTERS = [
  {
    no: "01",
    label: "Gate Automation",
    line: ["The gate opens", "as you arrive."],
    chip: ["Main gate", "Opening"],
    w: [0.045, 0.075, 0.115, 0.14],
  },
  {
    no: "02",
    label: "Access Control",
    line: ["Face or finger.", "The door unlocks."],
    chip: ["Face ID", "Verified · Unlocked"],
    w: [0.17, 0.2, 0.32, 0.345],
  },
  {
    no: "03",
    label: "Smart Curtains",
    line: ["Curtains close", "on their own."],
    chip: ["Curtains", "Closing"],
    w: [0.375, 0.4, 0.47, 0.495],
  },
  {
    no: "04",
    label: "Lights & Fan",
    line: ["Lights on. Fan on.", "No switch touched."],
    chip: ["Living room", "Evening scene"],
    w: [0.525, 0.55, 0.625, 0.65],
  },
  {
    no: "05",
    label: "CCTV & Alarm",
    line: ["Watched 24/7,", "even while you rest."],
    chip: ["REC · CAM 01", "Armed"],
    w: [0.675, 0.7, 0.765, 0.785],
  },
] as const;

/** chapter start points for the index (last one = final brand frame) */
const STARTS = [0, 0.152, 0.356, 0.508, 0.66, 0.795];
const INDEX_LABELS = ["Gate", "Access", "Curtains", "Lights & fan", "CCTV", "S TEC Secure"];

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
  const wa = whatsappLink();

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

  /* ---------------- one ticker drives every overlay */
  useEffect(() => {
    const root = stage.current!;
    const windows = Array.from(root.querySelectorAll<HTMLElement>("[data-w]")).map((el) => ({
      el,
      w: el.dataset.w!.split(",").map(Number) as [number, number, number, number],
      y: Number(el.dataset.y || 0),
      interactive: el.dataset.interactive === "1",
    }));
    const rows = Array.from(root.querySelectorAll<HTMLElement>("[data-scene]"));
    const bar = root.querySelector<HTMLElement>("[data-progress]");
    const clock = root.querySelector<HTMLElement>("[data-clock]");

    const tick = (_t: number, dtMs: number) => {
      const dt = Math.min(dtMs / 1000, 0.1);
      const k = heroStore.reducedMotion ? 1 : 1 - Math.pow(0.0009, dt);
      heroStore.current += (heroStore.target - heroStore.current) * k;
      const p = heroStore.current;

      for (const o of windows) {
        const a = window4(p, ...o.w);
        o.el.style.opacity = a.toFixed(3);
        o.el.style.visibility = a < 0.002 ? "hidden" : "visible";
        const ty = (1 - a) * o.y * (p < o.w[1] ? 1 : -1);
        o.el.style.transform = `translate3d(0, ${ty}px, 0)`;
        if (o.interactive) o.el.style.pointerEvents = a > 0.6 ? "auto" : "none";
      }
      let idx = 0;
      for (let i = 0; i < STARTS.length; i++) if (p >= STARTS[i]) idx = i;
      rows.forEach((r, i) => (r.dataset.active = i === idx ? "1" : "0"));
      if (bar) bar.style.transform = `scaleX(${p.toFixed(4)})`;
      if (clock) {
        const d = new Date();
        clock.textContent = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
      }
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [mode]);

  return (
    <section ref={section} id="top" aria-label={`${site.name} — ${site.descriptor}`} className="relative">
      <div ref={stage} className="relative h-[100svh] w-full overflow-hidden bg-ink">
        {/* film (or fallback) */}
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

        {/* soft scrim so type stays legible over bright footage (side-lit on desktop, top/bottom on phones) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[5] hidden portrait:block"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,0) 22%), linear-gradient(0deg, rgba(0,0,0,.78) 0%, rgba(0,0,0,.35) 30%, rgba(0,0,0,0) 52%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[5] portrait:hidden"
          style={{
            background:
              "linear-gradient(90deg, rgba(0,0,0,.6) 0%, rgba(0,0,0,.25) 34%, rgba(0,0,0,0) 58%), linear-gradient(0deg, rgba(0,0,0,.5) 0%, rgba(0,0,0,0) 32%)",
          }}
        />

        {/* live status chip — top right, one per chapter */}
        <div className="pointer-events-none absolute right-5 top-[12vh] z-20 md:right-10">
          {CHAPTERS.map((c) => (
            <div
              key={c.no}
              data-w={c.w.join(",")}
              data-y="-10"
              className="glass absolute right-0 top-0 flex items-center gap-3 whitespace-nowrap border border-line-2 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.2em]"
            >
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${c.no === "05" ? "anim-blink bg-[#ff4a3d]" : "bg-ok"}`} />
              <span className="text-mist">{c.chip[0]}</span>
              <span className="text-white">{c.chip[1]}</span>
              {c.no === "05" && <span data-clock className="text-white/50" />}
            </div>
          ))}
        </div>

        {/* typography */}
        <div className="pointer-events-none absolute inset-0 z-30 mx-auto max-w-[1680px] px-5 md:px-10">
          {/* opening — brand + scroll cue */}
          <div data-w="-1,0,0.025,0.045" data-y="20" className="absolute bottom-[14vh] left-5 md:left-10">
            <div className="eyebrow mb-5 tracking-[0.5em] text-white/70">{site.descriptor}</div>
            <h1 className="display text-[clamp(52px,9vw,160px)] text-white">
              <span className="block">{site.name}</span>
              <span className="block text-white/55">{site.tagline}</span>
            </h1>
            <div className="eyebrow mt-8 flex items-center gap-4 text-white/60">
              <span className="relative block h-8 w-px overflow-hidden bg-white/15">
                <span className="absolute inset-x-0 top-0 h-1/2 animate-[scan-y_2.4s_var(--ease-cine)_infinite] bg-white/70" style={{ ["--scan" as string]: "16px" }} />
              </span>
              Scroll — see it happen
            </div>
          </div>

          {/* chapters */}
          {CHAPTERS.map((c) => (
            <div key={c.no} data-w={c.w.join(",")} data-y="24" className="absolute bottom-[14vh] left-5 md:left-10">
              <div className="eyebrow mb-4 text-accent/80">
                {c.no} — {c.label}
              </div>
              <p className="display text-[clamp(34px,4.6vw,76px)] text-white">
                {c.line[0]}
                <br />
                <span className="text-white/55">{c.line[1]}</span>
              </p>
            </div>
          ))}

          {/* final — S TEC brings it all together */}
          <div data-w="0.82,0.87,2,2" data-y="30" data-interactive="1" className="absolute left-5 top-[13vh] md:left-10">
            <div className="eyebrow mb-5 tracking-[0.5em] text-white/70">{site.name}</div>
            <h2 className="display text-[clamp(40px,5.6vw,96px)] text-white">
              <span className="block">One app.</span>
              <span className="block text-white/55">Your whole home.</span>
            </h2>
            <p className="mt-6 max-w-[440px] text-[15px] leading-relaxed text-mist">
              Gate automation, access control, home automation, CCTV and alarms — installed and supported by {site.shortName}.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              {wa ? (
                <MagneticButton href={wa} variant="solid" external>
                  WhatsApp us
                </MagneticButton>
              ) : (
                <MagneticButton href="#contact" variant="solid">
                  Talk to an expert
                </MagneticButton>
              )}
              <MagneticButton href="#solutions">Explore solutions</MagneticButton>
            </div>
          </div>
        </div>

        {/* chapter index */}
        <div className="pointer-events-none absolute bottom-[3.2vh] right-5 z-30 hidden items-center gap-5 md:right-10 md:flex">
          <div className="relative h-5 min-w-[160px]">
            {INDEX_LABELS.map((l, i) => (
              <div
                key={l}
                data-scene
                className="absolute inset-0 flex items-center justify-end gap-3 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.22em] text-white/80 opacity-0 transition-opacity duration-500 data-[active='1']:opacity-100"
              >
                <span className="text-white/35">0{i + 1} / 06</span> {l}
              </div>
            ))}
          </div>
          <div className="relative h-px w-28 bg-white/15">
            <div data-progress className="absolute inset-0 origin-left bg-white/80" style={{ transform: "scaleX(0)" }} />
          </div>
        </div>

        <div aria-hidden className="grain pointer-events-none absolute inset-0 z-40" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-24 bg-gradient-to-b from-transparent to-ink" style={{ opacity: 0.6 }} />
      </div>
    </section>
  );
}
