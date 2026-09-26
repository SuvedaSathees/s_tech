"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { services } from "@/config/site";
import { PLATES } from "@/components/visuals/Plates";
import { MaskText } from "@/components/ui/Reveal";
import { getLenis } from "@/components/SmoothScroll";

gsap.registerPlugin(ScrollTrigger);

/**
 * Pinned product-experience: scroll (or click) moves through five systems;
 * the central environment re-stages itself for each one.
 */
export default function Solutions() {
  const wrap = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const stRef = useRef<ScrollTrigger | null>(null);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const set = () => setIsDesktop(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;
    const n = services.length;
    const st = ScrollTrigger.create({
      trigger: wrap.current!,
      start: "top top",
      end: `+=${n * 85}%`,
      pin: pin.current!,
      snap: { snapTo: 1 / (n - 1), duration: { min: 0.3, max: 0.8 }, ease: "power2.inOut", delay: 0.08 },
      onUpdate: (self) => setActive(Math.min(n - 1, Math.round(self.progress * (n - 1)))),
    });
    stRef.current = st;
    return () => st.kill();
  }, [isDesktop]);

  const go = (i: number) => {
    const st = stRef.current;
    if (!st || !isDesktop) return setActive(i);
    const y = st.start + ((st.end - st.start) * i) / (services.length - 1);
    const l = getLenis();
    if (l) l.scrollTo(y, { duration: 1.2 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  const svc = services[active];

  return (
    <section ref={wrap} id="solutions" className="relative bg-ink">
      <div ref={pin} className="relative flex min-h-[100svh] flex-col overflow-hidden lg:h-[100svh]">
        <div className="mx-auto flex w-full max-w-[1680px] flex-1 flex-col px-5 pb-10 pt-28 md:px-10 lg:pt-32">
          <div className="flex flex-col justify-between gap-6 border-b border-line pb-8 md:flex-row md:items-end">
            <div>
              <div className="eyebrow mb-5">Solutions</div>
              <MaskText lines={["Five systems.", <span key="b" className="text-white/45">One point of control.</span>]} className="display text-[clamp(40px,5.2vw,92px)] text-white" />
            </div>
            <p className="max-w-[380px] text-[15px] leading-relaxed text-mist">
              Each system is powerful on its own. Designed and installed together, they become one intelligent layer across your space.
            </p>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-10 pt-10 lg:grid-cols-[minmax(320px,0.9fr)_1.6fr] lg:gap-16">
            {/* list */}
            <ol className="flex flex-col" role="tablist" aria-label="Solutions">
              {services.map((s, i) => {
                const on = i === active;
                return (
                  <li key={s.id} className="border-b border-line">
                    <button
                      role="tab"
                      aria-selected={on}
                      onClick={() => go(i)}
                      className="group flex w-full items-baseline gap-6 py-5 text-left lg:py-6"
                    >
                      <span className={`font-mono text-[11px] tracking-[0.2em] transition-colors duration-500 ${on ? "text-accent" : "text-dim"}`}>{s.no}</span>
                      <span className="flex-1">
                        <span
                          className={`block text-[clamp(22px,2.1vw,34px)] font-light tracking-[-0.02em] transition-colors duration-500 ${
                            on ? "text-white" : "text-white/35 group-hover:text-white/70"
                          }`}
                        >
                          {s.title}
                        </span>
                        <span
                          className="grid transition-[grid-template-rows,opacity] duration-700 ease-[var(--ease-lux)]"
                          style={{ gridTemplateRows: on ? "1fr" : "0fr", opacity: on ? 1 : 0 }}
                        >
                          <span className="overflow-hidden">
                            <span className="block pt-3 text-[15px] leading-relaxed text-mist">{s.line}</span>
                          </span>
                        </span>
                      </span>
                      <span className={`h-px transition-all duration-700 ease-[var(--ease-lux)] ${on ? "w-10 bg-accent" : "w-4 bg-white/20"}`} />
                    </button>
                  </li>
                );
              })}
            </ol>

            {/* stage */}
            <div className="relative min-h-[380px] overflow-hidden border border-line bg-ink-2 lg:min-h-0">
              {services.map((s, i) => {
                const Plate = PLATES[s.id];
                const on = i === active;
                return (
                  <div
                    key={s.id}
                    aria-hidden={!on}
                    className="absolute inset-0 transition-[opacity,transform,filter] duration-[1200ms] ease-[var(--ease-lux)]"
                    style={{
                      opacity: on ? 1 : 0,
                      transform: on ? "scale(1)" : `scale(${i < active ? 0.96 : 1.04})`,
                      filter: on ? "blur(0)" : "blur(6px)",
                    }}
                  >
                    <Plate />
                  </div>
                );
              })}
              {/* stage chrome */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_70%_at_50%_40%,transparent,rgba(5,5,5,.75))]" />
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex flex-wrap items-end justify-between gap-4 p-6 md:p-8">
                <div>
                  <div className="font-mono text-[11px] tracking-[0.2em] text-accent">{svc.no} / 05</div>
                  <div className="mt-2 text-[22px] font-light tracking-[-0.01em] text-white md:text-[28px]">{svc.title}</div>
                </div>
                <ul className="flex flex-wrap gap-x-6 gap-y-2">
                  {svc.points.map((pt) => (
                    <li key={pt} className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist">
                      — {pt}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pointer-events-none absolute left-6 top-6 flex gap-1.5 md:left-8 md:top-8">
                {services.map((s, i) => (
                  <span key={s.id} className={`h-px transition-all duration-700 ${i === active ? "w-8 bg-white" : "w-3 bg-white/25"}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
