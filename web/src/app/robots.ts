import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

// Private pages stay out of search. The posting board's address is secret, so it's never listed here
// (it sends noindex itself and is a 404 for everyone else).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/account", "/dashboard", "/creator", "/join", "/payments", "/discord", "/auth", "/api", "/design-system", "/email-preview"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
