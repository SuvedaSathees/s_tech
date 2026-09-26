"use client";
import { useState } from "react";
import { site, solutions, whatsappLink } from "@/config/site";
import Reveal from "../ui/Reveal";
import Arrow from "../ui/Arrow";
import SocialIcon from "../ui/SocialIcon";

type Status = { kind: "idle" | "sending" | "ok" | "fallback" | "error"; message?: string };

const propertyTypes = ["Villa / Private residence", "Apartment", "Office", "Retail / Showroom", "Hospitality", "Industrial / Warehouse", "Other"];

export default function Contact() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const c = site.contact;
  const socials = Object.entries(site.social).filter(([, v]) => v) as [keyof typeof site.social, string][];

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (fd.get("company")) return; // honeypot
    const data = {
      name: String(fd.get("name") || ""),
      phone: String(fd.get("phone") || ""),
      email: String(fd.get("email") || ""),
      property: String(fd.get("property") || ""),
      interests: fd.getAll("interests").map(String),
      message: String(fd.get("message") || ""),
    };
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (res.ok) {
        form.reset();
        setStatus({ kind: "ok", message: "Thank you — we'll be in touch shortly to arrange your consultation." });
        return;
      }
      if (res.status !== 501) throw new Error(String(res.status));
    } catch {
      /* fall through to direct channels */
    }
    // No webhook configured: hand off to WhatsApp or email, pre-filled.
    const text = `Hello S TEC SECURE,\n\nName: ${data.name}\nPhone: ${data.phone}\nEmail: ${data.email}\nProperty: ${data.property}\nInterested in: ${data.interests.join(", ")}\n\n${data.message}`;
    const wa = whatsappLink(text);
    if (wa) {
      window.open(wa, "_blank", "noopener");
      setStatus({ kind: "fallback", message: "We've opened WhatsApp with your details — just press send." });
    } else if (c.email) {
      window.location.href = `mailto:${c.email}?subject=${encodeURIComponent("Consultation request")}&body=${encodeURIComponent(text)}`;
      setStatus({ kind: "fallback", message: "Your email app has opened with your details — just press send." });
    } else {
      setStatus({ kind: "error", message: "Online enquiries are being set up. Please message us on Instagram or Facebook in the meantime." });
    }
  }

  return (
    <Reveal as="section" id="contact" className="section contact">
      <div className="container contact__grid">
        <div>
          <span className="eyebrow" data-reveal>
            Contact
          </span>
          <h2 className="display" data-reveal data-delay="0.1" style={{ marginTop: 28 }}>
            Let&apos;s secure
            <br />
            your <em>space</em>.
          </h2>
          <p className="lede" data-reveal data-delay="0.2" style={{ marginTop: 32 }}>
            Tell us about your property. We&apos;ll arrange a site consultation and design a system around it — no
            obligation.
          </p>

          <div className="contact__direct" data-reveal data-delay="0.25">
            {c.phone && (
              <a href={`tel:${c.phone.replace(/\s/g, "")}`}>
                <span>Call</span>
                <strong>{c.phone}</strong>
              </a>
            )}
            {c.whatsapp && (
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                <span>WhatsApp</span>
                <strong>Message us</strong>
              </a>
            )}
            {c.email && (
              <a href={`mailto:${c.email}`}>
                <span>Email</span>
                <strong>{c.email}</strong>
              </a>
            )}
            {c.address && (
              <p>
                <span>Studio</span>
                <strong>{c.address}</strong>
              </p>
            )}
            {c.hours && (
              <p>
                <span>Hours</span>
                <strong>{c.hours}</strong>
              </p>
            )}
          </div>

          {socials.length > 0 && (
            <div className="socials" data-reveal data-delay="0.3">
              {socials.map(([k, v]) => (
                <a key={k} href={v} target="_blank" rel="noopener noreferrer">
                  <SocialIcon name={k} />
                  {k}
                </a>
              ))}
            </div>
          )}
        </div>

        <form className="form" onSubmit={onSubmit} data-reveal data-delay="0.15" noValidate={false}>
          <div className="field">
            <label htmlFor="f-name">Name</label>
            <input id="f-name" name="name" required autoComplete="name" placeholder="Your full name" />
          </div>
          <div className="field">
            <label htmlFor="f-phone">Phone</label>
            <input id="f-phone" name="phone" type="tel" required autoComplete="tel" placeholder="+91" />
          </div>
          <div className="field">
            <label htmlFor="f-email">Email</label>
            <input id="f-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" />
          </div>
          <div className="field">
            <label htmlFor="f-property">Property</label>
            <select id="f-property" name="property" defaultValue="">
              <option value="" disabled>
                Select type
              </option>
              {propertyTypes.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <fieldset className="field field--full">
            <legend>Interested in</legend>
            <div className="checks">
              {solutions.map((s) => (
                <label className="check" key={s.id}>
                  <input type="checkbox" name="interests" value={s.title} />
                  <span>{s.title}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="field field--full">
            <label htmlFor="f-msg">Message</label>
            <textarea id="f-msg" name="message" placeholder="Location, size of the property, timelines…" />
          </div>
          <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px" }} />
          {status.message && (
            <p className={`form__status ${status.kind === "ok" || status.kind === "fallback" ? "form__status--ok" : ""}`} role="status">
              {status.message}
            </p>
          )}
          <div className="form__foot">
            <p className="form__note">We only use your details to respond to this enquiry.</p>
            <button className="btn btn--gold" type="submit" disabled={status.kind === "sending"}>
              {status.kind === "sending" ? "Sending…" : "Request consultation"} <Arrow />
            </button>
          </div>
        </form>
      </div>
    </Reveal>
  );
}
