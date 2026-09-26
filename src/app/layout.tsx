import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { company } from "@/content/company";

// Self-hosted (no build-time network, no layout shift)
const manrope = localFont({ src: "./fonts/Manrope-Variable.woff2", variable: "--font-manrope", weight: "200 800", display: "swap" });
const mono = localFont({ src: "./fonts/JetBrainsMono-Regular.woff2", variable: "--font-jetbrains", weight: "400", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(company.url),
  title: { default: `${company.name} — ${company.tagline}`, template: `%s | ${company.name}` },
  description:
    "S Tec Secure designs, installs and supports CCTV surveillance, access control, video door phones, burglar alarms and smart home automation for homes, offices and commercial spaces.",
  applicationName: company.name,
  keywords: ["CCTV installation", "access control", "video door phone", "burglar alarm", "home automation", "gate automation", "security systems", "smart home"],
  openGraph: { type: "website", siteName: company.name, locale: "en_IN", url: "/" },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/icon.svg" },
  formatDetection: { telephone: false },
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
    <html lang="en" className={`${manrope.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        {/* reveal effects run only when scripts do; without them every section is simply visible */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
