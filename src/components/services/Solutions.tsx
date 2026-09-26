"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { SERVICES } from "@/content/services";
import { Crumbs, Lines } from "@/components/site/ui";

/**
 * Five systems. On large screens the section pins and scrolling steps through the
 * systems; on smaller screens the list works as tabs. Each system has a photograph
 * with a live-camera frame over it. /services#cctv (etc.) opens that system.
 */
export default function Solutions() {
  const secRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const set = useCallback((i: number) => {
    if (i === activeRef.current) return;
    activeRef.current = i;
    setActive(i);
  }, []);

  const desk = () => window.matchMedia("(min-width: 1024px)").matches;
  const posFor = (i: number) => {
    const sec = secRef.current!;
    const top = sec.getBoundingClientRect().top + window.scrollY;
    const span = sec.offsetHeight - window.innerHeight;
    return top + (span * i) / (SERVICES.length - 1) + 1;
  };

  // scroll position chooses the system on large screens
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      if (!desk()) return;
      const sec = secRef.current;
      if (!sec) return;
      const r = sec.getBoundingClientRect(), span = sec.offsetHeight - window.innerHeight;
      if (span <= 0 || r.bottom < 0 || r.top > window.innerHeight) return;
      const p = Math.min(1, Math.max(0, -r.top / span));
      set(Math.min(SERVICES.length - 1, Math.round(p * (SERVICES.length - 1))));
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [set]);

  // deep links: /services#access
  useEffect(() => {
    const open = () => {
      const id = window.location.hash.slice(1);
      const i = SERVICES.findIndex((s) => s.id === id);
      if (i < 0) return;
      if (desk()) window.scrollTo({ top: posFor(i), behavior: "auto" });
      else {
        set(i);
        secRef.current?.scrollIntoView({ block: "start" });
      }
    };
    const t = setTimeout(open, 60);
    window.addEventListener("hashchange", open);
    return () => {
      clearTimeout(t);
      window.removeEventListener("hashchange", open);
    };
  }, [set]);

  const choose = (i: number) => {
    if (!desk()) return set(i);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: posFor(i), behavior: reduce ? "auto" : "smooth" });
  };

  const s = SERVICES[active];

  return (
    <section ref={secRef} className="sol" id="solutions" aria-labelledby="sol-h">
      <div className="sol-pin">
        <div className="wrap sol-in">
          <div className="sol-head">
            <div>
              <Crumbs
                trail={[
                  { name: "Home", href: "/" },
                  { name: "Services", href: "/services" },
                ]}
              />
              <Lines as="h1" lines={["Five systems.", "One point of control."]} id="sol-h" focusable />
            </div>
            <p className="lede" data-reveal="">
              Each system is powerful on its own. Designed and installed together, they become one intelligent layer across your space.
            </p>
          </div>

          <div className="sol-grid">
            <ol className="sol-list" role="tablist" aria-label="Systems">
              {SERVICES.map((x, i) => (
                <li key={x.id} id={x.id}>
                  <button className="tab" type="button" role="tab" aria-selected={i === active} aria-controls="sol-stage" onClick={() => choose(i)}>
                    <span className="no">{x.no}</span>
                    <span className="txt">
                      <span className="ttl">{x.title}</span>
                      <span className="desc">
                        <span>
                          <span>
                            {x.line}
                            <span className="pts">
                              {x.points.map((pt) => (
                                <em key={pt}>{pt}</em>
                              ))}
                            </span>
                          </span>
                        </span>
                      </span>
                    </span>
                    <span className="ln" />
                  </button>
                </li>
              ))}
            </ol>

            <div className="stage" id="sol-stage" role="tabpanel" aria-label={s.title}>
              {SERVICES.map((x, i) => (
                <div key={x.id} className={`shot${i === active ? " on" : ""}`} aria-hidden={i !== active}>
                  <Image src={x.image} alt={x.alt} fill sizes="(min-width: 1024px) 60vw, 100vw" priority={i === 0} />
                </div>
              ))}
              <div className="stage-vig" aria-hidden="true" />
              <div className="stage-scan" aria-hidden="true" />
              <div className="stage-hud" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
              </div>
              <div className="ticks" aria-hidden="true">
                {SERVICES.map((x, i) => (
                  <span key={x.id} className={i === active ? "on" : undefined} />
                ))}
              </div>
              <p className="stage-live" aria-hidden="true">
                <span className="dot rec" />
                Live · {s.title.split(" ")[0]}
              </p>
              <div className="stage-foot">
                <div>
                  <div className="no">{s.no} / 05</div>
                  <div className="t">{s.title}</div>
                </div>
                <ul>
                  {s.points.map((pt) => (
                    <li key={pt}>— {pt}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
