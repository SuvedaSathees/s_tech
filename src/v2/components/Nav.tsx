"use client";
import { useEffect, useState } from "react";
import { nav } from "@/v2/config/site";
import Logo from "./ui/Logo";

export default function Nav() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const hero = document.getElementById("top");
    const onScroll = () => {
      const heroEnd = hero ? hero.offsetTop + hero.offsetHeight - window.innerHeight : 0;
      setSolid(window.scrollY > heroEnd - 10);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const ids = nav.map((n) => n.href.slice(1));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id));
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <>
      <header className={`nav ${solid ? "is-solid" : ""}`}>
        <div className="nav__inner">
          <a href="#top" aria-label="S TEC SECURE — home" onClick={() => setOpen(false)}>
            <Logo />
          </a>
          <nav aria-label="Primary">
            <ul className="nav__links">
              {nav.map((n) => (
                <li key={n.href}>
                  <a href={n.href} className={active === n.href.slice(1) ? "is-active" : ""}>
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <a href="#contact" className="btn nav__cta">
            Consultation
          </a>
          <button
            className="nav__burger"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="nav-sheet"
            onClick={() => setOpen((o) => !o)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>
      <div id="nav-sheet" className={`nav__sheet ${open ? "is-open" : ""}`} aria-hidden={!open}>
        {nav.map((n, i) => (
          <a key={n.href} href={n.href} className="big" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
            <small>0{i + 1}</small>
            {n.label}
          </a>
        ))}
      </div>
    </>
  );
}
