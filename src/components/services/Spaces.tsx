"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { SPACES } from "@/content/spaces";
import { ArrowUpRight } from "@/components/site/Icons";

/**
 * "Spaces we secure": on large screens the section pins and the cards glide
 * sideways with a slight parallax; on phones they simply stack.
 */
export default function Spaces() {
  const secRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sec = secRef.current!, track = trackRef.current!;
    const pars = Array.from(track.querySelectorAll<HTMLElement>(".par"));
    const mq = window.matchMedia("(min-width: 1024px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let dist = 0, x = 0, raf = 0, last = performance.now();

    const size = () => {
      if (mq.matches) {
        // travel until the last space reaches the left edge (at the page gutter); the closing panel fills the right
        const cards = track.querySelectorAll<HTMLElement>(".p-card");
        const lastCard = cards[cards.length - 1];
        const gutter = parseFloat(getComputedStyle(track).paddingLeft) || 0;
        dist = lastCard ? Math.max(0, lastCard.offsetLeft - gutter) : 0;
        sec.style.height = window.innerHeight + dist + "px";
      } else {
        dist = 0;
        x = 0;
        sec.style.height = "";
        track.style.transform = "";
        pars.forEach((p) => (p.style.transform = ""));
      }
    };
    const frame = (now: number) => {
      const dt = Math.min(Math.max(now - last, 0) / 1000, 0.1);
      last = now;
      if (dist > 0) {
        const r = sec.getBoundingClientRect();
        if (r.bottom > -window.innerHeight && r.top < window.innerHeight * 2) {
          const tx = -Math.min(1, Math.max(0, -r.top / dist)) * dist;
          x += (tx - x) * (reduce ? 1 : 1 - Math.pow(0.004, dt));
          if (Math.abs(tx - x) < 0.1) x = tx;
          track.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
          for (const el of pars) {
            const b = el.parentElement!.getBoundingClientRect();
            const q = Math.min(1, Math.max(0, (window.innerWidth - b.left) / (window.innerWidth + b.width)));
            el.style.transform = `translate3d(${(-8 + 16 * q).toFixed(2)}%,0,0) scale(${(1.12 - 0.1 * q).toFixed(4)})`;
          }
        }
      }
      raf = requestAnimationFrame(frame);
    };
    size();
    const t = setTimeout(size, 500);
    window.addEventListener("resize", size);
    window.addEventListener("load", size);
    document.fonts?.ready.then(size).catch(() => {});
    raf = requestAnimationFrame(frame);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
      window.removeEventListener("load", size);
      sec.style.height = "";
    };
  }, []);

  return (
    <section ref={secRef} className="proj" id="spaces" aria-labelledby="proj-h">
      <div className="proj-pin">
        <div ref={trackRef} className="track">
          <div className="p-intro">
            <p className="eyebrow">Where we work</p>
            <h2 className="display" id="proj-h">
              <span className="l">Spaces</span>
              <span className="l w45">we secure.</span>
            </h2>
            <p className="lede">Every design starts from how a space is used. Here is how that plays out across four kinds of property.</p>
            <p className="hint desk" aria-hidden="true">
              Keep scrolling <i />
            </p>
          </div>
          {SPACES.map((s, i) => (
            <article className="p-card" key={s.key}>
              <div className="p-media">
                <div className="par">
                  <Image src={s.img} alt={s.alt} fill sizes="(min-width: 1024px) 62vw, (min-width: 640px) 70vw, 100vw" />
                </div>
                <span className="p-num">
                  {String(i + 1).padStart(2, "0")} / {String(SPACES.length).padStart(2, "0")}
                </span>
              </div>
              <div className="p-body">
                <div>
                  <p className="eyebrow">{s.kicker}</p>
                  <h3>{s.title}</h3>
                </div>
                <div>
                  <p>{s.body}</p>
                  <ul className="scope">
                    {s.scope.map((x) => (
                      <li key={x}>— {x}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
          <aside className="p-close" aria-label="Other kinds of property">
            <p className="eyebrow">Something else?</p>
            <p className="p-close-t">Every property is used differently.</p>
            <p className="p-close-d">Tell us how yours works — who comes and goes, and what needs watching — and we’ll plan around it.</p>
            <Link className="tlink" href="/contact#enquiry">
              Describe your space
              <ArrowUpRight className="" />
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
