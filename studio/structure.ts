import { BookIcon } from "@sanity/icons/Book";
import { CogIcon } from "@sanity/icons/Cog";
import { CommentIcon } from "@sanity/icons/Comment";
import { PlayIcon } from "@sanity/icons/Play";
import { TrendUpwardIcon } from "@sanity/icons/TrendUpward";
import { UsersIcon } from "@sanity/icons/Users";
import type { StructureResolver } from "sanity/structure";

/** Studio menu: posts first, then Learn, then setup. Lists show the newest first. */
export const structure: StructureResolver = (S) => {
  const list = (type: string, title: string, icon: typeof BookIcon, orderBy?: { field: string; direction: "asc" | "desc" }) =>
    S.listItem()
      .title(title)
      .icon(icon)
      .schemaType(type)
      .child(
        S.documentTypeList(type)
          .title(title)
          .defaultOrdering(orderBy ? [orderBy] : []),
      );

  return S.list()
    .title("FC Lads")
    .items([
      list("tradingPost", "Trading posts", TrendUpwardIcon, { field: "postedAt", direction: "desc" }),
      list("feedPost", "Feed posts", CommentIcon, { field: "postedAt", direction: "desc" }),
      S.divider().title("Learn"),
      list("guide", "Guides", BookIcon, { field: "publishedAt", direction: "desc" }),
      list("collection", "Video collections", PlayIcon, { field: "order", direction: "asc" }),
      S.divider().title("Setup"),
      list("creator", "Creators", UsersIcon, { field: "order", direction: "asc" }),
      S.listItem()
        .title("Site settings")
        .icon(CogIcon)
        .id("siteSettings")
        .child(S.document().schemaType("siteSettings").documentId("siteSettings").title("Site settings")),
    ]);
};
