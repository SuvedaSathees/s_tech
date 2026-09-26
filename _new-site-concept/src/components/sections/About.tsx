import { process } from "@/config/site";
import Reveal from "../ui/Reveal";

export default function About() {
  return (
    <Reveal as="section" id="about" className="section about">
      <div className="container">
        <span className="eyebrow" data-reveal style={{ display: "block", marginBottom: 36 }}>
          About S TEC SECURE
        </span>
        <p className="about__statement" data-reveal data-delay="0.1">
          We design security the way architects design space — <span className="dim">deliberately, discreetly,</span> and
          around the people who live and work in it.
        </p>
        <div className="process">
          {process.map((s, i) => (
            <div className="step" key={s.no} data-reveal data-delay={String(i * 0.08)}>
              <span className="eyebrow">{s.no}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
