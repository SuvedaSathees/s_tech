/** Small line icons shared across the site (stroke = currentColor). */
type P = { className?: string };
const base = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

export const ArrowUpRight = ({ className = "arr" }: P) => (
  <svg {...base} className={className}>
    <path d="M7 7h10v10" />
    <path d="M7 17 17 7" />
  </svg>
);
export const ArrowRight = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);
export const ArrowLeft = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M19 12H5" />
    <path d="m11 18-6-6 6-6" />
  </svg>
);
export const ArrowUp = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M12 19V5" />
    <path d="m6 11 6-6 6 6" />
  </svg>
);
export const PhoneIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
export const MailIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);
export const ChatIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);
export const ShieldIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);
export const InstagramIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
  </svg>
);
export const FacebookIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8.5a.5.5 0 0 1 .5-.5z" />
  </svg>
);
export const WhatsAppIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M3.5 20.5 5 16a8.5 8.5 0 1 1 3.4 3.3z" />
    <path d="M9 9.2c.2-.6.7-.7 1-.7l.6.1.8 1.8-.6.8c.4.9 1.2 1.7 2.1 2.1l.8-.6 1.8.8.1.6c0 .4-.2.8-.7 1-.9.4-2.5.1-4.2-1.5S8.6 10.1 9 9.2z" />
  </svg>
);

/** Aperture mark used in the nav and footer. */
export const Mark = ({ className, size = 22 }: P & { size?: number }) => (
  <svg viewBox="0 0 22 22" width={size} height={size} className={className} aria-hidden="true">
    <circle cx="11" cy="11" r="10" fill="none" stroke="currentColor" strokeOpacity=".5" />
    <circle cx="11" cy="11" r="5.2" fill="none" stroke="currentColor" />
    <circle cx="11" cy="11" r="1.6" fill="#5fd4ff" />
  </svg>
);

/** Gradients used by the line-art drawings. Rendered once per page. */
export const SvgDefs = () => (
  <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="g-fov" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#5fd4ff" stopOpacity=".28" />
        <stop offset="1" stopColor="#5fd4ff" stopOpacity="0" />
      </linearGradient>
      <radialGradient id="g-warm" cx=".5" cy=".5" r=".5">
        <stop offset="0" stopColor="#ffc58f" stopOpacity=".55" />
        <stop offset="1" stopColor="#ffc58f" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="g-cyan" cx=".5" cy=".5" r=".5">
        <stop offset="0" stopColor="#5fd4ff" stopOpacity=".35" />
        <stop offset="1" stopColor="#5fd4ff" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="g-hub">
        <stop offset="0" stopColor="#5fd4ff" stopOpacity=".26" />
        <stop offset="1" stopColor="#5fd4ff" stopOpacity="0" />
      </radialGradient>
    </defs>
  </svg>
);
