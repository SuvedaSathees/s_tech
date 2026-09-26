"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { NAV, company, whatsappHref } from "@/content/company";
import { ArrowUpRight, Mark } from "./Icons";

const isCurrent = (path: string, href: string) => (href === "/" ? path === "/" : path === href || path.startsWith(href + "/"));

/**
 * Header: rolls in on load, labels roll on hover, a lit hairline slides to the
 * link under the pointer and rests on the current page, the bar tucks away while
 * scrolling down and returns on the way up, and a thin line tracks reading progress.
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

  // close the sheet on navigation; lock scrolling while it is open
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const items = NAV.slice(0, -1);
  const contact = NAV[NAV.length - 1];

  return (
    <>
      <header ref={header} className="nav">
        <div className="wrap nav-in">
          <Link className="wm" href="/" aria-label={`${company.name} — home`}>
            <Mark size={24} />
            <span className="wm-t">{company.name}</span>
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
            <span />
          </button>
        </div>
        <span ref={prog} className="nav-prog" aria-hidden="true" />
      </header>

      <div id="sheet" className={`sheet${open ? " open" : ""}`} aria-hidden={!open}>
        <nav className="sheet-nav" aria-label="Mobile">
          {NAV.map((n, i) => (
            <Link
              key={n.href}
              href={n.href}
              className="sheet-link"
              aria-current={isCurrent(path, n.href) ? "page" : undefined}
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
              style={{ ["--i" as string]: i }}
            >
              <small>0{i + 1}</small>
              <span className="t">{n.label}</span>
            </Link>
          ))}
        </nav>
        <div className="sheet-foot">
          <a href={company.phoneHref} tabIndex={open ? 0 : -1}>
            {company.phone}
          </a>
          <a href={`mailto:${company.email}`} tabIndex={open ? 0 : -1}>
            {company.email}
          </a>
          <div className="row">
            <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" tabIndex={open ? 0 : -1}>
              WhatsApp
            </a>
            <a href={company.social.instagram} target="_blank" rel="noopener noreferrer" tabIndex={open ? 0 : -1}>
              Instagram
            </a>
            <a href={company.social.facebook} target="_blank" rel="noopener noreferrer" tabIndex={open ? 0 : -1}>
              Facebook
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
