import { getContent } from "@/lib/content";
import { shareImage, shareImageSize } from "@/lib/shareImage";

export const alt = "FC Lads: EA SPORTS FC guides, trading and gameplay coaching";
export const size = shareImageSize;
export const contentType = "image/png";

// The site-wide share picture; guide pages have their own with the guide's title.
export default async function Image() {
  const season = (await getContent()).settings.currentSeason;
  return shareImage({
    label: `EA SPORTS ${season} Ultimate Team`,
    title: "Play better. Together.",
    footer: "Guides · Trading · Meta tactics · Gameplay reviews · fclads.com",
  });
}
