/**
 * Architectural line-plates: each one visualises what a system actually does.
 * Pure SVG (crisp at any size, ~2 KB each) — no stock imagery.
 * Replace or layer with real installation photography when available.
 */

const A = "#5fd4ff";

function Frame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <svg viewBox="0 0 800 560" className="h-full w-full" role="img" aria-label={label} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="fov" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={A} stopOpacity=".28" />
          <stop offset="1" stopColor={A} stopOpacity="0" />
        </linearGradient>
        <radialGradient id="warm" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#ffc58f" stopOpacity=".55" />
          <stop offset="1" stopColor="#ffc58f" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="cyanGlow" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor={A} stopOpacity=".35" />
          <stop offset="1" stopColor={A} stopOpacity="0" />
        </radialGradient>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="rgba(255,255,255,.035)" />
        </pattern>
      </defs>
      <rect width="800" height="560" fill="url(#grid)" />
      {children}
    </svg>
  );
}

/* 01 — CCTV: facade in perspective, camera cone sweeping, subject tracked */
export function PlateCCTV() {
  return (
    <Frame label="Camera field of view sweeping a forecourt and tracking a person">
      {/* ground perspective */}
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1={400} y1={250} x2={-400 + i * 145} y2={560} className="plate-line" opacity={0.5} />
      ))}
      {[290, 330, 385, 460, 560].map((y) => (
        <line key={y} x1={0} y1={y} x2={800} y2={y} className="plate-line" opacity={0.4} />
      ))}
      {/* facade + soffit */}
      <path d="M60 250V90H740V250" className="plate-line-strong" />
      <path d="M40 90H760V76H40Z" className="plate-line-strong" />
      {[180, 300, 420, 540, 660].map((x) => (
        <line key={x} x1={x} y1={90} x2={x} y2={250} className="plate-line" />
      ))}
      {/* camera */}
      <g transform="translate(640 96)">
        <line x1="0" y1="0" x2="0" y2="16" className="plate-line-strong" />
        <rect x="-26" y="16" width="44" height="14" rx="7" className="plate-line-strong" />
        <circle cx="18" cy="23" r="4" stroke={A} fill="none" />
      </g>
      {/* sweeping cone */}
      <g>
        <path d="M658 119 L260 520 L620 540Z" fill="url(#fov)" />
        <path d="M658 119 L260 520 M658 119 L620 540" stroke={A} strokeOpacity=".5" fill="none" />
        <animateTransform attributeName="transform" type="rotate" values="0 658 119; 14 658 119; 0 658 119" dur="7s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1" />
      </g>
      {/* subject */}
      <g>
        <g>
          <circle cx="0" cy="0" r="6" fill="none" stroke="#e9ebee" />
          <path d="M-9 34 L-7 10 Q0 4 7 10 L9 34 M-5 34 L-6 66 M5 34 L6 66" className="plate-line-strong" />
          <path d="M-22 -14h8M-22 -14v8M22 -14h-8M22 -14v8M-22 72h8M-22 72v-8M22 72h-8M22 72v-8" stroke={A} fill="none" />
          <text x="-22" y="-22" className="plate-text" style={{ fill: A }}>
            Person · Tracking
          </text>
          <animateTransform attributeName="transform" type="translate" values="300 400; 470 420; 300 400" dur="14s" repeatCount="indefinite" calcMode="spline" keySplines=".4 0 .6 1;.4 0 .6 1" />
        </g>
      </g>
      <text x="60" y="40" className="plate-text">Cam 01 · Forecourt · Live</text>
      <circle cx="48" cy="37" r="3" fill="#ff4a3d" className="anim-blink" />
    </Frame>
  );
}

/* 02 — Automation: plan view, rooms waking up as a scene runs */
export function PlateAutomation() {
  const rooms = [
    { d: "M120 120H400V300H120Z", l: "Living", c: [260, 210] },
    { d: "M400 120H600V240H400Z", l: "Kitchen", c: [500, 180] },
    { d: "M600 120H700V300H600Z", l: "Study", c: [650, 210] },
    { d: "M120 300H330V440H120Z", l: "Bedroom", c: [225, 370] },
    { d: "M330 300H600V440H330Z", l: "Lounge", c: [465, 370] },
  ];
  return (
    <Frame label="Home floor plan with lighting, curtains and climate changing together">
      <path d="M100 100H720V460H100Z" className="plate-line-strong" />
      {rooms.map((r, i) => (
        <g key={r.l}>
          <path d={r.d} className="plate-line" />
          <circle cx={r.c[0]} cy={r.c[1]} r="90" fill="url(#warm)" opacity="0">
            <animate attributeName="opacity" values="0;0;1;1;0" keyTimes={`0;${0.1 + i * 0.08};${0.18 + i * 0.08};0.85;1`} dur="9s" repeatCount="indefinite" />
          </circle>
          <circle cx={r.c[0]} cy={r.c[1]} r="3.5" fill="#ffc58f" />
          <text x={r.c[0] - 30} y={r.c[1] + 26} className="plate-text">
            {r.l}
          </text>
        </g>
      ))}
      {/* curtains along the facade */}
      <g>
        {Array.from({ length: 16 }, (_, i) => (
          <line key={i} x1={130 + i * 18} y1={462} x2={130 + i * 18} y2={476} stroke="#e9ebee" strokeOpacity=".5" />
        ))}
        <animateTransform attributeName="transform" type="scale" values="0.25 1; 1 1; 1 1; 0.25 1" keyTimes="0;.3;.85;1" dur="9s" repeatCount="indefinite" additive="sum" />
      </g>
      <text x="130" y="500" className="plate-text">Curtains · auto</text>
      {/* climate dial */}
      <g transform="translate(660 400)">
        <circle r="34" className="plate-line" />
        <path d="M-24 24 A34 34 0 1 1 24 24" stroke={A} fill="none" strokeDasharray="160" strokeDashoffset="160">
          <animate attributeName="stroke-dashoffset" values="160;60;60;160" keyTimes="0;.35;.85;1" dur="9s" repeatCount="indefinite" />
        </path>
        <text x="-14" y="5" className="plate-text" style={{ fontSize: 12, fill: "#fff" }}>
          24°
        </text>
      </g>
      <text x="100" y="80" className="plate-text">Scene · Evening arrival</text>
    </Frame>
  );
}

/* 03 — Access: door elevation, biometric scan, verified */
export function PlateAccess() {
  return (
    <Frame label="Biometric reader scanning a fingerprint and unlocking a door">
      <path d="M0 470H800" className="plate-line-strong" />
      <path d="M250 470V70H410V470" className="plate-line-strong" />
      <path d="M262 470V82H398V470" className="plate-line" />
      <line x1="380" y1="200" x2="380" y2="340" stroke="#c8a77e" strokeOpacity=".7" />
      {/* reader */}
      <g transform="translate(470 250)">
        <rect x="-26" y="-50" width="52" height="100" rx="6" className="plate-line-strong" />
        <rect x="-18" y="-40" width="36" height="24" className="plate-line" />
        <circle cx="0" cy="20" r="14" stroke={A} fill="none" />
      </g>
      {/* big fingerprint */}
      <g transform="translate(620 250)">
        <circle r="110" fill="url(#cyanGlow)" opacity=".5" />
        {Array.from({ length: 9 }, (_, i) => (
          <path
            key={i}
            d={`M${-18 - i * 9} ${30 + i * 4} C ${-22 - i * 9} ${-40 - i * 8}, ${22 + i * 9} ${-40 - i * 8}, ${18 + i * 9} ${30 + i * 4}`}
            className="plate-line"
            strokeDasharray={i % 3 === 0 ? "40 6" : undefined}
          />
        ))}
        <rect x="-100" y="-2" width="200" height="1.5" fill={A}>
          <animate attributeName="y" values="-90;80;-90" dur="3s" repeatCount="indefinite" />
        </rect>
      </g>
      <g>
        <text x="560" y="420" className="plate-text" style={{ fill: A }}>
          Verifying
          <animate attributeName="opacity" values="1;1;0;0;1" keyTimes="0;.45;.5;.95;1" dur="6s" repeatCount="indefinite" />
        </text>
        <text x="560" y="420" className="plate-text" style={{ fill: "#7fe0b0" }} opacity="0">
          Access granted · 21:47
          <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.45;.5;.95;1" dur="6s" repeatCount="indefinite" />
        </text>
      </g>
      <text x="250" y="50" className="plate-text">Main entrance · Controlled</text>
    </Frame>
  );
}

/* 04 — Video door phone: gate intercom ↔ indoor monitor */
export function PlateDoorPhone() {
  return (
    <Frame label="Visitor at the gate seen on an indoor video monitor, with remote unlock">
      {/* gate */}
      <path d="M40 470H330M60 470V230H100V470M270 470V230H310V470" className="plate-line-strong" />
      {Array.from({ length: 9 }, (_, i) => (
        <line key={i} x1={108 + i * 19} y1={260} x2={108 + i * 19} y2={470} className="plate-line" />
      ))}
      <rect x="72" y="300" width="16" height="30" rx="2" stroke={A} fill="none" />
      {/* link */}
      <path d="M90 315 C 260 180, 420 180, 470 240" stroke={A} strokeOpacity=".6" fill="none" className="anim-dash" />
      {/* monitor */}
      <g transform="translate(470 150)">
        <rect width="270" height="320" rx="10" className="plate-line-strong" />
        <rect x="18" y="18" width="234" height="176" className="plate-line" />
        {/* visitor */}
        <circle cx="135" cy="92" r="24" className="plate-line-strong" />
        <path d="M80 194 C 88 140, 182 140, 190 194" className="plate-line-strong" />
        <path d="M100 58h-10v10M170 58h10v10M100 150h-10v-10M170 150h10v-10" stroke={A} fill="none" />
        <text x="26" y="36" className="plate-text">Gate · Visitor</text>
        <g transform="translate(18 222)">
          <rect width="110" height="40" className="plate-line" />
          <text x="34" y="24" className="plate-text">Talk</text>
          <rect x="124" width="110" height="40" stroke={A} fill="none" />
          <text x="150" y="24" className="plate-text" style={{ fill: A }}>
            Unlock
          </text>
          <rect x="124" width="110" height="40" fill={A} opacity="0">
            <animate attributeName="opacity" values="0;0;.18;0" keyTimes="0;.6;.7;1" dur="5s" repeatCount="indefinite" />
          </rect>
        </g>
      </g>
    </Frame>
  );
}

/* 05 — Alarm: perimeter plan, breach, response fan-out */
export function PlateAlarm() {
  const sensors = [
    [140, 140],
    [400, 110],
    [660, 140],
    [700, 300],
    [660, 450],
    [400, 470],
    [140, 450],
    [100, 300],
  ];
  return (
    <Frame label="Perimeter sensors detecting an intrusion and triggering siren and alerts">
      <path d="M120 120H680V460H120Z" className="plate-line-strong" />
      <path d="M220 200H580V380H220Z" className="plate-line" />
      <path d="M90 90H710V490H90Z" className="plate-line" strokeDasharray="3 7" />
      {sensors.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4" fill="#e9ebee" opacity=".6" />
      ))}
      {/* breach at east sensor */}
      <g transform="translate(700 300)">
        <circle r="4" fill="#ff4a3d" />
        {[0, 1, 2].map((k) => (
          <circle key={k} r="10" stroke="#ff4a3d" fill="none" opacity="0">
            <animate attributeName="r" values="6;60" dur="2.4s" begin={`${k * 0.8}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values=".8;0" dur="2.4s" begin={`${k * 0.8}s`} repeatCount="indefinite" />
          </circle>
        ))}
        <text x="-150" y="-16" className="plate-text" style={{ fill: "#ff8a80" }}>
          Zone 4 · Breach
        </text>
      </g>
      {/* response fan-out */}
      {[
        [400, 290, "Siren"],
        [300, 250, "Cameras · Record"],
        [300, 330, "Lights · On"],
      ].map(([x, y, l], i) => (
        <g key={i}>
          <path d={`M700 300 L${x} ${y}`} stroke={A} strokeOpacity=".5" className="anim-dash" />
          <circle cx={x as number} cy={y as number} r="3" fill={A} />
          <text x={(x as number) - 10} y={(y as number) - 10} className="plate-text" textAnchor="end">
            {l}
          </text>
        </g>
      ))}
      <text x="120" y="100" className="plate-text">Armed · Away</text>
    </Frame>
  );
}

export const PLATES = {
  cctv: PlateCCTV,
  automation: PlateAutomation,
  access: PlateAccess,
  doorphone: PlateDoorPhone,
  alarm: PlateAlarm,
} as const;
