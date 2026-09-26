export default function SocialIcon({ name }: { name: "instagram" | "facebook" | "linkedin" | "youtube" }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.4 } as const;
  switch (name) {
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="5" {...p} />
          <circle cx="12" cy="12" r="4" {...p} />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
        </svg>
      );
    case "facebook":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8.5a.5.5 0 0 1 .5-.5z" {...p} />
        </svg>
      );
    case "linkedin":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="3" {...p} />
          <path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" {...p} />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="2.5" y="5" width="19" height="14" rx="4" {...p} />
          <path d="M10 9.5v5l4.5-2.5z" fill="currentColor" />
        </svg>
      );
  }
}
