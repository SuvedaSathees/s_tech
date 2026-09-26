import type { Metadata } from "next";
import PostCard from "@/components/blog/PostCard";
import { CtaBand, JsonLd, PageHead } from "@/components/site/ui";
import { POSTS, PUBLISHED } from "@/content/posts";
import { absolute, company, og } from "@/content/company";

export const metadata: Metadata = {
  title: "Security & Home Automation Guides",
  description:
    "Plain-language guides on CCTV coverage, access control, burglar alarms, video door phones, home automation scenes and planning security while you build.",
  alternates: { canonical: "/blog" },
  openGraph: og("/blog", 'Security & Home Automation Guides', 'Plain-language guides on CCTV coverage, access control, burglar alarms, video door phones, home automation scenes and planning security while you build.'),
};

export default function BlogPage() {
  const cats = Array.from(new Set(POSTS.map((p) => p.cat)));
  return (
    <>
      <PageHead
        trail={[
          { name: "Home", href: "/" },
          { name: "Blog", href: "/blog" },
        ]}
        lines={["Guides for a safer,", "smarter space."]}
        lede="Practical notes on cameras, access, alarms and automation — what to plan, what to ask for, and what to avoid."
        tags={cats}
        id="blog-h"
      />
      <section className="blog-list" aria-label="Articles">
        <div className="wrap">
          <div className="post-grid">
            {POSTS.map((p, i) => (
              <PostCard key={p.slug} p={p} n={i + 1} delay={(i % 3) * 90} />
            ))}
          </div>
        </div>
      </section>
      <CtaBand
        kicker="Ask us"
        lines={["A question we", "haven’t covered?"]}
        lede="Send it over on WhatsApp — we’re happy to explain before you decide anything."
        label="Ask a question"
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "S Tec Secure guides",
          url: absolute("/blog"),
          publisher: { "@type": "Organization", name: company.shortName, url: company.url },
          blogPost: POSTS.map((p) => ({ "@type": "BlogPosting", headline: p.title, url: absolute(`/blog/${p.slug}`), datePublished: PUBLISHED })),
        }}
      />
    </>
  );
}
