"use client";

import { useState, type FormEvent } from "react";
import { MessageCircle, Phone, Mail, MapPin, ArrowUpRight } from "lucide-react";
import { site, services, whatsappLink } from "@/config/site";
import { MaskText, Reveal } from "@/components/ui/Reveal";
import MagneticButton from "@/components/ui/MagneticButton";

const SPACES = ["Home / Villa", "Apartment", "Office", "Commercial", "New project"];

export default function Contact() {
  const [space, setSpace] = useState<string>(SPACES[0]);
  const [systems, setSystems] = useState<string[]>([]);
  const [sent, setSent] = useState(false);
  const wa = whatsappLink();
  const c = site.contact;

  const toggle = (s: string) => setSystems((x) => (x.includes(s) ? x.filter((y) => y !== s) : [...x, s]));

  /** No backend required: composes the enquiry into WhatsApp or email. Swap for an API route if preferred. */
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const text = [
      `Enquiry — ${site.shortName}`,
      `Name: ${f.get("name")}`,
      `Phone: ${f.get("phone")}`,
      `Space: ${space}`,
      systems.length ? `Interested in: ${systems.join(", ")}` : "",
      f.get("message") ? `Notes: ${f.get("message")}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    if (c.whatsapp) window.open(whatsappLink(text), "_blank", "noopener");
    else if (c.email) window.location.href = `mailto:${c.email}?subject=${encodeURIComponent("Consultation request")}&body=${encodeURIComponent(text)}`;
    setSent(true);
  };

  const details = [
    c.phone && { icon: Phone, label: "Phone", value: c.phone, href: `tel:${c.phone.replace(/\s/g, "")}` },
    c.email && { icon: Mail, label: "Email", value: c.email, href: `mailto:${c.email}` },
    c.whatsapp && { icon: MessageCircle, label: "WhatsApp", value: "Chat with us", href: wa },
    c.address && { icon: MapPin, label: "Location", value: c.address, href: c.mapUrl || undefined },
  ].filter(Boolean) as { icon: typeof Phone; label: string; value: string; href?: string }[];

  return (
    <section id="contact" className="relative overflow-hidden border-t border-line bg-ink py-20 md:py-44">
      {/* horizon light */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[70%]"
        style={{ background: "radial-gradient(50% 60% at 50% 0%, rgba(95,212,255,.07), transparent 70%)" }}
      />
      <div className="relative mx-auto max-w-[1680px] px-5 md:px-10">
        <div className="eyebrow mb-8">Contact</div>
        <MaskText as="h2" lines={["Let’s secure", <span key="b" className="text-white/45">your space.</span>]} className="display text-[clamp(40px,9vw,172px)] text-white" />

        <div className="mt-10 grid grid-cols-1 gap-14 md:mt-16 md:gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
          <Reveal>
            <p className="max-w-[440px] text-[17px] font-light leading-relaxed text-white/85 md:text-[18px]">
              Tell us about your home, office, commercial property or project.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4">
              <MagneticButton href="#enquiry" variant="solid" className="justify-center">
                Book a consultation
              </MagneticButton>
              {wa && (
                <MagneticButton href={wa} external className="justify-center" icon={<MessageCircle className="h-4 w-4" strokeWidth={1.4} />}>
                  Chat on WhatsApp
                </MagneticButton>
              )}
            </div>

            {details.length > 0 && (
              <dl className="mt-12 border-t border-line md:mt-16">
                {details.map((d) => (
                  <div key={d.label} className="group flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-line py-4 md:py-5">
                    <dt className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.2em] text-dim">
                      <d.icon className="h-4 w-4" strokeWidth={1.3} /> {d.label}
                    </dt>
                    <dd className="min-w-0 break-words text-right text-[15px] text-white/85">
                      {d.href ? (
                        <a href={d.href} className="inline-flex items-center gap-2 transition-colors hover:text-white" target={d.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                          {d.value}
                          <ArrowUpRight className="h-3.5 w-3.5 opacity-40 transition-all group-hover:rotate-45 group-hover:opacity-100" strokeWidth={1.4} />
                        </a>
                      ) : (
                        d.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </Reveal>

          <Reveal delay={0.1}>
            <form id="enquiry" onSubmit={submit} className="scroll-mt-32 border-t border-line pt-8" aria-label="Consultation request">
              <fieldset>
                <legend className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim">01 — Your space</legend>
                <div className="mt-5 flex flex-wrap gap-2">
                  {SPACES.map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setSpace(s)}
                      aria-pressed={space === s}
                      className={`min-h-[44px] border px-4 py-2.5 text-[13px] transition-all duration-500 ${
                        space === s ? "border-white bg-white text-ink" : "border-line-2 text-mist hover:border-white/40 hover:text-white"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="mt-10">
                <legend className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim">02 — Systems of interest</legend>
                <div className="mt-5 flex flex-wrap gap-2">
                  {services.map((s) => (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => toggle(s.title)}
                      aria-pressed={systems.includes(s.title)}
                      className={`min-h-[44px] border px-4 py-2.5 text-[13px] transition-all duration-500 ${
                        systems.includes(s.title) ? "border-accent/70 bg-accent/10 text-white" : "border-line-2 text-mist hover:border-white/40 hover:text-white"
                      }`}
                    >
                      {s.title}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="mt-10 grid grid-cols-1 gap-x-8 md:grid-cols-2">
                <legend className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-dim">03 — Your details</legend>
                {[
                  { n: "name", l: "Name", t: "text", ac: "name" },
                  { n: "phone", l: "Phone", t: "tel", ac: "tel" },
                ].map((f) => (
                  <label key={f.n} className="group relative mt-4 block">
                    <input
                      required
                      name={f.n}
                      type={f.t}
                      autoComplete={f.ac}
                      placeholder=" "
                      className="peer w-full border-b border-line-2 bg-transparent pb-3 pt-6 text-[16px] text-white outline-none transition-colors focus:border-white"
                    />
                    <span className="pointer-events-none absolute left-0 top-6 text-[15px] text-dim transition-all duration-300 peer-focus:top-0 peer-focus:text-[11px] peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[11px]">
                      {f.l}
                    </span>
                  </label>
                ))}
                <label className="relative mt-4 block md:col-span-2">
                  <textarea
                    name="message"
                    rows={3}
                    placeholder=" "
                    className="peer w-full resize-none border-b border-line-2 bg-transparent pb-3 pt-6 text-[16px] text-white outline-none transition-colors focus:border-white"
                  />
                  <span className="pointer-events-none absolute left-0 top-6 text-[15px] text-dim transition-all duration-300 peer-focus:top-0 peer-focus:text-[11px] peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[11px]">
                    Anything we should know? (optional)
                  </span>
                </label>
              </fieldset>

              <div className="mt-10 flex flex-col items-stretch gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-6">
                <button
                  type="submit"
                  className="group inline-flex items-center justify-center gap-4 bg-soft px-7 py-4 text-[12px] font-medium uppercase tracking-[0.2em] text-ink transition-colors hover:bg-white"
                >
                  {sent ? "Thank you — we’ll be in touch" : "Request consultation"}
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" strokeWidth={1.4} />
                </button>
                <span className="text-[12px] text-dim">Sent directly to our team{c.whatsapp ? " on WhatsApp" : c.email ? " by email" : ""}.</span>
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
