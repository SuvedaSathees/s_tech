"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * A live map of the five systems. Real integrations are drawn as links; the map
 * plays short everyday scenarios — signals travel from system to system and each
 * step is written to an event log with the current time. Hover (or tap) a system
 * to pause and see what it does for the others.
 */
type Id = "cctv" | "access" | "automation" | "alarm" | "doorphone";
type Target = Id | "hub";
type Step = { node?: Id; from?: Target; to?: Target; log: string; kind?: "ok" | "warn" };

const NODES: { id: Id; label: string; angle: number; text: string; icon: string }[] = [
  { id: "cctv", label: "CCTV", angle: -90, text: "Cameras verify every alarm, record every entry and put a face to every visitor.", icon: "M3 8.5h12l3-2.2v7.4l-3-2.2H3z M6.5 11.5v6.5 M4.5 18h4" },
  { id: "access", label: "Access Control", angle: -18, text: "A verified entry can disarm the alarm and trigger an arrival scene — lights, climate, curtains.", icon: "M8 15.5c0-3 1.8-5 4-5s4 2 4 5 M10 19c.4-1.2.5-2.6.5-4a1.5 1.5 0 0 1 3 0c0 2-.3 3.6-1 5 M5.5 13.5a6.5 6.5 0 0 1 13 0v1" },
  { id: "automation", label: "Automation", angle: 54, text: "Lighting and devices respond to security events — lights on when motion is detected at night.", icon: "M9 18h6 M10 21h4 M12 3a6 6 0 0 0-3.6 10.8c.5.4.8 1 .8 1.7V16h5.6v-.5c0-.7.3-1.3.8-1.7A6 6 0 0 0 12 3z" },
  { id: "alarm", label: "Burglar Alarm", angle: 126, text: "An intrusion alert fans out: siren, recording, lights and an instant notification on your phone.", icon: "M6 17h12v-5a6 6 0 0 0-12 0z M4 20h16 M12 2.5v2 M19.5 5.5l-1.4 1.4 M4.5 5.5l1.4 1.4" },
  { id: "doorphone", label: "Video Door Phone", angle: 198, text: "See and speak to visitors from anywhere, then open the gate or door remotely.", icon: "M4 4h16v12H4z M9 20h6 M12 16v4 M12 7.2a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6z M8.8 14c.6-1.5 1.8-2.2 3.2-2.2s2.6.7 3.2 2.2" },
];
const PAIRS: [Id, Id][] = [
  ["cctv", "alarm"],
  ["cctv", "doorphone"],
  ["cctv", "access"],
  ["access", "automation"],
  ["access", "alarm"],
  ["automation", "alarm"],
  ["automation", "cctv"],
  ["doorphone", "access"],
];
const SCENARIOS: { title: string; desc: string; steps: Step[] }[] = [
  {
    title: "Visitor at the gate",
    desc: "The door phone rings, the gate camera records, you answer on your phone and let them in.",
    steps: [
      { node: "doorphone", log: "Video Door Phone · Visitor at the gate" },
      { from: "doorphone", to: "cctv", log: "CCTV · Gate camera recording" },
      { from: "doorphone", to: "hub", log: "App · Call answered on your phone" },
      { from: "hub", to: "access", log: "Access Control · Gate opened remotely", kind: "ok" },
    ],
  },
  {
    title: "Arriving home",
    desc: "A fingerprint opens the door, the alarm stands down and the house switches to its evening scene.",
    steps: [
      { node: "access", log: "Access Control · Fingerprint verified", kind: "ok" },
      { from: "access", to: "alarm", log: "Burglar Alarm · Disarmed" },
      { from: "access", to: "automation", log: "Automation · Arrival scene: lights on, curtains closing" },
    ],
  },
  {
    title: "Motion after midnight",
    desc: "A sensor trips, cameras record, the outdoor lights come on and the alert reaches your phone with live view.",
    steps: [
      { node: "alarm", log: "Burglar Alarm · Motion in zone 2", kind: "warn" },
      { from: "alarm", to: "cctv", log: "CCTV · Camera 03 recording" },
      { from: "alarm", to: "automation", log: "Automation · Outdoor lights on" },
      { from: "alarm", to: "hub", log: "App · Alert sent with live view", kind: "warn" },
    ],
  },
  {
    title: "Leaving for work",
    desc: "One tap starts the away scene: lights off, alarm armed and camera alerts switched on.",
    steps: [
      { node: "automation", log: "Automation · Away scene started" },
      { from: "automation", to: "alarm", log: "Burglar Alarm · Armed in away mode", kind: "ok" },
      { from: "automation", to: "cctv", log: "CCTV · Motion alerts on" },
    ],
  },
];

const CX = 400, CY = 300, RX = 280, RY = 205;
const f1 = (n: number) => Math.round(n * 10) / 10;
const POS = Object.fromEntries(
  NODES.map((n) => [n.id, [f1(CX + Math.cos((n.angle * Math.PI) / 180) * RX), f1(CY + Math.sin((n.angle * Math.PI) / 180) * RY)]]),
) as Record<Id, [number, number]>;
const key = (a: Id, b: Id) => [a, b].sort().join("|");
const peerPath = (a: Id, b: Id) => {
  const [x1, y1] = POS[a], [x2, y2] = POS[b];
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const cx = f1(CX + (mx - CX) * 0.3), cy = f1(CY + (my - CY) * 0.3);
  return `M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`;
};
const now = () => new Date();
const stamp = (d: Date) => [d.getHours(), d.getMinutes(), d.getSeconds()].map((n) => String(n).padStart(2, "0")).join(":");

type LogLine = { id: number; t: string; sys: string; msg: string; kind?: string };

export default function EcosystemMap({ num }: { num?: string }) {
  const [hover, setHover] = useState<Id | null>(null);
  const [scn, setScn] = useState(0);
  const [hot, setHot] = useState<string[]>([]);
  const [flash, setFlash] = useState<Target | null>(null);
  const [log, setLog] = useState<LogLine[]>([]);
  const [compact, setCompact] = useState(false); // phones: crop the empty margins so the map reads larger
  const svgRef = useRef<SVGSVGElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const hoverRef = useRef<Id | null>(null);
  hoverRef.current = hover;

  const peers = useMemo(() => PAIRS.map(([a, b]) => ({ k: key(a, b), a, b, d: peerPath(a, b) })), []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const f = () => setCompact(mq.matches);
    f();
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, []);

  useEffect(() => {
    const svg = svgRef.current!, panel = panelRef.current!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pool = Array.from(svg.querySelectorAll<SVGGElement>(".pkt"));
    const pathFor = (from: Target, to: Target): { el: SVGPathElement; rev: boolean } | null => {
      if (from === "hub" || to === "hub") {
        const n = (from === "hub" ? to : from) as Id;
        const el = svg.querySelector<SVGPathElement>(`[data-spoke="${n}"]`);
        return el ? { el, rev: from === "hub" } : null; // spokes are drawn node → hub
      }
      const el = svg.querySelector<SVGPathElement>(`[data-peer="${key(from, to)}"]`);
      if (!el) return null;
      return { el, rev: el.getAttribute("data-a") !== from }; // each link is drawn from its data-a end
    };
    type Pkt = { g: SVGGElement; el: SVGPathElement; rev: boolean; len: number; t0: number; dur: number; done: () => void };
    let pkts: Pkt[] = [];
    let visible = false, raf = 0, timer = 0, lineId = 0, scenario = 0, alive = true;
    let clock = now();

    const pushLog = (s: Step) => {
      clock = new Date(clock.getTime() + 1000 + Math.round(Math.random() * 900));
      const [sys, ...rest] = s.log.split(" · ");
      setLog((l) => [...l.slice(-6), { id: ++lineId, t: stamp(clock), sys, msg: rest.join(" · "), kind: s.kind }]);
    };
    const fire = (from: Target, to: Target, done: () => void) => {
      const p = pathFor(from, to);
      const g = pool.find((x) => !pkts.some((k) => k.g === x));
      if (!p || !g) return done();
      g.style.opacity = "1";
      pkts.push({ g, el: p.el, rev: p.rev, len: p.el.getTotalLength(), t0: performance.now(), dur: 820, done });
    };
    const loop = (t: number) => {
      pkts = pkts.filter((k) => {
        const u = Math.min(1, (t - k.t0) / k.dur);
        const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
        const pt = k.el.getPointAtLength(k.len * (k.rev ? 1 - e : e));
        k.g.setAttribute("transform", `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
        if (u >= 1) {
          k.g.style.opacity = "0";
          k.done();
          return false;
        }
        return true;
      });
      raf = requestAnimationFrame(loop);
    };
    const run = () => {
      if (!alive || !visible || hoverRef.current || reduce) return;
      const sc = SCENARIOS[scenario];
      setScn(scenario);
      clock = now();
      let i = 0;
      const next = () => {
        if (!alive || !visible || hoverRef.current) return;
        if (i >= sc.steps.length) {
          timer = window.setTimeout(() => {
            setHot([]);
            setFlash(null);
            scenario = (scenario + 1) % SCENARIOS.length;
            run();
          }, 2200);
          return;
        }
        const s = sc.steps[i++];
        if (s.node) {
          setFlash(s.node);
          setHot([]);
          pushLog(s);
          timer = window.setTimeout(next, 1000);
          return;
        }
        const from = s.from!, to = s.to!;
        if (from !== "hub" && to !== "hub") setHot((h) => [...h, key(from, to)]);
        fire(from, to, () => {
          setFlash(to);
          pushLog(s);
        });
        timer = window.setTimeout(next, 1250);
      };
      next();
    };
    const stop = () => {
      window.clearTimeout(timer);
      pkts.forEach((k) => (k.g.style.opacity = "0"));
      pkts = [];
    };

    const io = new IntersectionObserver(
      ([e]) => {
        const was = visible;
        visible = e.isIntersecting;
        if (visible && !was) run();
        if (!visible) stop();
      },
      { threshold: 0.25 },
    );
    io.observe(panel);
    raf = requestAnimationFrame(loop);

    // resume after a hover ends
    const onResume = () => {
      stop();
      setHot([]);
      setFlash(null);
      timer = window.setTimeout(run, 900);
    };
    const onPause = () => stop();
    panel.addEventListener("eco:resume", onResume);
    panel.addEventListener("eco:pause", onPause);

    return () => {
      alive = false;
      stop();
      cancelAnimationFrame(raf);
      io.disconnect();
      panel.removeEventListener("eco:resume", onResume);
      panel.removeEventListener("eco:pause", onPause);
    };
  }, []);

  const pick = (id: Id | null) => {
    const panel = panelRef.current;
    const was = hoverRef.current;
    setHover(id);
    hoverRef.current = id;
    if (id && !was) panel?.dispatchEvent(new Event("eco:pause"));
    if (!id && was) panel?.dispatchEvent(new Event("eco:resume"));
  };
  const canHover = () => typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const cur = hover ? NODES.find((n) => n.id === hover)! : null;
  const sc = SCENARIOS[scn];
  const isHot = (k: string, a: Id, b: Id) => (hover ? hover === a || hover === b : hot.includes(k));

  return (
    <section className="eco" id="ecosystem" aria-labelledby="eco-h">
      <div className="wrap eco-grid">
        <div className="eco-copy">
          <p className="eyebrow">
            {num && <span className="pn">{num}</span>}
            Security ecosystem
          </p>
          <h2 className="display" id="eco-h" data-lines="">
            <span className="l">
              <span style={{ ["--i" as string]: 0 }}>Not five products.</span>
            </span>
            <span className="l w45">
              <span style={{ ["--i" as string]: 1 }}>One infrastructure.</span>
            </span>
          </h2>
          <p className="lede">When surveillance, access, alarms, intercom and automation are planned together, each system makes the others smarter.</p>
          <div className="eco-info" aria-live="polite">
            <div className="k">
              {cur ? (
                cur.label
              ) : (
                <>
                  Scenario 0{scn + 1} · {sc.title}
                </>
              )}
            </div>
            <p>{cur ? cur.text : sc.desc}</p>
          </div>
          <div className="eco-log" aria-label="Example event log">
            <div className="eco-log-h">
              <span>Event log · example</span>
              <span>
                <i className="dot rec" aria-hidden="true" />
                Live demo
              </span>
            </div>
            <ol aria-live="off">
              {log.map((l) => (
                <li key={l.id} className={l.kind}>
                  <time>{l.t}</time>
                  <span>
                    <b>{l.sys}</b> · {l.msg}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="eco-side">
          <div className="eco-chips" role="group" aria-label="Systems">
            {NODES.map((n) => (
              <button key={n.id} className="eco-chip" type="button" aria-pressed={hover === n.id} onClick={() => pick(hover === n.id ? null : n.id)}>
                {n.label}
              </button>
            ))}
          </div>
          <div ref={panelRef} className="eco-panel">
            <p className="eco-scn" aria-hidden="true">
              <span className="dot" />
              {hover ? "Paused" : `Live · ${sc.title}`}
            </p>
            <svg
              ref={svgRef}
              viewBox={compact ? "64 36 672 488" : "0 0 800 600"}
              className="eco-map"
              role="group"
              aria-label="How the five S Tec Secure systems connect"
            >
              <ellipse cx={CX} cy={CY} rx={RX} ry={RY} className="pl" strokeDasharray="2 8" />
              <ellipse cx={CX} cy={CY} rx={RX * 0.55} ry={RY * 0.55} className="pl" opacity=".45" />
              {peers.map((p) => (
                <path key={p.k} data-peer={p.k} data-a={p.a} d={p.d} className={`link${isHot(p.k, p.a, p.b) ? " hot" : ""}`} strokeOpacity={hover && !isHot(p.k, p.a, p.b) ? 0.35 : 1} />
              ))}
              {NODES.map((n) => (
                <path
                  key={n.id}
                  data-spoke={n.id}
                  d={`M${POS[n.id][0]} ${POS[n.id][1]} L${CX} ${CY}`}
                  className={`spoke${hover && hover !== n.id ? " dim" : ""}`}
                  fill="none"
                />
              ))}

              <circle cx={CX} cy={CY} r="120" fill="url(#g-hub)" />
              <circle cx={CX} cy={CY} r="74" fill="none" stroke="rgba(95,212,255,.35)" strokeDasharray="1 6" className="hub-ring" />
              <circle cx={CX} cy={CY} r="62" fill="#07090c" stroke={flash === "hub" ? "#5fd4ff" : "rgba(255,255,255,.32)"} style={{ transition: "stroke .4s" }} />
              <text x={CX} y={compact ? CY - 5 : CY - 3} textAnchor="middle" className="hub-t">
                S TEC
              </text>
              <text x={CX} y={compact ? CY + 19 : CY + 15} textAnchor="middle" className="hub-t">
                SECURE
              </text>

              {NODES.map((n) => {
                const [x, y] = POS[n.id];
                const on = hover === n.id || flash === n.id;
                const top = n.angle === -90;
                return (
                  <g
                    key={n.id}
                    className="node"
                    tabIndex={0}
                    role="button"
                    aria-label={n.label}
                    aria-pressed={hover === n.id}
                    onMouseEnter={() => canHover() && pick(n.id)}
                    onMouseLeave={() => canHover() && pick(null)}
                    onFocus={(e) => {
                      if ((e.currentTarget as unknown as HTMLElement).matches?.(":focus-visible")) pick(n.id);
                    }}
                    onBlur={() => hover === n.id && pick(null)}
                    onClick={() => pick(canHover() ? n.id : hover === n.id ? null : n.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        pick(hover === n.id ? null : n.id);
                      }
                    }}
                  >
                    <circle cx={x} cy={y} r="46" fill="transparent" />
                    {on && <circle cx={x} cy={y} r="42" fill="none" stroke="rgba(95,212,255,.35)" className="node-glow" />}
                    <circle className="node-bg" cx={x} cy={y} r="32" fill={on ? "#0b1419" : "#07090c"} stroke={on ? "#5fd4ff" : "rgba(255,255,255,.4)"} />
                    <path
                      className="node-ic"
                      d={n.icon}
                      transform={`translate(${x - 12} ${y - 12})`}
                      fill="none"
                      stroke={on ? "#fff" : "rgba(233,235,238,.75)"}
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <text className="eco-lbl" x={x} y={top ? y - 50 : y + 58} textAnchor="middle" style={on ? { fill: "#fff" } : undefined}>
                      {n.label}
                    </text>
                  </g>
                );
              })}

              {[0, 1, 2, 3].map((i) => (
                <g key={i} className="pkt" style={{ opacity: 0 }} aria-hidden="true">
                  <circle r="11" fill="rgba(95,212,255,.18)" />
                  <circle r="4" fill="#5fd4ff" />
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
