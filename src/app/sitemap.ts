import type { MetadataRoute } from "next";
import { absolute } from "@/content/company";
import { POSTS, PUBLISHED } from "@/content/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: [string, number][] = [
    ["/", 1],
    ["/services", 0.9],
    ["/products", 0.8],
    ["/about", 0.7],
    ["/contact", 0.7],
    ["/blog", 0.6],
  ];
  return [
    ...pages.map(([p, priority]) => ({ url: absolute(p), lastModified: PUBLISHED, changeFrequency: "monthly" as const, priority })),
    ...POSTS.map((p) => ({ url: absolute(`/blog/${p.slug}`), lastModified: PUBLISHED, changeFrequency: "yearly" as const, priority: 0.5 })),
  ];
}
