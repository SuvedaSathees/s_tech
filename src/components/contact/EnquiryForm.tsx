"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { whatsappHref } from "@/content/company";
import { SYSTEM_LINKS } from "@/content/services";
import { ArrowUpRight, ChatIcon } from "@/components/site/Icons";

const SPACES = ["Home / Villa", "Apartment", "Office", "Shop / Showroom", "Commercial building", "New construction"];
const SYSTEMS = [...SYSTEM_LINKS.map((s) => s.label as string), "Boom Barriers", "Intercom Systems", "Nurse Calling Systems", "Not sure yet"];

/**
 * Consultation request in three short steps. "Send enquiry" posts to /api/contact
 * (forwarded to CONTACT_WEBHOOK_URL when it is set); "Send on WhatsApp" opens a chat
 * with every detail already written. If the post can't be delivered, WhatsApp is offered.
 */
export default function EnquiryForm() {
  const [space, setSpace] = useState(SPACES[0]);
  const [systems, setSystems] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "whatsapp">("idle");

  // "Ask about this" on a product arrives here with that system already ticked
  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get("system");
    if (s && SYSTEMS.includes(s)) setSystems((x) => (x.includes(s) ? x : [...x, s]));
  }, []);

  const toggle = (s: string) => setSystems((x) => (x.includes(s) ? x.filter((y) => y !== s) : [...x, s]));

  const waLink = useMemo(
    () =>
      whatsappHref(
        [
          "Enquiry — S Tec Secure",
          name && `Name: ${name}`,
          phone && `Phone: ${phone}`,
          area && `Area: ${area}`,
          `Space: ${space}`,
          systems.length ? `Interested in: ${systems.join(", ")}` : "",
          message && `Notes: ${message}`,
        ]
          .filter(Boolean)
          .join("\n"),
      ),
    [name, phone, area, space, systems, message],
  );

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState("sending");
    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), property: space, interests: systems, message: [area && `Area: ${area}`, message].filter(Boolean).join("\n") }),
      });
      setState(r.ok ? "sent" : "whatsapp");
    } catch {
      setState("whatsapp");
    }
  };

  return (
    <form id="enquiry" className="enquiry" aria-labelledby="enq-h" onSubmit={submit}>
      <div className="enq-head">
        <h2 id="enq-h">Tell us about your space.</h2>
        <p>Takes under a minute. Fields marked * are required.</p>
      </div>

      <fieldset>
        <legend>
          <span className="st">1</span>Your space
        </legend>
        <div className="opts">
          {SPACES.map((s) => (
            <button key={s} type="button" className="opt space" aria-pressed={space === s} onClick={() => setSpace(s)}>
              {s}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>
          <span className="st">2</span>What you need
        </legend>
        <div className="opts">
          {SYSTEMS.map((s) => (
            <button key={s} type="button" className="opt sys" aria-pressed={systems.includes(s)} onClick={() => toggle(s)}>
              {s}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="fields">
        <legend>
          <span className="st">3</span>Your details
        </legend>
        <label className="field">
          <input name="name" type="text" autoComplete="name" placeholder=" " required value={name} onChange={(e) => setName(e.target.value)} />
          <span>Full name *</span>
        </label>
        <label className="field">
          <input name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder=" " required value={phone} onChange={(e) => setPhone(e.target.value)} />
          <span>Phone *</span>
        </label>
        <label className="field f-area">
          <input name="area" type="text" autoComplete="address-level2" placeholder=" " value={area} onChange={(e) => setArea(e.target.value)} />
          <span>Area or city</span>
        </label>
        <label className="field full">
          <textarea name="message" rows={2} placeholder=" " value={message} onChange={(e) => setMessage(e.target.value)} />
          <span>Anything we should know?</span>
        </label>
      </fieldset>

      <div className="submit-row">
        <button className="submit" type="submit" disabled={state === "sending"}>
          {state === "sending" ? "Sending…" : "Send enquiry"}
          <ArrowUpRight className="" />
        </button>
        <a className="submit wa" href={waLink} target="_blank" rel="noopener noreferrer">
          Send on WhatsApp
          <ChatIcon />
        </a>
      </div>
      <p className="enq-note">We only use your details to reply to this enquiry.</p>

      {state === "sent" && (
        <div className="ready" role="status">
          <p>Thank you — your enquiry has reached our team. We’ll get back to you on the number you gave.</p>
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
