import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { site } from "@/config/site";
import "./globals.css";

const manrope = localFont({
  src: "./fonts/Manrope-Variable.woff2",
  weight: "200 800",
  variable: "--font-manrope",
  display: "swap",
});
const instrument = localFont({
  src: [
    { path: "./fonts/InstrumentSerif-Regular.woff", weight: "400", style: "normal" },
    { path: "./fonts/InstrumentSerif-Italic.woff", weight: "400", style: "italic" },
  ],
  variable: "--font-instrument",
  display: "swap",
});
const jetbrains = localFont({
  src: "./fonts/JetBrainsMono-Regular.woff2",
  weight: "400",
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: `${site.name} — Security. Intelligence. Control.`,
  description: `${site.statement} CCTV surveillance, access control, video door phones, burglar alarms and smart automation.`,
  openGraph: {
    title: `${site.name} — Security. Intelligence. Control.`,
    description: site.statement,
    images: ["/media/hero/poster.jpg"],
    type: "website",
  },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#060708",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${instrument.variable} ${jetbrains.variable}`}>
      <body>
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}.hero__loader{display:none}`}</style>
        </noscript>
        <a className="skip-link" href="#solutions">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
