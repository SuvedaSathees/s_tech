"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV, company, whatsappHref } from "@/content/company";
import { SYSTEM_LINKS } from "@/content/services";
import { ArrowRight, ArrowUp, ArrowUpRight, ChatIcon, FacebookIcon, InstagramIcon, MailIcon, PhoneIcon, ShieldIcon, WhatsAppIcon } from "./Icons";

export default function Footer() {
  const path = usePathname() || "/";
  const toTop = () => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });

  // the contact page is a single screen: the form and the details are the whole page
  if (path === "/contact") return null;

  return (
    <footer className="foot">
      <div className="wrap">
        <div className="f-grid">
          <div className="f-brand">
            <Link className="f-logo" href="/" aria-label={`${company.name} — home`}>
              <svg viewBox="0 0 44 44" aria-hidden="true">
                <circle cx="22" cy="22" r="20.5" fill="none" stroke="currentColor" strokeOpacity=".45" />
                <circle cx="22" cy="22" r="12" fill="none" stroke="currentColor" />
                <circle cx="22" cy="22" r="3.4" fill="#5fd4ff" />
                <path d="M22 1.5v6M42.5 22h-6" stroke="currentColor" strokeOpacity=".45" />
              </svg>
              <span>
                <span className="a">S TEC</span>
                <span className="b">SECURE</span>
              </span>
            </Link>
            <p className="f-desc">
              CCTV, access control, video door phones, burglar alarms and smart home automation — planned, installed and looked after as one system for homes,
              offices and commercial spaces.
            </p>
            <p className="f-tag">
              <ShieldIcon />
              {company.tagline}
            </p>
            <button className="f-top" type="button" onClick={toTop} aria-label="Back to top">
              <ArrowUp />
            </button>
            {/* phones: one line, two pills and the hours */}
            <div className="f-m">
              <p className="f-m-desc">Smart security and automation for homes, offices and commercial spaces.</p>
              <div className="f-m-acts">
                <a className="f-pill" href={company.phoneHref}>
                  <span className="ci">
                    <PhoneIcon />
                  </span>
                  {company.phone}
                </a>
                <a className="f-pill" href={`mailto:${company.email}`}>
                  <span className="ci">
                    <MailIcon />
                  </span>
                  Email us
                </a>
              </div>
              <p className="f-m-hours">
                <i aria-hidden="true" />
                Working hours · {company.hours}
              </p>
            </div>
          </div>

          <nav aria-label="Footer">
            <p className="f-h">Directory</p>
            <div className="f-dir">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} aria-current={path === n.href ? "page" : undefined}>
                  <ArrowRight />
                  {n.label}
                </Link>
              ))}
            </div>
          </nav>

          <div>
            <p className="f-h">Services</p>
            <div className="f-svc">
              {SYSTEM_LINKS.map((s) => (
                <Link key={s.label} href={s.href}>
                  {s.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="f-touch">
            <p className="f-h">Get in touch</p>
            <a className="f-row" href={`mailto:${company.email}`}>
              <span className="ci">
                <MailIcon />
              </span>
              <span>{company.email}</span>
            </a>
            <a className="f-row" href={company.phoneHref}>
              <span className="ci">
                <PhoneIcon />
              </span>
              <span>{company.phone}</span>
            </a>
            <a className="f-row" href={whatsappHref()} target="_blank" rel="noopener noreferrer">
              <span className="ci">
                <ChatIcon />
              </span>
              <span>Chat on WhatsApp</span>
            </a>
            <div className="f-social">
              <a href={company.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="S Tec Secure on Instagram">
                <InstagramIcon />
              </a>
              <a href={company.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="S Tec Secure on Facebook">
                <FacebookIcon />
              </a>
              <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" aria-label="Message S Tec Secure on WhatsApp">
                <WhatsAppIcon />
              </a>
            </div>
          </div>
        </div>

        <div className="f-base">
          <span>
            © {new Date().getFullYear()} {company.shortName}.<span className="f-rights"> All rights reserved.</span>
          </span>
          <div className="f-soc-m">
            <a href={company.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="S Tec Secure on Instagram">
              <InstagramIcon />
            </a>
            <a href={company.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="S Tec Secure on Facebook">
              <FacebookIcon />
            </a>
            <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" aria-label="Message S Tec Secure on WhatsApp">
              <WhatsAppIcon />
            </a>
          </div>
          <div className="links">
            <Link href="/contact#enquiry">
              Book a consultation
              <ArrowUpRight className="" />
            </Link>
            <button type="button" onClick={toTop}>
              Back to top
              <ArrowUp />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
