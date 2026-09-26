"use client";

import { useEffect, useRef, type ComponentType } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { site } from "@/config/site";
import { MaskText } from "@/components/ui/Reveal";
import { ElevCommercial, ElevOffice, ElevProject, ElevVilla } from "@/components/visuals/Elevations";

gsap.registerPlugin(ScrollTrigger);

type Slide = {
  key: string;
  kicker: string;
  title: string;
  body: string;
  scope: string[];
  Visual?: ComponentType;
  image?: string;
};

/** Shown until real case studies are added to site.projects. No invented clients. */
const SPACES: Slide[] = [
  {
    key: "villa",
    kicker: "Residences & villas",
    title: "The private home",
    body: "Perimeter cameras, a video door phone at the gate, biometric entry and automation that sets the house for your arrival.",
    scope: ["CCTV", "Video Door Phone", "Access Control", "Automation"],
    Visual: ElevVilla,
  },
  {
    key: "office",
    kicker: "Offices",
    title: "The workplace",
    body: "Controlled entry for staff and visitors, monitored common areas and after-hours intrusion alerts.",
    scope: ["Access Control", "CCTV", "Burglar Alarm"],
    Visual: ElevOffice,
  },
  {
    key: "commercial",
    kicker: "Commercial property",
    title: "The storefront",
    body: "Wide-area surveillance, remote viewing for owners and managers, and alarm response when the doors are closed.",
    scope: ["CCTV", "Burglar Alarm", "Remote Monitoring"],
    Visual: ElevCommercial,
  },
  {
    key: "project",
    kicker: "Your project",
    title: "Planned from the drawings",
    body: "Bring us in early. Cabling, camera positions and control points are designed with the architecture — not added after it.",
    scope: ["Consultation", "System design", "Installation"],
    Visual: ElevProject,
  },
];

export default function Projects() {
  const wrap = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  const slides: Slide[] = site.projects.length
    ? site.projects.map((p) => ({
        key: p.title,
        kicker: [p.sector, p.location].filter(Boolean).join(" · "),
        title: p.title,
        body: p.summary,
        scope: p.scope,
        image: p.image,
      }))
    : SPACES;

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const el = track.current!;
      const dist = () => el.scrollWidth - window.innerWidth;
      const tween = gsap.to(el, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: {
          trigger: wrap.current!,
          start: "top top",
          end: () => `+=${dist()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          refreshPriority: -1, // measure after the hero + solutions pins above it
        },
      });
      // inner image parallax + subtle zoom, tied to the horizontal tween
      el.querySelectorAll<HTMLElement>("[data-par]").forEach((img) => {
        gsap.fromTo(
          img,
          { xPercent: -8, scale: 1.12 },
          {
            xPercent: 8,
            scale: 1.02,
            ease: "none",
            scrollTrigger: { trigger: img.parentElement!, containerAnimation: tween, start: "left right", end: "right left", scrub: true },
          },
        );
      });
      el.querySelectorAll<HTMLElement>("[data-txt]").forEach((t) => {
        gsap.fromTo(
          t.children,
          { yPercent: 100, autoAlpha: 0 },
          {
            yPercent: 0,
            autoAlpha: 1,
            stagger: 0.06,
            ease: "expo.out",
            duration: 1.2,
            scrollTrigger: { trigger: t, containerAnimation: tween, start: "left 75%" },
          },
        );
      });
    });
    // Pins are created by different components in mount order; re-sort and re-measure
    // once everything above has mounted, otherwise this pin starts in the wrong place
    // and leaves a blank gap in the page.
    const raf = requestAnimationFrame(() => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    });
    return () => {
      cancelAnimationFrame(raf);
      mm.revert();
    };
  }, []);

  return (
    <section ref={wrap} id="projects" className="relative overflow-hidden border-t border-line bg-ink">
      <div className="flex flex-col justify-center py-20 md:min-h-[100svh] md:py-24 lg:h-[100svh] lg:py-0">
        <div
          ref={track}
          className="flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto overscroll-x-contain px-5 [scrollbar-width:none] md:scroll-px-10 md:gap-5 md:px-10 lg:snap-none lg:gap-10 lg:overflow-visible [&::-webkit-scrollbar]:hidden"
        >
          {/* intro panel */}
          <div className="flex w-[84vw] shrink-0 snap-start flex-col justify-end pb-6 sm:w-[70vw] lg:w-[34vw]">
            <div className="eyebrow mb-5">Projects</div>
            <MaskText lines={["Spaces", <span key="b" className="text-white/45">we secure.</span>]} className="display text-[clamp(38px,6vw,110px)] text-white" />
            <p className="mt-8 max-w-[380px] text-[15px] leading-relaxed text-mist">
              {site.projects.length
                ? "Selected installations across homes, workplaces and commercial property."
                : "Homes, offices and commercial property — each designed as one integrated system. Case studies will appear here."}
            </p>
            <div className="mt-10 hidden items-center gap-4 font-mono text-[10px] uppercase tracking-[0.22em] text-dim lg:flex">
              Scroll <span className="h-px w-16 bg-white/20" />
            </div>
            <div className="mt-8 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.22em] text-dim lg:hidden">
              Swipe <span className="h-px w-12 bg-white/20" /> →
            </div>
          </div>

          {slides.map((s, i) => (
            <article key={s.key} className="relative flex w-[84vw] shrink-0 snap-start flex-col sm:w-[70vw] lg:w-[62vw]">
              <div className="relative aspect-[16/10] w-full overflow-hidden border border-line bg-ink-2 lg:aspect-auto lg:h-[64vh]">
                <div data-par className="absolute inset-[-6%] will-change-transform">
                  {s.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.image} alt={s.title} className="h-full w-full object-cover" loading="lazy" />
                  ) : s.Visual ? (
                    <s.Visual />
                  ) : null}
                </div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
                <div className="absolute left-5 top-5 font-mono text-[10px] tracking-[0.22em] text-white/60 md:left-7 md:top-7">
                  {String(i + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 pt-7 md:grid-cols-[1fr_1fr]">
                <div data-txt className="overflow-hidden">
                  <div className="eyebrow text-accent/80">{s.kicker}</div>
                  <h3 className="mt-3 text-[clamp(26px,2.6vw,44px)] font-light tracking-[-0.025em] text-white">{s.title}</h3>
                </div>
                <div>
                  <p className="text-[15px] leading-relaxed text-mist">{s.body}</p>
                  <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                    {s.scope.map((x) => (
                      <li key={x} className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
                        — {x}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
          <div className="w-[4vw] shrink-0" aria-hidden />
        </div>
      </div>
    </section>
  );
}
