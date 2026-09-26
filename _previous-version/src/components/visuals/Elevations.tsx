/**
 * Night architectural elevations used in the Projects showcase until real
 * installation photography is supplied (site.config → projects[].image).
 */
const W = "#ffc58f";

function Base({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <svg viewBox="0 0 1200 760" className="h-full w-full" preserveAspectRatio="xMidYMid slice" role="img" aria-label={label}>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b0f14" />
          <stop offset="1" stopColor="#050505" />
        </linearGradient>
        <linearGradient id="win" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={W} stopOpacity=".55" />
          <stop offset="1" stopColor={W} stopOpacity=".12" />
        </linearGradient>
        <linearGradient id="refl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={W} stopOpacity=".12" />
          <stop offset="1" stopColor={W} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5fd4ff" stopOpacity=".2" />
          <stop offset="1" stopColor="#5fd4ff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="1200" height="760" fill="url(#sky)" />
      {children}
    </svg>
  );
}

export function ElevVilla() {
  return (
    <Base label="Modern villa at night">
      <line x1="0" y1="560" x2="1200" y2="560" stroke="rgba(255,255,255,.18)" />
      {/* upper timber volume */}
      <rect x="220" y="250" width="440" height="150" fill="#0d0c0b" stroke="rgba(255,255,255,.18)" />
      {Array.from({ length: 40 }, (_, i) => (
        <line key={i} x1={226 + i * 11} y1={252} x2={226 + i * 11} y2={398} stroke="#8a6a4d" strokeOpacity=".35" />
      ))}
      <rect x="260" y="300" width="360" height="50" fill="url(#win)" opacity=".7" />
      {/* roof slab */}
      <rect x="160" y="400" width="880" height="18" fill="#1a1a1a" stroke="rgba(255,255,255,.3)" />
      {/* glass living */}
      <rect x="420" y="418" width="560" height="142" fill="url(#win)" />
      {[520, 620, 720, 820, 920].map((x) => (
        <line key={x} x1={x} y1={418} x2={x} y2={560} stroke="#050505" strokeWidth="3" />
      ))}
      {/* basalt entrance */}
      <rect x="200" y="418" width="220" height="142" fill="#141414" stroke="rgba(255,255,255,.14)" />
      <rect x="276" y="430" width="56" height="130" fill="#3a2a1e" />
      <circle cx="350" cy="495" r="3" fill="#5fd4ff" />
      {/* camera + beam */}
      <rect x="960" y="420" width="18" height="8" rx="4" fill="#ddd" />
      <path d="M970 428 L760 560 L1010 560Z" fill="url(#beam)" />
      {/* reflection */}
      <rect x="420" y="562" width="560" height="120" fill="url(#refl)" />
    </Base>
  );
}

export function ElevOffice() {
  return (
    <Base label="Office building at night">
      <line x1="0" y1="600" x2="1200" y2="600" stroke="rgba(255,255,255,.18)" />
      <rect x="330" y="110" width="540" height="490" fill="#0c0d0f" stroke="rgba(255,255,255,.2)" />
      {Array.from({ length: 9 }, (_, r) =>
        Array.from({ length: 10 }, (_, c) => {
          const lit = (r * 7 + c * 3) % 5 < 2;
          return <rect key={`${r}-${c}`} x={345 + c * 52} y={128 + r * 50} width="44" height="36" fill={lit ? "url(#win)" : "#0f1216"} />;
        }),
      )}
      <rect x="540" y="540" width="120" height="60" fill="url(#win)" />
      <line x1="600" y1="540" x2="600" y2="600" stroke="#050505" strokeWidth="2" />
      <rect x="680" y="560" width="10" height="18" fill="#111" stroke="#5fd4ff" strokeOpacity=".7" />
      <path d="M340 118 L200 600 L420 600Z" fill="url(#beam)" opacity=".6" />
      <rect x="330" y="602" width="540" height="100" fill="url(#refl)" />
    </Base>
  );
}

export function ElevCommercial() {
  return (
    <Base label="Commercial building at night">
      <line x1="0" y1="590" x2="1200" y2="590" stroke="rgba(255,255,255,.18)" />
      <rect x="150" y="300" width="900" height="290" fill="#0c0d0f" stroke="rgba(255,255,255,.2)" />
      <rect x="150" y="300" width="900" height="36" fill="#141518" />
      {Array.from({ length: 6 }, (_, i) => (
        <g key={i}>
          <rect x={180 + i * 145} y={380} width="120" height="210" fill={i === 2 ? "url(#win)" : "#101317"} />
          <rect x={180 + i * 145} y={380} width="120" height="210" fill="none" stroke="rgba(255,255,255,.12)" />
        </g>
      ))}
      {[200, 600, 1000].map((x) => (
        <g key={x}>
          <rect x={x - 9} y={338} width="18" height="8" rx="4" fill="#ddd" />
          <path d={`M${x} 346 L${x - 120} 590 L${x + 120} 590Z`} fill="url(#beam)" opacity=".7" />
        </g>
      ))}
      <rect x="150" y="592" width="900" height="100" fill="url(#refl)" />
    </Base>
  );
}

export function ElevProject() {
  return (
    <Base label="Architectural plan of a new project">
      {Array.from({ length: 30 }, (_, i) => (
        <line key={"v" + i} x1={i * 40} y1="0" x2={i * 40} y2="760" stroke="rgba(255,255,255,.03)" />
      ))}
      {Array.from({ length: 20 }, (_, i) => (
        <line key={"h" + i} x1="0" y1={i * 40} x2="1200" y2={i * 40} stroke="rgba(255,255,255,.03)" />
      ))}
      <path d="M300 180H900V580H300Z M300 380H560V580 M560 180V300H900 M720 300V580" fill="none" stroke="rgba(233,235,238,.45)" />
      {[
        [300, 180],
        [900, 180],
        [300, 580],
        [900, 580],
        [560, 300],
        [720, 440],
      ].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="4" fill="#5fd4ff" />
          <circle cx={x} cy={y} r="14" fill="none" stroke="#5fd4ff" strokeOpacity=".35" />
        </g>
      ))}
    </Base>
  );
}
