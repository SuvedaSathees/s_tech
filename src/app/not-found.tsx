import type { Metadata } from "next";
import SiteChrome from "@/components/site/SiteChrome";
import { Btn } from "@/components/site/ui";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <SiteChrome>
      <section className="nf">
        <div className="wrap">
          <p className="eyebrow">404 · Not found</p>
          <h1 className="display" style={{ marginTop: 24 }}>
            <span className="l">This page</span>
            <span className="l w45">has moved or never existed.</span>
          </h1>
          <p className="lede">Try the home page, or go straight to the systems we install.</p>
          <div className="btn-row">
            <Btn href="/" solid>
              Back to home
            </Btn>
            <Btn href="/services">See services</Btn>
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
