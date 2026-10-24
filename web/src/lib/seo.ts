import type { Metadata } from "next";

// Search engine basics shared by the root layout, sitemap, robots and the pages' structured data.
// One English site for every country (UK, US, Canada, Australia, Ireland...): no per-country copies.

/** The live address. Local builds use localhost so links in dev point at dev. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://fclads.com").replace(/\/$/, "");

export const SITE_NAME = "FC Lads";

/** Absolute address of a path on the site, e.g. "/learn" → "https://fclads.com/learn". */
export const absoluteUrl = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/**
 * A page's title, description, canonical address and share details in one go. A page's openGraph
 * replaces the layout's whole, so the site name, locale and the site's share picture are repeated
 * here. Pages with their own opengraph-image file (guides) pass ownImage, or this picture replaces it.
 */
export function pageMeta({
  title,
  description,
  path,
  type = "website",
  publishedTime,
  ownImage = false,
}: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  ownImage?: boolean;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      title,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: "en_US",
      alternateLocale: ["en_GB"],
      ...(ownImage ? {} : { images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "FC Lads" }] }),
      ...(type === "article" && publishedTime ? { publishedTime } : {}),
    },
  } as Metadata;
}

/** Who publishes the site, used as the publisher in Article data. */
export const organization = {
  "@type": "Organization",
  "@id": absoluteUrl("/#organization"),
  name: SITE_NAME,
  url: SITE_URL,
  logo: absoluteUrl("/icon.png"),
};

/** Breadcrumb trail for Google results: [["Learn", "/learn"], ["Tactics", "/learn?category=tactics"], ...]. */
export function breadcrumbs(trail: [name: string, path: string][]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map(([name, path], index) => ({
      "@type": "ListItem",
      position: index + 1,
      name,
      item: absoluteUrl(path),
    })),
  };
}

/** One JSON-LD script body; `<` is escaped so text from the board can't close the script tag. */
export function jsonLd(...items: object[]) {
  const graph = items.length === 1 ? { "@context": "https://schema.org", ...items[0] } : { "@context": "https://schema.org", "@graph": items };
  return { __html: JSON.stringify(graph).replace(/</g, "\\u003c") };
}
