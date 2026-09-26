"use client";

import { MaskText, Reveal } from "@/components/ui/Reveal";
import { site } from "@/config/site";

/** Company section. Only statements about approach — no invented awards, years or numbers. */
const PILLARS = [
  {
    k: "Who we are",
    v: `${site.shortName} is a security and automation company. We design, install and support the systems that protect and run modern homes, offices and commercial spaces.`,
  },
  {
    k: "What we provide",
    v: "CCTV surveillance, smart home automation, video door phones, burglar alarms and access control — as individual systems or one integrated solution.",
  },
  {
    k: "How we work",
    v: "We start with your space: how it’s used, who moves through it and what matters most. Then we design coverage, access and automation around that — and stay with you after installation.",
  },
];

export default function About() {
  return (
    <section id="about" className="relative overflow-hidden border-t border-line bg-ink py-20 md:py-44">
      <div className="mx-auto max-w-[1680px] px-5 md:px-10">
        <div className="eyebrow mb-6 md:mb-10">About</div>
        <MaskText
          as="h2"
          lines={[
            "Security is no longer",
            "a camera on a wall.",
            <span key="c" className="text-white/40">
              It’s how a space thinks.
            </span>,
          ]}
          className="display max-w-[1400px] text-[clamp(34px,6.4vw,120px)] text-white"
        />

        <div className="mt-14 grid grid-cols-1 gap-10 border-t border-line pt-10 md:mt-24 md:grid-cols-3 md:gap-10 md:pt-12">
          {PILLARS.map((p, i) => (
            <Reveal key={p.k} delay={i * 0.1}>
              <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent/80">
                {String(i + 1).padStart(2, "0")} — {p.k}
              </div>
              <p className="mt-4 text-[16px] font-light leading-relaxed text-white/85 md:mt-5 md:text-[17px]">{p.v}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-16 grid grid-cols-1 items-end gap-8 md:mt-28 md:gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <p className="display text-[clamp(26px,3.2vw,56px)] text-white/90">
            Why integrated?
            <br />
            <span className="text-white/45">
              Because an alarm that can switch on the lights, a door that can tell the cameras who entered, and a phone that shows you all of it — is simply
              safer.
            </span>
          </p>
          <p className="text-[15px] leading-relaxed text-mist lg:pb-3">
            Separate systems leave gaps between them. Designed together, surveillance, access, alarms and automation share one view of your space — and respond as one.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
