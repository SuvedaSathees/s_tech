import type { Metadata } from "next";
import Solutions from "@/components/services/Solutions";
import Spaces from "@/components/services/Spaces";
import Reviews from "@/components/services/Reviews";
import { CtaBand, FaqSection, JsonLd } from "@/components/site/ui";
import { SERVICES } from "@/content/services";
import { SERVICE_FAQS } from "@/content/faqs";
import { absolute, company, og } from "@/content/company";

export const metadata: Metadata = {
  title: "CCTV, Access Control, Alarm & Automation Services",
  description:
    "CCTV surveillance, smart home automation, access control, video door phones and burglar alarms — designed and installed as one integrated system for homes, offices and commercial property.",
  alternates: { canonical: "/services" },
  openGraph: og("/services", 'CCTV, Access Control, Alarm & Automation Services', 'CCTV surveillance, smart home automation, access control, video door phones and burglar alarms — designed and installed as one integrated system for homes, offices and commercial property.'),
};

export default function ServicesPage() {
  return (
    <>
      <Solutions />
      <Spaces />
      <Reviews />
      <FaqSection
        id="faq"
        kicker="Service questions"
        lines={["Good to know", "before we visit."]}
        lede="The questions we hear most when people are planning cameras, access, alarms or automation for the first time."
        items={SERVICE_FAQS}
        help={{
          kicker: "Still deciding?",
          title: "Not sure where to start?",
          text: "Message us a few details about your property and we’ll suggest a sensible first step — one camera or all five systems.",
        }}
      />
      <CtaBand
        kicker="Next step"
        lines={["Start with one system", "or plan all five."]}
        lede="Tell us what you’d like to secure first, and we’ll show how the rest can connect later."
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "S Tec Secure services",
          itemListElement: SERVICES.map((s, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Service",
              name: s.title,
              description: s.line,
              url: absolute(`/services#${s.id}`),
              provider: { "@type": "Organization", name: company.shortName, url: company.url },
            },
          })),
        }}
      />
    </>
  );
}
