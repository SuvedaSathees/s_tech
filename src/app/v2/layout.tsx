import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/v2/v2.css";

/**
 * /v2 — the new cinematic S TEC SECURE site, living alongside the current one.
 * Manrope + JetBrains Mono come from the root layout; Instrument Serif is added here.
 */
const instrument = localFont({
  src: [
    { path: "../../v2/fonts/InstrumentSerif-Regular.woff", weight: "400", style: "normal" },
    { path: "../../v2/fonts/InstrumentSerif-Italic.woff", weight: "400", style: "italic" },
  ],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  title: "S TEC SECURE — Security. Intelligence. Control.",
  description:
    "Intelligent security and automation for modern spaces. CCTV surveillance, access control, video door phones, burglar alarms and smart automation.",
};

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`v2root ${instrument.variable}`}>
      <noscript>
        <style>{`[data-reveal]{opacity:1!important;transform:none!important}.hero__loader{display:none}`}</style>
      </noscript>
      <a className="skip-link" href="#solutions">
        Skip to content
      </a>
      {children}
    </div>
  );
}
