"use client";

import type { ReactNode } from "react";
import { MaskText, Reveal } from "@/components/ui/Reveal";

const A = "#5fd4ff";

/* Each diagram animates the feature it names — nothing ornamental. */
const Diag = {
  surveillance: (
    <>
      <rect x="10" y="10" width="220" height="140" className="plate-line" />
      {/* swaying branch: seen, ignored */}
      <g opacity=".45">
        <path d="M40 150 C 44 110, 38 80, 52 50" className="plate-line-strong">
          <animateTransform attributeName="transform" type="rotate" values="-4 40 150;4 40 150;-4 40 150" dur="3s" repeatCount="indefinite" />
        </path>
        <text x="24" y="30" className="plate-text">Ignored</text>
      </g>
      {/* person: classified + tracked */}
      <g>
        <circle cx="0" cy="-34" r="7" className="plate-line-strong" />
        <path d="M-8 0 L-6 -24 Q0 -28 6 -24 L8 0 M-4 0 L-5 28 M4 0 L5 28" className="plate-line-strong" />
        <rect x="-18" y="-46" width="36" height="80" stroke={A} fill="none" />
        <text x="-18" y="-52" className="plate-text" style={{ fill: A }}>Person</text>
        <animateTransform attributeName="transform" type="translate" values="120 110;190 110;120 110" dur="8s" repeatCount="indefinite" />
      </g>
    </>
  ),
  remote: (
    <>
      <path d="M30 120 L70 88 L110 120 V150 H30Z" className="plate-line-strong" />
      <path d="M92 100 C 120 40, 150 30, 168 40" stroke={A} fill="none" className="anim-dash" />
      <rect x="160" y="16" width="64" height="130" rx="10" className="plate-line-strong" />
      {[0, 1].map((r) =>
        [0, 1].map((c) => <rect key={`${r}${c}`} x={168 + c * 25} y={34 + r * 34} width="22" height="28" className="plate-line" />),
      )}
      <circle cx="172" cy="112" r="2.5" fill="#ff4a3d" className="anim-blink" />
      <text x="178" y="115" className="plate-text">Live</text>
    </>
  ),
  access: (
    <>
      <rect x="24" y="50" width="44" height="64" rx="6" className="plate-line-strong" />
      <circle cx="46" cy="96" r="9" stroke={A} fill="none" />
      <path d="M72 82 H128" stroke={A} className="anim-dash" />
      <rect x="136" y="70" width="44" height="36" rx="3" className="plate-line-strong" />
      <path d="M146 70 V56 a12 12 0 0 1 24 0 V70" className="plate-line-strong">
        <animateTransform attributeName="transform" type="translate" values="0 0;0 0;0 -8;0 -8;0 0" keyTimes="0;.35;.45;.85;1" dur="4s" repeatCount="indefinite" />
      </path>
      <text x="136" y="130" className="plate-text" style={{ fill: "#7fe0b0" }}>
        Entry logged
        <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.4;.5;.85;1" dur="4s" repeatCount="indefinite" />
      </text>
    </>
  ),
  automation: (
    <>
      {["Lights", "Climate", "Curtains"].map((l, i) => (
        <g key={l} transform={`translate(20 ${28 + i * 40})`}>
          <text x="0" y="12" className="plate-text">{l}</text>
          <rect x="130" y="0" width="44" height="18" rx="9" className="plate-line-strong" />
          <circle cx="139" cy="9" r="6" fill={A}>
            <animate attributeName="cx" values="139;139;165;165;139" keyTimes={`0;${0.15 + i * 0.12};${0.22 + i * 0.12};.85;1`} dur="6s" repeatCount="indefinite" />
          </circle>
        </g>
      ))}
    </>
  ),
  alerts: (
    <>
      <line x1="20" y1="80" x2="220" y2="80" className="plate-line" />
      <circle cx="50" cy="80" r="5" fill="#ff4a3d" />
      <circle cx="50" cy="80" r="5" stroke="#ff4a3d" fill="none">
        <animate attributeName="r" values="5;22" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values=".8;0" dur="2s" repeatCount="indefinite" />
      </circle>
      <text x="30" y="110" className="plate-text">Event</text>
      <path d="M58 80 H150" stroke={A} className="anim-dash" />
      <rect x="152" y="40" width="68" height="80" rx="8" className="plate-line-strong" />
      <rect x="158" y="52" width="56" height="18" fill={A} opacity=".18">
        <animate attributeName="opacity" values="0;.25;.25;0" keyTimes="0;.2;.8;1" dur="2s" repeatCount="indefinite" />
      </rect>
      <text x="162" y="64" className="plate-text" style={{ fill: "#fff" }}>Alert</text>
    </>
  ),
  connected: (
    <>
      {[
        [120, 80],
        [40, 40],
        [200, 40],
        [40, 130],
        [200, 130],
        [120, 150],
      ].map(([x, y], i, arr) => (
        <g key={i}>
          {i > 0 && <line x1={arr[0][0]} y1={arr[0][1]} x2={x} y2={y} stroke="rgba(95,212,255,.45)" />}
          <circle cx={x} cy={y} r={i === 0 ? 8 : 4} fill={i === 0 ? "none" : "#e9ebee"} stroke={i === 0 ? A : "none"} />
          {i > 0 && (
            <circle r="2" fill={A}>
              <animateMotion dur={`${1.8 + i * 0.25}s`} repeatCount="indefinite" path={`M${x} ${y} L120 80`} />
            </circle>
          )}
        </g>
      ))}
    </>
  ),
} satisfies Record<string, ReactNode>;

const FEATURES = [
  { k: "surveillance", t: "Intelligent Surveillance", d: "Smart detection can tell people from background movement — so alerts mean something." },
  { k: "remote", t: "Remote Monitoring", d: "Every camera, live, on your phone. Wherever you are." },
  { k: "access", t: "Smart Access", d: "Fingerprint, card or phone. Every entry verified and logged." },
  { k: "automation", t: "Home Automation", d: "Lights, climate and curtains that follow scenes and schedules." },
  { k: "alerts", t: "Real-Time Alerts", d: "When something happens, you know — immediately, on your device." },
  { k: "connected", t: "Connected Security", d: "Systems share events, so one trigger sets off the right response everywhere." },
] as const;

export default function Technology() {
  return (
    <section id="technology" className="relative border-t border-line bg-ink-2 py-20 md:py-40">
      <div className="mx-auto max-w-[1680px] px-5 md:px-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <div className="eyebrow mb-5">Technology</div>
            <MaskText lines={["Intelligence,", <span key="b" className="text-white/45">made visible.</span>]} className="display text-[clamp(36px,5vw,88px)] text-white" />
            <p className="mt-8 max-w-[400px] text-[15px] leading-relaxed text-mist">
              The capabilities that turn hardware into a system that watches, understands and responds.
            </p>
          </div>

          <div className="grid grid-cols-1 border-l border-t border-line sm:grid-cols-2">
            {FEATURES.map((f, i) => (
              <Reveal key={f.k} delay={(i % 2) * 0.08} className="group border-b border-r border-line">
                <div className="flex h-full flex-col p-6 md:p-9">
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-[11px] tracking-[0.2em] text-dim">{String(i + 1).padStart(2, "0")}</span>
                    <span className="h-px w-6 bg-white/20 transition-all duration-700 ease-[var(--ease-lux)] group-hover:w-12 group-hover:bg-accent" />
                  </div>
                  <div className="mx-auto my-6 w-full max-w-[340px] [perspective:900px] md:my-8 md:max-w-none">
                    <svg
                      viewBox="0 0 240 160"
                      className="w-full transition-transform duration-[900ms] ease-[var(--ease-lux)] group-hover:[transform:rotateX(18deg)_rotateZ(-2deg)_translateY(-6px)]"
                      role="img"
                      aria-label={f.t}
                    >
                      {Diag[f.k]}
                    </svg>
                  </div>
                  <h3 className="text-[22px] font-light tracking-[-0.015em] text-white">{f.t}</h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-mist">{f.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
