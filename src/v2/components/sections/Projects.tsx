import { caseStudies, spaces } from "@/v2/config/site";
import MediaSlot from "../media/MediaSlot";
import Reveal from "../ui/Reveal";

export default function Projects() {
  const real = caseStudies.length > 0;
  return (
    <Reveal as="section" id="projects" className="section projects">
      <div className="container">
        <header className="section-head">
          <div>
            <span className="eyebrow" data-reveal>
              {real ? "Projects" : "Projects · Spaces we secure"}
            </span>
            <h2 className="h2" data-reveal data-delay="0.1">
              {real ? (
                <>
                  Selected <em>work</em>.
                </>
              ) : (
                <>
                  Designed for the
                  <br />
                  spaces that <em>matter</em>.
                </>
              )}
            </h2>
          </div>
          <p className="lede" data-reveal data-delay="0.2">
            From private villas to corporate floors, every project begins with the architecture and the people in it —
            then disappears into it.
          </p>
        </header>

        <div className="proj-grid">
          {real
            ? caseStudies.map((c, i) => (
                <article key={c.title} className={`proj ${i === 0 ? "proj--hero" : "proj--half"}`} data-reveal>
                  <MediaSlot src={c.image} alt={c.title} />
                  <div className="proj__body">
                    <span className="eyebrow">
                      {c.sector}
                      {c.location ? ` · ${c.location}` : ""}
                    </span>
                    <h3 className="proj__title">{c.title}</h3>
                    <p className="proj__text">{c.summary}</p>
                    <div className="proj__chips">
                      {c.scope.map((s) => (
                        <span className="chip" key={s}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              ))
            : spaces.map((s, i) => {
                const size = i === 0 ? "proj--hero" : i < 3 ? "proj--half" : "proj--third";
                const text = !s.image;
                return (
                  <article key={s.title} className={`proj ${size} ${text ? "proj--text" : ""}`} data-reveal data-delay={String((i % 3) * 0.08)}>
                    {!text && <MediaSlot src={s.image} alt={s.title} />}
                    {s.caption && <span className="proj__cap">{s.caption}</span>}
                    {text && <span className="proj__index">0{i + 1}</span>}
                    <div className="proj__body">
                      <h3 className="proj__title">{s.title}</h3>
                      <p className="proj__text">{s.body}</p>
                      <div className="proj__chips">
                        {s.scope.map((x) => (
                          <span className="chip" key={x}>
                            {x}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                );
              })}
        </div>
      </div>
    </Reveal>
  );
}
