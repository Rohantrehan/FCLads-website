import { collection } from "./collection";
import { creator } from "./creator";
import { feedPost } from "./feedPost";
import { guide } from "./guide";
import { guideBlockTypes } from "./objects/guideBlocks";
import { video } from "./objects/video";
import { siteSettings } from "./siteSettings";
import { tradingPost } from "./tradingPost";

export const schemaTypes = [
  guide,
  collection,
  feedPost,
  tradingPost,
  creator,
  siteSettings,
  video,
  ...guideBlockTypes,
];
