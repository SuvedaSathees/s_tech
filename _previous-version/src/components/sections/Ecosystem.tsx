"use client";

import { useState } from "react";
import { MaskText, Reveal } from "@/components/ui/Reveal";

/**
 * Interactive ecosystem. Hovering / focusing a system shows how it works WITH
 * the others — every line represents a real integration, not decoration.
 */
const NODES = [
  { id: "cctv", label: "CCTV", angle: -90, links: ["alarm", "doorphone", "access"], text: "Cameras verify every alarm, record every entry and put a face to every visitor." },
  { id: "access", label: "Access Control", angle: -18, links: ["cctv", "automation", "alarm"], text: "A verified entry can disarm the alarm and trigger an arrival scene — lights, climate, curtains." },
  { id: "automation", label: "Automation", angle: 54, links: ["access", "alarm", "cctv"], text: "Lighting and devices respond to security events — lights on when motion is detected at night." },
  { id: "alarm", label: "Burglar Alarm", angle: 126, links: ["cctv", "automation", "access"], text: "An intrusion alert fans out: siren, recording, lights and an instant notification on your phone." },
  { id: "doorphone", label: "Video Door Phone", angle: 198, links: ["access", "cctv"], text: "See and speak to visitors from anywhere, then open the gate or door remotely." },
] as const;

const CX = 400,
  CY = 330,
  R = 230;
const pos = (deg: number) => [CX + Math.cos((deg * Math.PI) / 180) * R, CY + Math.sin((deg * Math.PI) / 180) * R * 0.82] as const;

export default function Ecosystem() {
  const [hover, setHover] = useState<string | null>(null);
  const cur = NODES.find((n) => n.id === hover);
  const linked = (a: string, b: string) => !hover || hover === a || hover === b;

  return (
    <section id="ecosystem" className="relative overflow-hidden border-t border-line bg-ink py-28 md:py-40">
      <div className="mx-auto grid max-w-[1680px] grid-cols-1 items-center gap-16 px-5 md:px-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <div className="eyebrow mb-5">Security ecosystem</div>
          <MaskText
            lines={["Not five products.", <span key="b" className="text-white/45">One infrastructure.</span>]}
            className="display text-[clamp(40px,5vw,88px)] text-white"
          />
          <Reveal className="mt-10 max-w-[440px]">
            <p className="text-[15px] leading-relaxed text-mist">
              When surveillance, access, alarms, intercom and automation are planned together, each system makes the others smarter.
            </p>
            <div className="mt-10 min-h-[120px] border-l border-line-2 pl-6" aria-live="polite">
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">{cur ? cur.label : "Hover a system"}</div>
              <p className="mt-3 text-[18px] font-light leading-snug text-white/90">
                {cur ? cur.text : "Every connection on the map is a real integration between two systems."}
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal y={40}>
          <svg viewBox="0 0 800 660" className="w-full" role="group" aria-label="S Tec Secure ecosystem map">
            <defs>
              <radialGradient id="hubGlow">
                <stop offset="0" stopColor="#5fd4ff" stopOpacity=".22" />
                <stop offset="1" stopColor="#5fd4ff" stopOpacity="0" />
              </radialGradient>
            </defs>
            <ellipse cx={CX} cy={CY} rx={R} ry={R * 0.82} className="plate-line" strokeDasharray="2 8" />
            <ellipse cx={CX} cy={CY} rx={R * 0.55} ry={R * 0.45} className="plate-line" opacity=".5" />
            {/* peer links */}
            {NODES.flatMap((n) =>
              n.links
                .filter((l) => n.id < l)
                .map((l) => {
                  const m = NODES.find((x) => x.id === l)!;
                  const [x1, y1] = pos(n.angle);
                  const [x2, y2] = pos(m.angle);
                  const on = hover && linked(n.id, l);
                  return (
                    <path
                      key={n.id + l}
                      d={`M${x1} ${y1} Q ${CX} ${CY} ${x2} ${y2}`}
                      fill="none"
                      stroke={on ? "#5fd4ff" : "rgba(255,255,255,.1)"}
                      strokeOpacity={hover && !on ? 0.3 : 1}
                      className={on ? "anim-dash" : ""}
                      style={{ transition: "stroke .5s, stroke-opacity .5s" }}
                    />
                  );
                }),
            )}
            {/* spokes to hub */}
            {NODES.map((n) => {
              const [x, y] = pos(n.angle);
              const on = !hover || hover === n.id;
              return (
                <g key={"s" + n.id}>
                  <line x1={CX} y1={CY} x2={x} y2={y} stroke={on ? "rgba(95,212,255,.55)" : "rgba(255,255,255,.08)"} style={{ transition: "stroke .5s" }} />
                  <circle r="2.5" fill="#5fd4ff" opacity={on ? 1 : 0.2}>
                    <animateMotion dur={`${2.6 + NODES.indexOf(n) * 0.3}s`} repeatCount="indefinite" path={`M${x} ${y} L${CX} ${CY}`} />
                  </circle>
                </g>
              );
            })}
            {/* hub */}
            <circle cx={CX} cy={CY} r="120" fill="url(#hubGlow)" />
            <circle cx={CX} cy={CY} r="54" fill="#0b0d10" stroke="rgba(255,255,255,.35)" />
            <circle cx={CX} cy={CY} r="62" fill="none" stroke="rgba(95,212,255,.35)" strokeDasharray="1 5" />
            <text x={CX} y={CY - 2} textAnchor="middle" fill="#fff" style={{ fontSize: 11, letterSpacing: "0.3em", fontWeight: 600 }}>
              S TEC
            </text>
            <text x={CX} y={CY + 14} textAnchor="middle" fill="#fff" style={{ fontSize: 11, letterSpacing: "0.3em", fontWeight: 600 }}>
              SECURE
            </text>
            {/* nodes */}
            {NODES.map((n) => {
              const [x, y] = pos(n.angle);
              const on = hover === n.id;
              const left = x < CX - 20;
              return (
                <g
                  key={n.id}
                  tabIndex={0}
                  role="button"
                  aria-label={n.label}
                  onMouseEnter={() => setHover(n.id)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(n.id)}
                  onBlur={() => setHover(null)}
                  onClick={() => setHover(hover === n.id ? null : n.id)}
                  style={{ cursor: "pointer", outline: "none" }}
                >
                  <circle cx={x} cy={y} r="34" fill="transparent" />
                  <circle cx={x} cy={y} r={on ? 14 : 9} fill="#050505" stroke={on ? "#5fd4ff" : "rgba(255,255,255,.55)"} style={{ transition: "all .5s" }} />
                  <circle cx={x} cy={y} r="3" fill={on ? "#5fd4ff" : "#e9ebee"} />
                  <text
                    x={left ? x - 24 : x + 24}
                    y={y + 4}
                    textAnchor={left ? "end" : "start"}
                    fill={on ? "#fff" : "rgba(233,235,238,.7)"}
                    style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", transition: "fill .4s" }}
                  >
                    {n.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </Reveal>
      </div>
    </section>
  );
}
