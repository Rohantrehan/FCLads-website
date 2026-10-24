import { getContent } from "@/lib/content";
import { categoryLabels } from "@/lib/format";
import { shareImage, shareImageSize } from "@/lib/shareImage";

export const alt = "FC Lads guide";
export const size = shareImageSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const content = await getContent();
  const guide = content.getGuide((await params).slug);
  const author = guide && content.getCreator(guide.authorSlug);
  return shareImage({
    label: guide ? `${categoryLabels[guide.category]} guide · ${content.settings.currentSeason}` : "Guide",
    title: guide?.title ?? "FC Lads guides",
    footer: author ? `By ${author.name} · fclads.com` : "fclads.com",
  });
}
