import type { Metadata } from "next";
import EnquiryForm from "@/components/contact/EnquiryForm";
import CopyButton from "@/components/contact/CopyButton";
import { Crumbs, JsonLd, Lines } from "@/components/site/ui";
import { ArrowUpRight, ChatIcon, MailIcon, PhoneIcon } from "@/components/site/Icons";
import { absolute, company, whatsappHref, og } from "@/content/company";

export const metadata: Metadata = {
  title: "Contact Us — Book a Security Consultation",
  description:
    "Call +91 96002 52605, email stecsecure@gmail.com or send an enquiry to plan CCTV, access control, alarms or home automation for your home, office or commercial property.",
  alternates: { canonical: "/contact" },
  openGraph: og("/contact", 'Contact Us — Book a Security Consultation', 'Call +91 96002 52605, email stecsecure@gmail.com or send an enquiry to plan CCTV, access control, alarms or home automation for your home, office or commercial property.'),
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
          <Lines as="h1" lines={["Let’s secure", "your space."]} id="contact-h" focusable />
          <p className="c-lede">Tell us about your home, office, commercial property or project.</p>
          <dl className="details">
            <div className="detail">
              <dt>
                <span className="ci">
                  <PhoneIcon />
                </span>
                <span className="dl">Phone</span>
              </dt>
              <dd>
                <a href={company.phoneHref}>
                  <span className="cv">{company.phone}</span>
                  <ArrowUpRight className="" />
                </a>
                <CopyButton value={company.phone} label="Copy phone number" />
              </dd>
            </div>
            <div className="detail">
              <dt>
                <span className="ci">
                  <MailIcon />
                </span>
                <span className="dl">Email</span>
              </dt>
              <dd>
                <a href={`mailto:${company.email}`}>
                  <span className="cv">{company.email}</span>
                  <ArrowUpRight className="" />
                </a>
                <CopyButton value={company.email} label="Copy email address" />
              </dd>
            </div>
            <div className="detail">
              <dt>
                <span className="ci">
                  <ChatIcon />
                </span>
                <span className="dl">WhatsApp</span>
              </dt>
              <dd>
                <a href={whatsappHref()} target="_blank" rel="noopener noreferrer">
                  Chat with us
                  <ArrowUpRight className="" />
                </a>
              </dd>
            </div>
          </dl>
          <ul className="c-note">
            <li>Photos or a floor plan help us picture the space before we talk.</li>
            <li>Say which systems you’re curious about, even if you’re unsure.</li>
            <li>Mention a good time for us to call you back.</li>
          </ul>
        </div>
        <EnquiryForm />
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          url: absolute("/contact"),
          mainEntity: {
            "@type": "Organization",
            name: company.shortName,
            telephone: "+91-96002-52605",
            email: company.email,
            contactPoint: [{ "@type": "ContactPoint", telephone: "+91-96002-52605", contactType: "customer service" }],
          },
        }}
      />
    </section>
  );
}
