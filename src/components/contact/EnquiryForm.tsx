"use client";

import { useEffect, useState, type FormEvent } from "react";
import { whatsappHref } from "@/content/company";
import { SYSTEM_LINKS } from "@/content/services";
import { ArrowUpRight, ChatIcon } from "@/components/site/Icons";

const SPACES = ["Home / Villa", "Apartment", "Office", "Commercial", "New project"];
const SYSTEMS = SYSTEM_LINKS.map((s) => s.label as string);

/**
 * Consultation request. Posts to /api/contact (which forwards to CONTACT_WEBHOOK_URL
 * when it is set). If no webhook is configured, the enquiry is handed to WhatsApp
 * with every detail already written.
 */
export default function EnquiryForm() {
  const [space, setSpace] = useState(SPACES[0]);
  const [systems, setSystems] = useState<string[]>([]);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "whatsapp">("idle");
  const [waLink, setWaLink] = useState("");

  // "Ask about this" on a product arrives here with that system already ticked
  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get("system");
    if (s && SYSTEMS.includes(s)) setSystems((x) => (x.includes(s) ? x : [...x, s]));
  }, []);

  const toggle = (s: string) => setSystems((x) => (x.includes(s) ? x.filter((y) => y !== s) : [...x, s]));

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") || "").trim();
    const phone = String(f.get("phone") || "").trim();
    const message = String(f.get("message") || "").trim();
    const text = [
      "Enquiry — S Tec Secure",
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Space: ${space}`,
      systems.length ? `Interested in: ${systems.join(", ")}` : "",
      message ? `Notes: ${message}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    setWaLink(whatsappHref(text));
    setState("sending");
    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, property: space, interests: systems, message }),
      });
      setState(r.ok ? "sent" : "whatsapp");
    } catch {
      setState("whatsapp");
    }
  };

  return (
    <form id="enquiry" className="enquiry" aria-label="Consultation request" onSubmit={submit}>
      <fieldset>
        <legend>01 — Your space</legend>
        <div className="opts">
          {SPACES.map((s) => (
            <button key={s} type="button" className="opt space" aria-pressed={space === s} onClick={() => setSpace(s)}>
              {s}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>02 — Systems of interest</legend>
        <div className="opts">
          {SYSTEMS.map((s) => (
            <button key={s} type="button" className="opt sys" aria-pressed={systems.includes(s)} onClick={() => toggle(s)}>
              {s}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="fields">
        <legend>03 — Your details</legend>
        <label className="field">
          <input name="name" type="text" autoComplete="name" placeholder=" " required />
          <span>Name</span>
        </label>
        <label className="field">
          <input name="phone" type="tel" autoComplete="tel" placeholder=" " required />
          <span>Phone</span>
        </label>
        <label className="field full">
          <textarea name="message" rows={3} placeholder=" " />
          <span>Anything we should know? (optional)</span>
        </label>
      </fieldset>
      <div className="submit-row">
        <button className="submit" type="submit" disabled={state === "sending"}>
          {state === "sending" ? "Sending…" : "Request consultation"}
          <ArrowUpRight className="" />
        </button>
        <small>We reply by phone or WhatsApp.</small>
      </div>
      {state === "sent" && (
        <div className="ready" role="status">
          <p>Thank you — your request has reached our team. We’ll call you back on the number you gave.</p>
        </div>
      )}
      {state === "whatsapp" && (
        <div className="ready" role="status">
          <p>Your enquiry is ready. Tap below to send it to our team on WhatsApp.</p>
          <a className="btn solid" href={waLink} target="_blank" rel="noopener noreferrer">
            <span className="in">
              Send on WhatsApp
              <ChatIcon />
            </span>
          </a>
        </div>
      )}
    </form>
  );
}
