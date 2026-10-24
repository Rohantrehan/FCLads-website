import type { MetadataRoute } from "next";
import { legalDocs } from "@/data/legal";
import { getContent } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";

// Every public page, with guides, collections and creators from the posting board. Rebuilt hourly so
// new guides reach search engines without a deploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { guides, collections, creators, now } = await getContent();
  const newest = guides[0]?.publishedAt ?? now;
  const page = (path: string, lastModified: string, changeFrequency: "daily" | "weekly" | "monthly", priority: number) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency,
    priority,
  });

  return [
    page("/", newest, "daily", 1),
    page("/lads-plus", now, "weekly", 0.9),
    page("/learn", newest, "daily", 0.9),
    page("/trading", now, "daily", 0.8),
    page("/feed", now, "daily", 0.8),
    page("/learn/collections", now, "weekly", 0.7),
    page("/creators", now, "weekly", 0.6),
    ...guides.map((guide) => page(`/guides/${guide.slug}`, guide.publishedAt, "weekly", 0.8)),
    ...collections.map((collection) => page(`/learn/collections/${collection.slug}`, now, "weekly", 0.6)),
    ...creators.map((creator) => page(`/creators/${creator.slug}`, now, "weekly", 0.5)),
    ...legalDocs.map((doc) => page(`/legal/${doc.slug}`, now, "monthly", 0.2)),
  ];
}
