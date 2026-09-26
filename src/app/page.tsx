import type { Metadata } from "next";
import { og } from "@/content/company";
import Link from "next/link";
import HeroFilm from "@/components/home/HeroFilm";
import SiteChrome from "@/components/site/SiteChrome";
import { Btn, CtaBand, Lines } from "@/components/site/ui";
import { SYSTEM_LINKS } from "@/content/services";

export const metadata: Metadata = {
  title: { absolute: "S TEC SECURE — CCTV, Access Control & Smart Home Automation" },
  description:
    "S Tec Secure designs, installs and supports CCTV surveillance, access control, video door phones, burglar alarms and smart home automation for homes, offices and commercial spaces.",
  alternates: { canonical: "/" },
  openGraph: og("/", 'S TEC SECURE — CCTV, Access Control & Smart Home Automation', 'S Tec Secure designs, installs and supports CCTV surveillance, access control, video door phones, burglar alarms and smart home automation for homes, offices and commercial spaces.'),
};

const WHY = [
  { h: "One company, start to finish", p: "Planning, installation and after-care come from the same place, so nothing falls between contractors." },
  { h: "Devices that talk to each other", p: "A door phone that shows a face, an alarm that switches on the lights — every device shares what it sees." },
  { h: "Planned around you", p: "Coverage follows your entrances, routines and blind spots, not a one-size-fits-all kit." },
  { h: "In your pocket", p: "Check the cameras, open the gate or arm the alarm from anywhere, all in a single app." },
];

const EXPLORE = [
  { no: "02", href: "/about", h: "About", p: "Our approach, why we integrate everything, and how a project runs from the first conversation to handover.", cta: "Get to know us" },
  { no: "03", href: "/services", h: "Services", p: "What each of our five systems does, and the kinds of property we design them for.", cta: "See services" },
  { no: "04", href: "/products", h: "Products", p: "The cameras, readers, sensors and controllers we install — and what they can do together.", cta: "Browse products" },
  { no: "05", href: "/blog", h: "Blog", p: "Plain-language answers to the questions people ask before they buy.", cta: "Read the guides" },
];

export default function HomePage() {
  return (
    <SiteChrome>
      <div className="page-enter">
      <HeroFilm />

      <section className="sec hm-intro" aria-labelledby="home-h">
        <div className="wrap">
          <p className="eyebrow">S Tec Secure · Security &amp; automation</p>
          <h1 className="hi-state" id="home-h" data-reveal="">
            Smart security for homes, offices and <span className="w45">commercial spaces.</span>
          </h1>
          <nav className="sys-strip" aria-label="Systems" data-reveal="" style={{ ["--d" as string]: "120ms" }}>
            {SYSTEM_LINKS.map((s) => (
              <Link key={s.label} href={s.href}>
                <i aria-hidden="true" />
                {s.label}
              </Link>
            ))}
          </nav>
          <div className="hi-foot" data-reveal="">
            <p className="lede">
              From the front gate to the bedroom door, we connect cameras, locks, alarms, door phones and automation so they behave as one system — and you
              control every part of it from your phone.
            </p>
            <div className="btn-row">
              <Btn href="/services" solid>
                Explore services
              </Btn>
              <Btn href="/contact">Talk to us</Btn>
            </div>
          </div>
        </div>
      </section>

      <section className="sec alt" aria-labelledby="why-h">
        <div className="wrap">
          <div className="sec-top">
            <div>
              <p className="eyebrow">Why S Tec Secure</p>
              <Lines lines={["Four reasons", "people choose us."]} id="why-h" />
            </div>
          </div>
          <ol className="why4">
            {WHY.map((w, i) => (
              <li key={w.h} data-reveal="" style={{ ["--d" as string]: `${i * 90}ms` }}>
                <span className="no">{String(i + 1).padStart(2, "0")}</span>
                <h3>{w.h}</h3>
                <p>{w.p}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="sec" aria-labelledby="next-h">
        <div className="wrap">
          <div className="sec-top">
            <div>
              <p className="eyebrow">Explore</p>
              <Lines lines={["Where would you", "like to start?"]} id="next-h" />
            </div>
          </div>
          <div className="xgrid">
            {EXPLORE.map((x, i) => (
              <Link key={x.href} className="xcard" href={x.href} data-reveal="" style={{ ["--d" as string]: `${i * 90}ms` }}>
                <span className="no">{x.no}</span>
                <h3>{x.h}</h3>
                <p>{x.p}</p>
                <span className="tlink">
                  {x.cta}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M7 7h10v10" />
                    <path d="M7 17 17 7" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        kicker="Get started"
        lines={["See it working", "in your own space."]}
        lede="Share what you want to protect and which systems you’re considering. We’ll come back with a plan."
      />
      </div>
    </SiteChrome>
  );
}

