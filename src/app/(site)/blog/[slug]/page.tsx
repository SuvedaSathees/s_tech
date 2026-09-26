import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import PostCard from "@/components/blog/PostCard";
import PostToc, { type TocItem } from "@/components/blog/PostToc";
import { Btn, Crumbs, JsonLd } from "@/components/site/ui";
import { ArrowLeft, ArrowUpRight } from "@/components/site/Icons";
import { POSTS, PUBLISHED, postBySlug } from "@/content/posts";
import { OG_IMAGE, absolute, company, whatsappHref } from "@/content/company";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = postBySlug(slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.lede,
    alternates: { canonical: `/blog/${p.slug}` },
    openGraph: {
      type: "article",
      siteName: company.name,
      locale: "en_IN",
      title: p.title,
      description: p.lede,
      url: `/blog/${p.slug}`,
      publishedTime: PUBLISHED,
      images: [{ url: p.img, alt: p.alt }, OG_IMAGE],
    },
  };
}

/** A next step written for each guide, so no two articles end on the same words. */
const HELP: Record<string, string> = {
  cctv: "Planning cameras for your own property? Send a few photos of the gate and entrances and we’ll suggest where each one should go.",
  doorphone: "Weighing a door phone against a gate camera for your entrance? Describe it to us and we’ll recommend the right pairing.",
  access: "Choosing readers for your office? Tell us how many doors and people you have, and we’ll suggest the right mix.",
  automation: "Want scenes like these at home? List the rooms and devices you’d like to control, and we’ll show you how they fit together.",
  alarm: "Thinking about an alarm? Tell us about your doors, windows and rooms, and we’ll plan the zones with you.",
  plan: "Building or renovating? Share your drawings early and we’ll mark the points for cables, cameras and panels.",
};

/** Gives every section heading an id and returns the list for "In this guide". */
function outline(html: string) {
  const toc: TocItem[] = [];
  const plain = (s: string) => s.replace(/<[^>]+>/g, "").trim();
  const slug = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  const out = html.replace(/<h2>([\s\S]*?)<\/h2>/g, (_m, inner: string) => {
    const text = plain(inner);
    let id = slug(text) || `section-${toc.length + 1}`;
    if (toc.some((x) => x.id === id)) id = `${id}-${toc.length + 1}`;
    toc.push({ id, t: text.replace(/^\d+\.\s*/, "") });
    return `<h2 id="${id}">${inner}</h2>`;
  });
  return { html: out, toc };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const p = postBySlug(slug);
  if (!p) notFound();
  const i = POSTS.indexOf(p);
  const more = [1, 2, 3].map((k) => POSTS[(i + k) % POSTS.length]);
  const { html, toc } = outline(p.body);

  return (
    <article className="post-view" aria-labelledby="post-h">
      <div className="wrap">
        <header className="post-head">
          <Crumbs
            trail={[
              { name: "Home", href: "/" },
              { name: "Blog", href: "/blog" },
              { name: p.cat, href: `/blog/${p.slug}` },
            ]}
          />
          <Link className="back" href="/blog">
            <ArrowLeft />
            All articles
          </Link>
          <p className="eyebrow post-meta">
            <span className="cat">{p.cat}</span>
            <span>{p.read} min read</span>
          </p>
          <h1 className="display" id="post-h" tabIndex={-1}>
            {p.title}
          </h1>
          <p className="post-lede">{p.lede}</p>
        </header>

        <figure className="post-cover">
          <Image src={p.img} alt={p.alt} fill priority sizes="(min-width: 1280px) 1200px, 100vw" />
        </figure>

        <div className="post-layout">
          <div className="post-body" dangerouslySetInnerHTML={{ __html: html }} />
          <aside className="post-side" aria-label="About this guide">
            <PostToc items={toc} />
            <div className="post-help">
              <p className="eyebrow">Your space</p>
              <p>{HELP[p.ic] ?? HELP.plan}</p>
              <Btn href="/contact#enquiry" solid>
                Book a consultation
              </Btn>
              <a className="tlink" href={whatsappHref(`Hello S Tec Secure, I read “${p.title}” and have a question.`)} target="_blank" rel="noopener noreferrer">
                Ask on WhatsApp
                <ArrowUpRight className="" />
              </a>
            </div>
          </aside>
        </div>

        <aside className="post-more" aria-label="Keep reading">
          <p className="eyebrow">Keep reading</p>
          <div className="post-grid">
            {more.map((m, k) => (
              <PostCard key={m.slug} p={m} n={POSTS.indexOf(m) + 1} delay={k * 90} />
            ))}
          </div>
        </aside>
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: p.title,
          description: p.lede,
          articleSection: p.cat,
          datePublished: PUBLISHED,
          mainEntityOfPage: absolute(`/blog/${p.slug}`),
          image: absolute(p.img),
          author: { "@type": "Organization", name: company.shortName, url: company.url },
          publisher: { "@type": "Organization", name: company.shortName, url: company.url },
        }}
      />
    </article>
  );
}
