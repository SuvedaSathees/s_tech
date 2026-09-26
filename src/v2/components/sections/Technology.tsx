import { technology } from "@/v2/config/site";
import Reveal from "../ui/Reveal";

const nodes = [
  { label: "CCTV", sub: "Cameras · NVR", x: 150, y: 120 },
  { label: "ACCESS", sub: "Face · Card · Mobile", x: 650, y: 120 },
  { label: "INTERCOM", sub: "Video door phones", x: 710, y: 330 },
  { label: "ALARM", sub: "Sensors · Sirens", x: 610, y: 530 },
  { label: "AUTOMATION", sub: "Light · Climate · Shades", x: 190, y: 530 },
  { label: "MOBILE", sub: "App · Alerts", x: 90, y: 330 },
];

function Diagram() {
  const cx = 400, cy = 330;
  return (
    <svg viewBox="0 0 800 660" role="img" aria-label="One S TEC hub connecting cameras, access control, intercom, alarms, automation and the mobile app">
      <defs>
        <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c9ab78" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#c9ab78" stopOpacity="0" />
        </radialGradient>
      </defs>
      {[90, 170, 250].map((r) => (
        <circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke="rgba(236,231,222,0.07)" />
      ))}
      <circle cx={cx} cy={cy} r="140" fill="url(#hubGlow)" />
      {nodes.map((n) => {
        const mx = (cx + n.x) / 2, my = (cy + n.y) / 2 - 40;
        const d = `M${cx},${cy} Q${mx},${my} ${n.x},${n.y}`;
        return (
          <g key={n.label}>
            <path d={d} fill="none" stroke="rgba(236,231,222,0.12)" />
            <path d={d} fill="none" stroke="#c9ab78" strokeWidth="1.2" className="flow" />
          </g>
        );
      })}
      {nodes.map((n, i) => (
        <g key={n.label + "n"}>
          <circle cx={n.x} cy={n.y} r="7" fill="#0f1013" stroke="#c9ab78" />
          <circle cx={n.x} cy={n.y} r="7" fill="none" stroke="#c9ab78" className="pulse" style={{ animationDelay: `${i * 0.45}s` }} />
          <text x={n.x} y={n.y + 30} textAnchor="middle" fill="#ece7de" fontFamily="var(--font-jetbrains), monospace" fontSize="12" letterSpacing="3">
            {n.label}
          </text>
          <text x={n.x} y={n.y + 48} textAnchor="middle" fill="#6f6c66" fontFamily="var(--font-manrope), sans-serif" fontSize="12">
            {n.sub}
          </text>
        </g>
      ))}
      <circle cx={cx} cy={cy} r="46" fill="#0b0c0e" stroke="#c9ab78" />
      <circle cx={cx} cy={cy} r="46" fill="none" stroke="#c9ab78" className="pulse" />
      <circle cx={cx} cy={cy} r="14" fill="#c9ab78" />
      <text x={cx} y={cy + 76} textAnchor="middle" fill="#e3c895" fontFamily="var(--font-jetbrains), monospace" fontSize="12" letterSpacing="4">
        S TEC HUB
      </text>
    </svg>
  );
}

export default function Technology() {
  return (
    <Reveal as="section" id="technology" className="section technology">
      <div className="container">
        <header className="section-head">
          <div>
            <span className="eyebrow" data-reveal>
              Technology
            </span>
            <h2 className="h2" data-reveal data-delay="0.1">
              Engineered to <em>see</em>,
              <br />
              decide and act.
            </h2>
          </div>
          <p className="lede" data-reveal data-delay="0.2">
            Behind the quiet hardware is a layered platform: perception at the edge, intelligence that filters noise
            from threats, and integration that turns one event into the right response everywhere.
          </p>
        </header>

        <div className="pillars">
          {technology.pillars.map((p, i) => (
            <article className="pillar" key={p.label} data-reveal data-delay={String(i * 0.08)}>
              <span className="eyebrow">
                0{i + 1} — {p.label}
              </span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </article>
          ))}
        </div>

        <div className="tech-system">
          <div className="diagram" data-reveal>
            <Diagram />
          </div>
          <div data-reveal data-delay="0.15">
            <span className="eyebrow">Capabilities</span>
            <h3 className="h2" style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)", margin: "22px 0 34px" }}>
              One platform, <em>every</em> signal.
            </h3>
            <dl className="specs">
              {technology.capabilities.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
