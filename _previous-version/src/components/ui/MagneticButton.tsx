"use client";

import { useRef, type ReactNode, type MouseEvent } from "react";
import { ArrowUpRight } from "lucide-react";

type Props = {
  href: string;
  children: ReactNode;
  variant?: "solid" | "ghost";
  icon?: ReactNode;
  external?: boolean;
  className?: string;
};

/** Pill-free, hairline luxury button with magnetic pull + light sweep. */
export default function MagneticButton({ href, children, variant = "ghost", icon, external, className = "" }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const inner = useRef<HTMLSpanElement>(null);

  const move = (e: MouseEvent) => {
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    el.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px)`;
    if (inner.current) inner.current.style.transform = `translate(${x * 0.08}px, ${y * 0.12}px)`;
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
  };
  const leave = () => {
    if (ref.current) ref.current.style.transform = "";
    if (inner.current) inner.current.style.transform = "";
  };

  const base =
    "group relative inline-flex items-center gap-4 overflow-hidden px-7 py-4 text-[12px] font-medium uppercase tracking-[0.2em] transition-[transform,background,color,border-color] duration-500 ease-[var(--ease-lux)]";
  const styles =
    variant === "solid"
      ? "bg-soft text-ink hover:bg-white"
      : "border border-line-2 text-soft hover:border-white/40 hover:text-white";

  return (
    <a
      ref={ref}
      href={href}
      onMouseMove={move}
      onMouseLeave={leave}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`${base} ${styles} ${className}`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            variant === "solid"
              ? "radial-gradient(120px circle at var(--mx,50%) 50%, rgba(95,212,255,.35), transparent 70%)"
              : "radial-gradient(140px circle at var(--mx,50%) 50%, rgba(255,255,255,.10), transparent 70%)",
        }}
      />
      <span ref={inner} className="relative flex items-center gap-4 transition-transform duration-500 ease-[var(--ease-lux)]">
        {children}
        {icon ?? <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" strokeWidth={1.4} />}
      </span>
    </a>
  );
}
