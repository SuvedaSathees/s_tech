import { Lines } from "@/components/site/ui";
import { REVIEWS } from "@/content/reviews";

type Review = (typeof REVIEWS)[number];
const initials = (n: string) =>
  n
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

function Card({ r }: { r: Review }) {
  return (
    <figure className="rev-card">
      <svg className="rev-q" viewBox="0 0 32 24" aria-hidden="true">
        <path d="M0 24V14C0 6.3 4.3 1.6 12 0l1.6 3.2C9 4.8 6.8 7.6 6.6 11H12v13zm18 0V14c0-7.7 4.3-12.4 12-14l1.6 3.2C27 4.8 24.8 7.6 24.6 11H30v13z" fill="currentColor" />
      </svg>
      <blockquote>{r.text}</blockquote>
      <figcaption>
        <span className="rev-av" aria-hidden="true">
          {initials(r.name)}
        </span>
        <span className="rev-n">{r.name}</span>
      </figcaption>
    </figure>
  );
}

/**
 * Client reviews from the company's current site, in two rows that drift in
 * opposite directions (paused on hover; still for reduced motion).
 */
export default function Reviews() {
  const rows = [REVIEWS.slice(0, 4), REVIEWS.slice(4)];
  return (
    <section className="sec alt reviews" aria-labelledby="rev-h">
      <div className="wrap">
        <div className="sec-top">
          <div>
            <p className="eyebrow">Client reviews</p>
            <Lines lines={["In their", "own words."]} id="rev-h" />
          </div>
          <p className="lede" data-reveal="">
            What customers have told us after their cameras, door phones and alarms were installed.
          </p>
        </div>
      </div>
      <div className="rev-rows" data-reveal="">
        {rows.map((row, i) => (
          <div className={`rev-track${i ? " back" : ""}`} key={i}>
            <ul className="rev-set">
              {row.map((r) => (
                <li key={r.name}>
                  <Card r={r} />
                </li>
              ))}
            </ul>
            <ul className="rev-set" aria-hidden="true">
              {row.map((r) => (
                <li key={r.name}>
                  <Card r={r} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
