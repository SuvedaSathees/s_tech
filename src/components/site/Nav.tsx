"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { NAV, company } from "@/content/company";
import { ArrowUpRight, Mark } from "./Icons";
import { Btn, QuickActions } from "./ui";

const isCurrent = (path: string, href: string) => (href === "/" ? path === "/" : path === href || path.startsWith(href + "/"));

/** Line icons and a short hint for each page in the phone menu. */
const PAGE: Record<string, { ic: string; hint: string }> = {
  "/": { ic: "M3.5 10.5 12 3.5l8.5 7 M5.5 9v11h13V9 M10 20v-5.5h4V20", hint: "Start here" },
  "/about": { ic: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4.5 20.5a7.5 7.5 0 0 1 15 0", hint: "Who we are" },
  "/services": { ic: "M12 3.5 3.5 8l8.5 4.5L20.5 8z M3.5 12.2 12 16.7l8.5-4.5 M3.5 16.4 12 20.9l8.5-4.5", hint: "Five systems" },
  "/products": { ic: "M3 8.5h12l3-2.2v7.4l-3-2.2H3z M6.5 11.5v6.5 M4.5 18h4", hint: "Hardware & tech" },
  "/blog": { ic: "M2.5 5.5h6a3.5 3.5 0 0 1 3.5 3.5v11a2.5 2.5 0 0 0-2.5-2.5h-7z M21.5 5.5h-6A3.5 3.5 0 0 0 12 9v11a2.5 2.5 0 0 1 2.5-2.5h7z", hint: "Guides & tips" },
  "/contact": { ic: "M7.9 20A9 9 0 1 0 4 16.1L2 22Z", hint: "Book a visit" },
};

/**
 * Header. Large screens: a bar that rolls in, labels roll on hover, a lit hairline
 * slides to the link under the pointer, the bar tucks away while scrolling down and a
 * thin line tracks reading progress. Phones and tablets: a floating glass pill with a
 * round menu button that opens a panel of page tiles, quick contact actions and a
 * consultation button.
 */
export default function Nav() {
  const path = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const links = useRef<HTMLDivElement>(null);
  const ind = useRef<HTMLSpanElement>(null);
  const prog = useRef<HTMLSpanElement>(null);

  // slide the indicator under an element (or hide it)
  const moveTo = useCallback((el: HTMLElement | null) => {
    const bar = ind.current;
    if (!bar) return;
    if (!el) {
      bar.classList.remove("on");
      return;
    }
    // layout offsets inside .nav-links: unaffected by the entrance animations' transforms
    const pad = parseFloat(getComputedStyle(el).paddingLeft) || 14;
    bar.style.width = `${Math.max(0, el.offsetWidth - pad * 2)}px`;
    bar.style.transform = `translateX(${el.offsetLeft + pad}px)`;
    bar.classList.add("on");
  }, []);
  const rest = useCallback(() => {
    const cur = links.current?.querySelector<HTMLElement>('.nav-link[aria-current="page"]') ?? null;
    moveTo(cur);
  }, [moveTo]);

  useEffect(() => {
    rest();
    const t = setTimeout(rest, 900); // after the entrance animation and web fonts settle
    window.addEventListener("resize", rest);
    document.fonts?.ready.then(rest).catch(() => {});
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", rest);
    };
  }, [path, rest]);

  // scrolled / tucked / progress
  useEffect(() => {
    let lastY = window.scrollY, raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const h = header.current;
      if (!h) return;
      h.classList.toggle("scrolled", y > 40);
      const down = y > lastY + 4, up = y < lastY - 4;
      if (down && y > 240 && !open) h.classList.add("tucked");
      else if (up || y < 120) h.classList.remove("tucked");
      if (down || up) lastY = y;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (prog.current) prog.current.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max).toFixed(4) : 0})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [open, path]);

  // close the menu on navigation; lock scrolling while it is open
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (open) header.current?.classList.remove("tucked");
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const items = NAV.slice(0, -1);
  const contact = NAV[NAV.length - 1];

  return (
    <>
      <header ref={header} className={`nav${open ? " menu-open" : ""}`}>
        <div className="wrap nav-in">
          <Link className="wm" href="/" aria-label={`${company.name} — home`}>
            <Mark size={24} />
            <span className="wm-t">{company.name}</span>
            <span className="wm-2" aria-hidden="true">
              <b>S TEC</b>
              <small>SECURE</small>
            </span>
          </Link>

          <div ref={links} className="nav-links" onMouseLeave={rest}>
            <nav aria-label="Primary" style={{ display: "contents" }}>
              {items.map((n, i) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="nav-link"
                  aria-current={isCurrent(path, n.href) ? "page" : undefined}
                  onMouseEnter={(e) => moveTo(e.currentTarget)}
                  onFocus={(e) => moveTo(e.currentTarget)}
                  onBlur={rest}
                  style={{ ["--i" as string]: i }}
                >
                  <span className="roll">
                    <span data-t={n.label}>{n.label}</span>
                  </span>
                </Link>
              ))}
              <Link
                href={contact.href}
                className="nav-cta"
                aria-current={isCurrent(path, contact.href) ? "page" : undefined}
                onMouseEnter={() => moveTo(null)}
                style={{ ["--i" as string]: items.length }}
              >
                <span className="roll">
                  <span data-t={contact.label}>{contact.label}</span>
                </span>
                <ArrowUpRight className="" />
              </Link>
            </nav>
            <span ref={ind} className="nav-ind" aria-hidden="true" />
          </div>

          <button
            className="burger"
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="sheet"
            onClick={() => setOpen((o) => !o)}
          >
            <span />
            <span />
          </button>
        </div>
        <span ref={prog} className="nav-prog" aria-hidden="true" />
      </header>

      <div className={`sheet-dim${open ? " open" : ""}`} aria-hidden="true" onClick={() => setOpen(false)} />
      <div id="sheet" className={`sheet${open ? " open" : ""}`} aria-hidden={!open} aria-label="Menu">
        <nav className="m-grid" aria-label="Mobile">
          {NAV.map((n, i) => {
            const pg = PAGE[n.href];
            return (
              <Link
                key={n.href}
                href={n.href}
                className="m-tile"
                aria-current={isCurrent(path, n.href) ? "page" : undefined}
                onClick={() => setOpen(false)}
                style={{ ["--i" as string]: i }}
              >
                <span className="m-ic" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={pg.ic} />
                  </svg>
                </span>
                <ArrowUpRight className="m-arr" />
                <span className="m-txt">
                  <span className="m-l">{n.label}</span>
                  <span className="m-s">{pg.hint}</span>
                </span>
              </Link>
            );
          })}
        </nav>
        <QuickActions className="m-qa" />
        <Btn href="/contact#enquiry" solid className="m-cta">
          Book a consultation
        </Btn>
        <p className="m-foot">
          <span className="live" aria-hidden="true" />
          {company.tagline}
        </p>
      </div>
    </>
  );
}
