import type { GuideCategory } from "@/types";

export interface LearnState {
  category?: GuideCategory;
  q?: string;
  limit?: number;
}

/** Builds a /learn URL from filter state. Empty values are left out so URLs stay clean. */
export function learnHref({ category, q, limit }: LearnState) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (q?.trim()) params.set("q", q.trim());
  if (limit) params.set("limit", String(limit));
  const query = params.toString();
  return query ? `/learn?${query}` : "/learn";
}
