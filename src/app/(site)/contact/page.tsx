import type { Metadata } from "next";
import EnquiryForm from "@/components/contact/EnquiryForm";
import { Crumbs, JsonLd, Lines, QuickActions } from "@/components/site/ui";
import { ArrowUpRight } from "@/components/site/Icons";
import { absolute, addressLine, company, mapsHref, og } from "@/content/company";

export const metadata: Metadata = {
  title: "Contact Us — Book a Security Consultation",
  description:
    "Call +91 96002 52605, email stecsecure@gmail.com or visit our Erode office to plan CCTV, access control, alarms or home automation for your home, office or commercial property.",
  alternates: { canonical: "/contact" },
  openGraph: og("/contact", 'Contact Us — Book a Security Consultation', 'Call +91 96002 52605, email stecsecure@gmail.com or visit our Erode office to plan CCTV, access control, alarms or home automation for your home, office or commercial property.'),
};

export default function ContactPage() {
  return (
    <section className="contact" id="contact-s" aria-labelledby="contact-h">
      <div className="wrap c-grid">
        <div className="c-left">
          <Crumbs
            trail={[
              { name: "Home", href: "/" },
              { name: "Contact", href: "/contact" },
            ]}
          />
          <p className="eyebrow c-kicker">Contact</p>
          <Lines as="h1" lines={["Let’s secure", "your space."]} id="contact-h" focusable />
          <p className="c-lede">Planning cameras, locks, alarms or automation? Share a few details and we’ll get back to you by phone or WhatsApp.</p>
          <QuickActions className="c-qa" values />
          <div className="c-visit">
            <p className="eyebrow">Visit us</p>
            <address className="c-addr">{addressLine}</address>
            <p className="c-hours">Working hours · {company.hours}</p>
            <a className="tlink" href={mapsHref} target="_blank" rel="noopener noreferrer">
              Get directions
              <ArrowUpRight className="" />
            </a>
          </div>
        </div>
        <EnquiryForm />
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          url: absolute("/contact"),
          mainEntity: {
            "@type": "LocalBusiness",
            name: company.shortName,
            url: company.url,
            image: absolute("/opengraph-image.jpg"),
            telephone: "+91-96002-52605",
            email: company.email,
            foundingDate: company.established,
            areaServed: company.area,
            address: {
              "@type": "PostalAddress",
              streetAddress: company.address.street,
              addressLocality: company.address.city,
              addressRegion: company.address.region,
              postalCode: company.address.postcode,
              addressCountry: company.address.country,
            },
            contactPoint: [{ "@type": "ContactPoint", telephone: "+91-96002-52605", contactType: "customer service" }],
          },
        }}
      />
    </section>
  );
}
