"use client";
import { useState } from "react";
import { solutions } from "@/v2/config/site";
import MediaSlot from "../media/MediaSlot";
import Reveal from "../ui/Reveal";

export default function Solutions() {
  const [active, setActive] = useState(0);
  return (
    <Reveal as="section" id="solutions" className="section solutions">
      <div className="container">
        <header className="section-head">
          <div>
            <span className="eyebrow" data-reveal>
              Solutions
            </span>
            <h2 className="h2" data-reveal data-delay="0.1">
              Five systems.
              <br />
              <em>One intelligent</em> whole.
            </h2>
          </div>
          <p className="lede" data-reveal data-delay="0.2">
            Every S TEC installation is designed as a single platform — cameras that trigger lights, doors that know
            faces, alarms that verify themselves — engineered around the way your space is actually used.
          </p>
        </header>

        <div className="sol">
          <ul className="sol__list" data-reveal>
            {solutions.map((s, i) => (
              <li key={s.id} className={`sol__item ${i === active ? "is-active" : ""}`}>
                <button
                  className="sol__btn"
                  aria-expanded={i === active}
                  aria-controls={`sol-${s.id}`}
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                >
                  <span className="sol__no">{s.no}</span>
                  <span className="sol__title">{s.title}</span>
                  <span className="sol__plus" aria-hidden="true" />
                </button>
                <div className="sol__detail" id={`sol-${s.id}`}>
                  <div>
                    <div className="sol__detail-inner">
                      <div className="sol__mobile-media">
                        <MediaSlot src={s.media || s.render} alt={s.title} />
                      </div>
                      <p className="sol__kicker">{s.kicker}</p>
                      <p className="sol__body">{s.body}</p>
                      <ul className="sol__points">
                        {s.points.map((p) => (
                          <li key={p}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="sol__media" data-reveal data-delay="0.15">
            <div className="sol__frame">
              {solutions.map((s, i) => (
                <MediaSlot key={s.id} src={s.media || s.render} alt={s.title} className={i === active ? "is-active" : ""} />
              ))}
              <div className="sol__caption">
                <span className="eyebrow">{solutions[active].title}</span>
                <span className="sol__count">
                  {solutions[active].no} / 0{solutions.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
