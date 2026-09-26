import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { site } from "@/config/site";

// Self-hosted (no build-time network, no layout shift)
const manrope = localFont({ src: "./fonts/Manrope-Variable.woff2", variable: "--font-manrope", weight: "200 800", display: "swap" });
const mono = localFont({ src: "./fonts/JetBrainsMono-Regular.woff2", variable: "--font-jetbrains", weight: "400", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://stecsecure.com"),
  title: `${site.name} — ${site.tagline}`,
  description: `${site.statement} CCTV surveillance, smart home automation, access control, video door phones and burglar alarms.`,
  openGraph: {
    title: `${site.name} — ${site.tagline}`,
    description: site.statement,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
