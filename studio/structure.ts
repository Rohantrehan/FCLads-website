import type { StructureResolver } from "sanity/structure";

/** Studio menu. Site settings is a single page, not a list. */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("FC Lads")
    .items([
      S.documentTypeListItem("guide").title("Guides"),
      S.documentTypeListItem("collection").title("Collections"),
      S.documentTypeListItem("feedPost").title("Feed posts"),
      S.documentTypeListItem("tradingPost").title("Trading posts"),
      S.divider(),
      S.documentTypeListItem("creator").title("Creators"),
      S.listItem()
        .title("Site settings")
        .id("siteSettings")
        .child(S.document().schemaType("siteSettings").documentId("siteSettings").title("Site settings")),
    ]);
