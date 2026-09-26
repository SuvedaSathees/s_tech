import type { Metadata } from "next";
import Image from "next/image";
import { company, og } from "@/content/company";
import EcosystemMap from "@/components/about/EcosystemMap";
import { Btn, Crumbs, CtaBand, Eyebrow, Lines } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "About Us — Security & Automation Company",
  description:
    "Meet S Tec Secure: a security and automation company with one vision — spaces that protect the people inside them. Our mission, values and the way we plan, install and support every system.",
  alternates: { canonical: "/about" },
  openGraph: og("/about", 'About Us — Security & Automation Company', 'Meet S Tec Secure: a security and automation company with one vision — spaces that protect the people inside them. Our mission, values and the way we plan, install and support every system.'),
};

const PILLARS = [
  {
    h: "Who we are",
    p: "Established in 2021, S Tec Secure is a security and automation company. We design, install and support the systems that protect and run modern homes, offices and commercial spaces.",
  },
  {
    h: "What we provide",
    p: "CCTV surveillance, smart home automation, video door phones, burglar alarms and access control — as individual systems or one integrated solution.",
  },
  {
    h: "Who we work with",
    p: "Families in independent houses, villas and apartments; owners and managers of offices, shops and showrooms; and builders and architects whose projects are still on the drawing board.",
  },
];

const PROMISES = [
  "See the site before suggesting a single device.",
  "Plan every system to work with the others.",
  "Explain options and costs before any work begins.",
  "Stay your point of contact long after handover.",
];

const VALUES = [
  { h: "Honesty", p: "We recommend what the property needs, and say so when something isn’t worth adding." },
  { h: "Craft", p: "Neat cable runs, solid mounting and a clean site when we leave." },
  { h: "Integration", p: "Devices are chosen to cooperate, not just to sit side by side." },
  { h: "Simplicity", p: "Everyday controls should take one tap, not a manual." },
  { h: "Thoroughness", p: "We’d rather spend an extra hour testing than leave a blind spot behind." },
  { h: "Respect", p: "We work around your routine and treat your space as carefully as our own." },
];

const GLANCE = [
  { n: "2021", t: "Established", d: "Securing homes and businesses since" },
  { n: "24/7", t: "Support", d: "Help whenever a system needs attention" },
  { n: "1", t: "App", d: "For cameras, doors, lights and the alarm" },
  { n: "6", t: "Steps", d: "From the first call to aftercare" },
];

const CMP = [
  ["Gaps between devices that nobody owns", "One view of the whole property"],
  ["Alarms that arrive without context", "Every alert checked against a camera"],
  ["A different app for every device", "One place to see and control it all"],
  ["Systems that ignore each other", "Systems that respond as one"],
];

const STEPS = [
  { h: "Consultation", k: "Call or visit", p: "We listen first — what you want to protect, who uses the space and what is already installed." },
  { h: "Site survey", k: "Measured walk-round", p: "Entrances, cable routes and mounting points are checked in person, not guessed from a photo." },
  { h: "Design", k: "Device layout", p: "A layout for cameras, entry points, sensors and automation, with cabling and control points planned in." },
  { h: "Installation", k: "Fitted & connected", p: "Every system installed, configured and tested so it works alongside the others." },
  { h: "Handover", k: "Walk-through", p: "Everyone who will use it is shown how the app, the readers and the alarm work day to day." },
  { h: "Support", k: "Service & changes", p: "After handover we’re still here — for questions, changes and service." },
];

export default function AboutPage() {
  return (
    <>
      {/* 01 — about */}
      <header className="page-head ab-head">
        <div className="wrap">
          <Crumbs
            trail={[
              { name: "Home", href: "/" },
              { name: "About", href: "/about" },
            ]}
          />
          <Eyebrow n="01" className="ab-kicker">
            About S Tec Secure
          </Eyebrow>
          <Lines as="h1" lines={["Security is no longer a camera on a wall.", "It’s how a space thinks."]} id="about-h" focusable />
          <div className="ab-head-foot" data-reveal="">
            <div className="ab-head-l">
              <p className="lede">
                We plan, install and look after the systems that keep homes, offices and commercial spaces safe — and make them easier to live and work in.
              </p>
              <Btn href="/contact#enquiry" solid>
                Talk to our team
              </Btn>
            </div>
            <dl className="ab-facts">
              <div>
                <dt>{company.established}</dt>
                <dd>Established</dd>
              </div>
              <div>
                <dt>{company.address.city}</dt>
                <dd>{company.address.region} · and nearby</dd>
              </div>
            </dl>
          </div>
        </div>
      </header>

      {/* 02 — approach */}
      <section className="sec" aria-labelledby="idx-h">
        <div className="wrap ab-index">
          <div className="intro">
            <Eyebrow n="02">Our approach</Eyebrow>
            <Lines lines={["One team for", "the whole system."]} id="idx-h" />
            <p className="lede" data-reveal="">
              Most security problems start in the gaps between systems and suppliers. We close them by taking responsibility for the entire design.
            </p>
          </div>
          <div className="pillars">
            {PILLARS.map((x, i) => (
              <article className="pillar" key={x.h} data-reveal="" style={{ ["--d" as string]: `${i * 90}ms` }}>
                <span className="no">{String(i + 1).padStart(2, "0")}</span>
                <h3>{x.h}</h3>
                <p>{x.p}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 03 — vision & mission */}
      <section className="sec alt" aria-labelledby="vm-h">
        <div className="wrap">
          <div className="sec-top">
            <div>
              <Eyebrow n="03">Vision &amp; mission</Eyebrow>
              <Lines lines={["What we’re", "working towards."]} id="vm-h" />
            </div>
            <p className="lede" data-reveal="">
              Two sentences that guide every layout we draw and every system we hand over.
            </p>
          </div>
          <div className="vm">
            <article className="vm-card" data-reveal="">
              <p className="eyebrow">Our vision</p>
              <blockquote>Every home and workplace protected by systems that understand the space they’re in — and quietly take care of it.</blockquote>
              <p>Security that notices, decides and responds, so the people inside can simply get on with their day.</p>
            </article>
            <article className="vm-card" data-reveal="" style={{ ["--d" as string]: "100ms" }}>
              <p className="eyebrow">Our mission</p>
              <blockquote>To plan, install and support security and automation that works as one, stays simple to use and keeps working long after handover.</blockquote>
              <p>Measured not by how much equipment goes in, but by how rarely you have to think about it afterwards.</p>
            </article>
          </div>
          <div className="promises" data-reveal="">
            <p className="promises-h">Four promises on every project</p>
            <ol>
              {PROMISES.map((t, i) => (
                <li key={t}>
                  <span className="no">{String(i + 1).padStart(2, "0")}</span>
                  <span>{t}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* 04 — from the CEO */}
      <section className="sec ceo" aria-labelledby="ceo-h">
        <div className="wrap ceo-grid">
          <figure className="ceo-photo" data-reveal="">
            <Image src={company.ceo.photo} alt={`${company.ceo.name}, ${company.ceo.title}`} fill sizes="(min-width: 1024px) 460px, 100vw" />
            <figcaption>
              <span className="n">{company.ceo.name}</span>
              <span className="r">{company.ceo.title}</span>
            </figcaption>
          </figure>
          <div className="ceo-copy">
            <Eyebrow n="04">From the CEO</Eyebrow>
            <Lines lines={["A message", "from our CEO."]} id="ceo-h" />
            <blockquote className="ceo-quote" data-reveal="">
              <p>“{company.ceo.quote}”</p>
            </blockquote>
            <p className="ceo-sign" data-reveal="">
              <i aria-hidden="true" />
              <b>{company.ceo.name}</b>
              <span>{company.ceo.title}</span>
            </p>
          </div>
        </div>
      </section>

      {/* 05 — values */}
      <section className="sec alt" aria-labelledby="val-h">
        <div className="wrap">
          <div className="sec-top">
            <div>
              <Eyebrow n="05">Values</Eyebrow>
              <Lines lines={["Principles we", "work by."]} id="val-h" />
            </div>
            <p className="lede" data-reveal="">
              Six habits that shape every layout, installation and handover — whatever the size of the job.
            </p>
          </div>
          <div className="values">
            {VALUES.map((v, i) => (
              <article className="value" key={v.h} data-reveal="" style={{ ["--d" as string]: `${(i % 3) * 80}ms` }}>
                <span className="no">{String(i + 1).padStart(2, "0")}</span>
                <h3>{v.h}</h3>
                <p>{v.p}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 06 — at a glance */}
      <section className="sec" aria-labelledby="gl-h">
        <div className="wrap">
          <div className="sec-top">
            <div>
              <Eyebrow n="06">At a glance</Eyebrow>
              <Lines lines={["One system,", "by the numbers."]} id="gl-h" />
            </div>
          </div>
          <dl className="glance">
            {GLANCE.map((g, i) => (
              <div key={g.t} data-reveal="" style={{ ["--d" as string]: `${i * 90}ms` }}>
                <dt>
                  <span className="gn">{g.n}</span>
                  <span className="gt">{g.t}</span>
                </dt>
                <dd>{g.d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 07 — why integrated */}
      <section className="sec alt" aria-labelledby="wi-h">
        <div className="wrap why-int">
          <div className="left">
            <Eyebrow n="07">Why integrated</Eyebrow>
            <Lines lines={["Connected systems", "close the gaps."]} id="wi-h" />
            <blockquote className="ab-quote" data-reveal="">
              An alarm that can switch on the lights, a door that can tell the cameras who entered, and a phone that shows you all of it — that is simply safer.
            </blockquote>
          </div>
          <div className="cmp" role="table" aria-label="Separate systems compared with integrated systems" data-reveal="">
            <div className="cmp-row cmp-h" role="row">
              <span role="columnheader">Separate systems</span>
              <span role="columnheader">Designed together</span>
            </div>
            {CMP.map(([a, b]) => (
              <div className="cmp-row" role="row" key={a}>
                <span role="cell">{a}</span>
                <span role="cell">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 08 — ecosystem */}
      <EcosystemMap num="08" />

      {/* 09 — process */}
      <section className="sec alt" aria-labelledby="hw-h">
        <div className="wrap">
          <div className="sec-top">
            <div>
              <Eyebrow n="09">How we work</Eyebrow>
              <Lines lines={["From the first call", "to every day after."]} id="hw-h" />
            </div>
          </div>
          <ol className="flow flow-6" data-reveal="">
            {STEPS.map((s, i) => (
              <li className="flow-step" key={s.h} style={{ ["--i" as string]: i }}>
                <span className="flow-node" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flow-body">
                  <p className="flow-k">{s.k}</p>
                  <h3>{s.h}</h3>
                  <p>{s.p}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <CtaBand kicker="Work with us" lines={["Have a space in mind?", "Let’s talk it through."]} lede="A floor plan, a few photos or just a rough idea is enough to begin." />
    </>
  );
}
