import type { Metadata } from "next";
import { og } from "@/content/company";
import EcosystemMap from "@/components/about/EcosystemMap";
import { CtaBand, Lines, PageHead } from "@/components/site/ui";

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
    p: "S Tec Secure is a security and automation company. We design, install and support the systems that protect and run modern homes, offices and commercial spaces.",
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

const VALUES = [
  { h: "Plan first", p: "We understand how a place is used before recommending a single device." },
  { h: "Connect everything", p: "Cameras, readers, alarms and automation should share what they know." },
  { h: "Keep it simple", p: "If arming the alarm takes a manual, it won’t get armed. Every control should be obvious." },
  { h: "Stay close", p: "Handover is the start of the relationship, not the end of the job." },
];

const CMP = [
  ["Gaps between devices that nobody owns", "One view of the whole property"],
  ["Alarms that arrive without context", "Every alert checked against a camera"],
  ["A different app for every device", "One place to see and control it all"],
  ["Systems that ignore each other", "Systems that respond as one"],
];

const STEPS = [
  { h: "Consultation", k: "Site visit & brief", p: "We listen first — what you want to protect, who uses the space and what is already installed." },
  { h: "Design", k: "Device layout", p: "A layout for cameras, entry points, sensors and automation, with cabling and control points planned in." },
  { h: "Installation", k: "Tested & handed over", p: "Every system installed, configured and tested so it works alongside the others." },
  { h: "Support", k: "Service & changes", p: "After handover we’re still here — for questions, changes and service." },
];

export default function AboutPage() {
  return (
    <>
      <PageHead
        trail={[
          { name: "Home", href: "/" },
          { name: "About", href: "/about" },
        ]}
        lines={["Security is no longer a camera on a wall.", "It’s how a space thinks."]}
        lede="We plan, install and look after the systems that keep homes, offices and commercial spaces safe — and make them easier to live and work in."
        id="about-h"
      />

      <section className="sec" aria-labelledby="idx-h">
        <div className="wrap ab-index">
          <div className="intro">
            <p className="eyebrow">About S Tec Secure</p>
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

      <section className="sec alt" aria-labelledby="vm-h">
        <div className="wrap">
          <div className="sec-top">
            <div>
              <p className="eyebrow">Vision &amp; mission</p>
              <Lines lines={["What we’re", "working towards."]} id="vm-h" />
            </div>
            <p className="lede" data-reveal="">
              Two sentences that guide every layout we draw and every system we hand over.
            </p>
          </div>
          <div className="vm" style={{ marginTop: 40 }}>
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
          <div className="values">
            {VALUES.map((v, i) => (
              <article className="value" key={v.h} data-reveal="" style={{ ["--d" as string]: `${i * 80}ms` }}>
                <span className="no">{String(i + 1).padStart(2, "0")}</span>
                <h3>{v.h}</h3>
                <p>{v.p}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sec" aria-labelledby="wi-h">
        <div className="wrap why-int">
          <div className="left">
            <p className="eyebrow">Why integrated</p>
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

      <EcosystemMap />

      <section className="sec alt" aria-labelledby="hw-h">
        <div className="wrap">
          <div className="sec-top">
            <div>
              <p className="eyebrow">How we work</p>
              <Lines lines={["From the first call", "to every day after."]} id="hw-h" />
            </div>
          </div>
          <ol className="flow" data-reveal="">
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
