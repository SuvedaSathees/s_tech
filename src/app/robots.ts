import type { MetadataRoute } from "next";
import { absolute } from "@/content/company";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/v2", "/studio"] }],
    sitemap: absolute("/sitemap.xml"),
  };
}
