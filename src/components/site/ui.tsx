import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, ChatIcon } from "./Icons";
import { absolute, whatsappHref } from "@/content/company";
import type { Faq } from "@/content/faqs";

/* ---------- buttons ---------- */
type BtnProps = { href: string; children: ReactNode; solid?: boolean; icon?: "arrow" | "chat"; className?: string };
export function Btn({ href, children, solid, icon = "arrow", className = "" }: BtnProps) {
  const external = /^https?:/.test(href);
  const cls = `btn mag${solid ? " solid" : ""}${className ? ` ${className}` : ""}`;
  const inner = (
    <span className="in">
      {children}
      {icon === "chat" ? <ChatIcon /> : <ArrowUpRight />}
    </span>
  );
  return external ? (
    <a className={cls} href={href} target="_blank" rel="noopener noreferrer">
      {inner}
    </a>
  ) : (
    <Link className={cls} href={href}>
      {inner}
    </Link>
  );
}

export function WhatsAppBtn({ label = "WhatsApp us", solid }: { label?: string; solid?: boolean }) {
  return (
    <Btn href={whatsappHref()} icon="chat" solid={solid}>
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
            <WhatsAppBtn />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQ with FAQPage schema ---------- */
type FaqProps = { id: string; kicker: string; lines: [ReactNode, ReactNode]; lede: string; items: Faq[]; alt?: boolean };
export function FaqSection({ id, kicker, lines, lede, items, alt }: FaqProps) {
  return (
    <section className={`sec${alt ? " alt" : ""}`} id={id} aria-labelledby={`${id}-h`}>
      <div className="wrap faq-grid">
        <div className="faq-side">
          <p className="eyebrow">{kicker}</p>
          <Lines lines={lines} id={`${id}-h`} />
          <p className="lede" data-reveal="">
            {lede}
          </p>
        </div>
        <div className="faq-list" data-reveal="">
          {items.map((f, i) => (
            <details className="faq-item" key={f.q} open={i === 0}>
              <summary>
                <span className="q-no">{String(i + 1).padStart(2, "0")}</span>
                <span className="q-t">{f.q}</span>
                <span className="q-i" aria-hidden="true" />
              </summary>
              <div className="faq-a">
                <p>
                  {f.a}
                  {f.link && (
                    <>
                      {" "}
                      <Link href={f.link.href}>{f.link.label}</Link>
                    </>
                  )}
                </p>
              </div>
            </details>
          ))}
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
