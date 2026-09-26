import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, ChatIcon, MailIcon, PhoneIcon, WhatsAppIcon } from "./Icons";
import FaqList from "./FaqList";
import { absolute, company, whatsappHref } from "@/content/company";
import type { Faq } from "@/content/faqs";

/* ---------- buttons ---------- */
type BtnProps = { href: string; children: ReactNode; solid?: boolean; icon?: "arrow" | "chat" | "phone"; className?: string };
export function Btn({ href, children, solid, icon = "arrow", className = "" }: BtnProps) {
  const web = /^https?:/.test(href);
  const plain = web || /^(tel|mailto):/.test(href);
  const cls = `btn mag${solid ? " solid" : ""}${className ? ` ${className}` : ""}`;
  const inner = (
    <span className="in">
      {children}
      {icon === "chat" ? <ChatIcon /> : icon === "phone" ? <PhoneIcon /> : <ArrowUpRight />}
    </span>
  );
  return plain ? (
    <a className={cls} href={href} {...(web ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {inner}
    </a>
  ) : (
    <Link className={cls} href={href}>
      {inner}
    </Link>
  );
}

export function WhatsAppBtn({ label = "WhatsApp us", solid, className }: { label?: string; solid?: boolean; className?: string }) {
  return (
    <Btn href={whatsappHref()} icon="chat" solid={solid} className={className}>
      {label}
    </Btn>
  );
}

export function TLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link className="tlink" href={href}>
      {children}
      <ArrowUpRight className="" />
    </Link>
  );
}

/** Call / WhatsApp / Email as three round-icon tiles (phones, menu and contact page). */
export function QuickActions({ className = "", values = false }: { className?: string; values?: boolean }) {
  return (
    <ul className={`qa${className ? ` ${className}` : ""}`} aria-label="Contact S Tec Secure">
      <li>
        <a href={company.phoneHref}>
          <span className="qa-ic">
            <PhoneIcon />
          </span>
          <span className="qa-l">Call</span>
          {values && <span className="qa-v">{company.phone}</span>}
        </a>
      </li>
      <li>
        <a href={whatsappHref()} target="_blank" rel="noopener noreferrer">
          <span className="qa-ic">
            <WhatsAppIcon />
          </span>
          <span className="qa-l">WhatsApp</span>
          {values && <span className="qa-v">Chat with us</span>}
        </a>
      </li>
      <li>
        <a href={`mailto:${company.email}`}>
          <span className="qa-ic">
            <MailIcon />
          </span>
          <span className="qa-l">Email</span>
          {values && <span className="qa-v">{company.email}</span>}
        </a>
      </li>
    </ul>
  );
}

/* ---------- display headings that rise line by line ---------- */
type HeadProps = { as?: "h1" | "h2" | "h3" | "p"; lines: ReactNode[]; dim?: number[]; id?: string; className?: string; focusable?: boolean };
export function Lines({ as = "h2", lines, dim = [lines.length - 1], id, className = "", focusable }: HeadProps) {
  const Tag = as;
  return (
    <Tag className={`display ${className}`} id={id} data-lines="" tabIndex={focusable ? -1 : undefined}>
      {lines.map((l, i) => (
        <span key={i} className={`l${dim.includes(i) ? " w45" : ""}`}>
          <span style={{ ["--i" as string]: i }}>{l}</span>
        </span>
      ))}
    </Tag>
  );
}

/** Section label with an optional running number: "01 — Vision & mission". */
export function Eyebrow({ n, children, className = "" }: { n?: string; children: ReactNode; className?: string }) {
  return (
    <p className={`eyebrow${className ? ` ${className}` : ""}`}>
      {n && <span className="pn">{n}</span>}
      {children}
    </p>
  );
}

/* ---------- structured data ---------- */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

/* ---------- inner page header with breadcrumbs ---------- */
type Crumb = { name: string; href: string };
export function Crumbs({ trail }: { trail: Crumb[] }) {
  return (
    <>
      <nav className="crumbs" aria-label="Breadcrumb">
        {trail.map((c, i) =>
          i < trail.length - 1 ? (
            <span key={c.href} style={{ display: "contents" }}>
              <Link href={c.href}>{c.name}</Link>
              <span aria-hidden="true">/</span>
            </span>
          ) : (
            <span key={c.href} aria-current="page">
              {c.name}
            </span>
          ),
        )}
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: trail.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: absolute(c.href) })),
        }}
      />
    </>
  );
}

type PageHeadProps = { trail: Crumb[]; lines: ReactNode[]; lede: ReactNode; tags?: string[]; id?: string };
export function PageHead({ trail, lines, lede, tags, id }: PageHeadProps) {
  return (
    <header className="page-head">
      <div className="wrap">
        <Crumbs trail={trail} />
        <Lines as="h1" lines={lines} id={id} focusable />
        <div className="ph-foot" data-reveal="">
          <p className="lede">{lede}</p>
          {tags && (
            <ul className="ph-tags" aria-label="Topics">
              {tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </header>
  );
}

/* ---------- closing call to action (each page writes its own lines) ---------- */
type CtaProps = { kicker: string; lines: [ReactNode, ReactNode]; lede: string; label?: string };
export function CtaBand({ kicker, lines, lede, label = "Book a consultation" }: CtaProps) {
  return (
    <section className="cta-band" aria-label={kicker}>
      <div className="wrap cta-in">
        <div>
          <p className="eyebrow">{kicker}</p>
          <Lines lines={lines} />
        </div>
        <div className="cta-side" data-reveal="">
          <p className="lede">{lede}</p>
          <div className="btn-row">
            <Btn href="/contact#enquiry" solid>
              {label}
            </Btn>
            <WhatsAppBtn className="cta-wa" />
          </div>
          <QuickActions className="cta-acts" />
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQ: question cards, a help panel, and FAQPage schema ---------- */
type FaqHelp = { kicker: string; title: string; text: string };
type FaqProps = { id: string; kicker: string; lines: [ReactNode, ReactNode]; lede: string; items: Faq[]; help: FaqHelp; alt?: boolean };
export function FaqSection({ id, kicker, lines, lede, items, help, alt }: FaqProps) {
  return (
    <section className={`sec faq${alt ? " alt" : ""}`} id={id} aria-labelledby={`${id}-h`}>
      <div className="wrap">
        <div className="sec-top">
          <div>
            <p className="eyebrow">{kicker}</p>
            <Lines lines={lines} id={`${id}-h`} />
          </div>
          <p className="lede" data-reveal="">
            {lede}
          </p>
        </div>
        <div className="faq-body">
          <FaqList items={items} id={id} />
          <aside className="faq-help" data-reveal="" aria-label={help.kicker}>
            <span className="faq-help-ic" aria-hidden="true">
              <ChatIcon />
            </span>
            <p className="eyebrow">{help.kicker}</p>
            <p className="faq-help-t">{help.title}</p>
            <p className="faq-help-d">{help.text}</p>
            <div className="faq-help-btns">
              <WhatsAppBtn solid label="Ask on WhatsApp" />
              <Btn href={company.phoneHref} icon="phone">
                {`Call ${company.phone}`}
              </Btn>
            </div>
          </aside>
        </div>
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
    </section>
  );
}
