"use client";

import { useEffect, useState } from "react";
import { nav, site } from "@/config/site";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      {/* aperture mark */}
      <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden>
        <circle cx="11" cy="11" r="10" fill="none" stroke="currentColor" strokeOpacity=".5" strokeWidth="1" />
        <circle cx="11" cy="11" r="5.2" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="11" cy="11" r="1.6" fill="#5fd4ff" />
      </svg>
      <span className="text-[13px] font-semibold tracking-[0.34em]">{site.name}</span>
    </span>
  );
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-700 ease-[var(--ease-lux)] ${
          scrolled ? "glass border-b border-line py-3.5" : "border-b border-transparent py-6"
        }`}
      >
        <div className="mx-auto flex max-w-[1680px] items-center justify-between px-5 md:px-10">
          <a href="#top" className="text-soft" aria-label={`${site.name} — home`}>
            <Wordmark />
          </a>

          <nav className="hidden items-center gap-10 md:flex" aria-label="Primary">
            {nav.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="group relative text-[12px] font-medium uppercase tracking-[0.18em] text-mist transition-colors duration-300 hover:text-white"
              >
                {n.label}
                <span className="absolute -bottom-1.5 left-0 h-px w-full origin-right scale-x-0 bg-white/60 transition-transform duration-500 ease-[var(--ease-lux)] group-hover:origin-left group-hover:scale-x-100" />
              </a>
            ))}
          </nav>

          <button
            className="relative flex h-10 w-10 items-center justify-center md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <span
              className={`absolute h-px w-6 bg-soft transition-transform duration-500 ${open ? "rotate-45" : "-translate-y-[4px]"}`}
            />
            <span
              className={`absolute h-px w-6 bg-soft transition-transform duration-500 ${open ? "-rotate-45" : "translate-y-[4px]"}`}
            />
          </button>
        </div>
      </header>

      {/* mobile sheet */}
      <div
        className={`fixed inset-0 z-40 bg-ink/95 backdrop-blur-xl transition-[opacity,visibility] duration-700 md:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <nav className="flex h-full flex-col justify-center gap-2 px-6" aria-label="Mobile">
          {nav.map((n, i) => (
            <a
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="display border-b border-line py-4 text-5xl text-soft transition-all duration-700"
              style={{
                transitionDelay: open ? `${120 + i * 60}ms` : "0ms",
                transform: open ? "none" : "translateY(20px)",
                opacity: open ? 1 : 0,
              }}
            >
              <span className="mr-4 align-top font-mono text-[11px] tracking-[0.2em] text-dim">0{i + 1}</span>
              {n.label}
            </a>
          ))}
        </nav>
      </div>
    </>
  );
}
