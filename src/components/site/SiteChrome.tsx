import type { ReactNode } from "react";
import "@/app/site.css";
import Nav from "./Nav";
import Footer from "./Footer";
import Effects from "./Effects";
import { SvgDefs } from "./Icons";
import { JsonLd } from "./ui";
import { company } from "@/content/company";

const ORG = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${company.url}/#org`,
  name: company.shortName,
  alternateName: company.name,
  url: company.url,
  logo: `${company.url}/icon.svg`,
  description: "Security and automation company: CCTV surveillance, access control, video door phones, burglar alarms and smart home automation.",
  telephone: "+91-96002-52605",
  email: company.email,
  sameAs: [company.social.instagram, company.social.facebook],
  knowsAbout: ["CCTV surveillance", "Access control", "Video door phones", "Burglar alarms", "Home automation", "Gate automation"],
};
const SITE = { "@context": "https://schema.org", "@type": "WebSite", name: company.name, url: company.url, publisher: { "@id": `${company.url}/#org` } };

/**
 * Everything around a page of the six-page site: header, footer, motion and
 * site-wide structured data. The site's stylesheet loads here, so the older
 * experiments under /v2 and /studio keep their own look.
 */
export default function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <div className="st-site">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <SvgDefs />
      <Nav />
      <main id="main">{children}</main>
      <Footer />
      <Effects />
      <JsonLd data={ORG} />
      <JsonLd data={SITE} />
    </div>
  );
}
