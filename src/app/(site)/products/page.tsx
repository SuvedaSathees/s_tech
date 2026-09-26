import type { Metadata } from "next";
import { og } from "@/content/company";
import Image from "next/image";
import Link from "next/link";
import { CtaBand, FaqSection, Lines, PageHead } from "@/components/site/ui";
import { ArrowUpRight } from "@/components/site/Icons";
import { PRODUCTS } from "@/content/products";
import { FEATURES } from "@/content/tech";
import { ICONS } from "@/content/icons";
import { PRODUCT_FAQS } from "@/content/faqs";

export const metadata: Metadata = {
  title: "Security Products — Cameras, Door Phones, Locks & Sensors",
  description:
    "Security cameras and recorders, video door phones, fingerprint and card readers, digital door locks, alarm sensors, home automation controls and gate motors, supplied and installed to work together.",
  alternates: { canonical: "/products" },
  openGraph: og("/products", 'Security Products — Cameras, Door Phones, Locks & Sensors', 'Security cameras and recorders, video door phones, fingerprint and card readers, digital door locks, alarm sensors, home automation controls and gate motors, supplied and installed to work together.'),
};

export default function ProductsPage() {
  return (
    <>
      <PageHead
        trail={[
          { name: "Home", href: "/" },
          { name: "Products", href: "/products" },
        ]}
        lines={["The hardware", "behind every system."]}
        lede="Cameras, door phones, readers, sensors and controllers — chosen for your space, then installed and set up to work as one."
        tags={["Cameras", "Door phones", "Readers & locks", "Sensors", "Controllers", "Gate motors"]}
        id="prod-h"
      />

      <section className="prod" aria-label="Product range">
        <div className="wrap">
          <div className="prod-grid">
            {PRODUCTS.map((p, i) => (
              <article className="prod-card" id={p.id} key={p.id} data-reveal="" style={{ ["--d" as string]: `${(i % 3) * 90}ms` }}>
                <div className="card-top">
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <i />
                </div>
                <div className="ic">
                  <svg viewBox="0 0 240 150" aria-hidden="true" focusable="false" dangerouslySetInnerHTML={{ __html: ICONS[p.id] }} />
                </div>
                <h2>{p.title}</h2>
                <p>{p.line}</p>
                <ul>
                  {p.items.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
                <Link className="tlink" href={`/contact?system=${encodeURIComponent(p.sys)}#enquiry`}>
                  Ask about this
                  <ArrowUpRight className="" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sec alt" id="technology" aria-labelledby="tech-h">
        <div className="wrap">
          <div className="sec-top">
            <div>
              <p className="eyebrow">Technology</p>
              <Lines lines={["Intelligence,", "made visible."]} id="tech-h" />
            </div>
            <p className="lede" data-reveal="">
              The capabilities that turn hardware into a system that watches, understands and responds.
            </p>
          </div>
          <div className="tgrid">
            {FEATURES.map((f, i) => (
              <article className="tcard" key={f.t} data-reveal="" style={{ ["--d" as string]: `${(i % 3) * 90}ms` }}>
                <div className="t-img">
                  <Image src={f.img} alt={f.alt} fill sizes="(min-width: 1100px) 33vw, (min-width: 640px) 50vw, 100vw" />
                  <span className="t-no">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div className="t-body">
                  <h3>{f.t}</h3>
                  <p>{f.d}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <FaqSection
        id="faq"
        kicker="Hardware questions"
        lines={["Choosing", "the right kit."]}
        lede="Short answers about cameras, recorders, readers and automation hardware. For anything specific to your space, ask us directly."
        items={PRODUCT_FAQS}
      />

      <CtaBand
        kicker="Help choosing"
        lines={["Not sure which", "hardware fits?"]}
        lede="Describe the space and we’ll suggest cameras, readers and sensors that suit it."
      />
    </>
  );
}
