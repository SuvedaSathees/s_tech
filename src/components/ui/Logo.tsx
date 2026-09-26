/** S TEC SECURE wordmark with a lens/aperture mark. */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`logo ${className}`}>
      <svg className="logo__mark" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="16" cy="16" r="14.5" stroke="currentColor" strokeOpacity="0.55" />
        <circle cx="16" cy="16" r="9" stroke="#c9ab78" />
        <circle cx="16" cy="16" r="3.2" fill="#c9ab78" />
        <path d="M16 1.5v5M30.5 16h-5" stroke="currentColor" strokeOpacity="0.55" />
      </svg>
      <span className="logo__word">
        S TEC <b>SECURE</b>
      </span>
    </span>
  );
}
