import type { GuideBlock } from "@/types";

// A guide body as it's stored (guides.body) and edited on the posting board, and the conversion to
// the blocks the guide page shows.

export type EditorBlock =
  | { type: "p"; text: string }
  | { type: "section"; title: string }
  | { type: "steps"; items: { title: string; text: string }[] }
  | { type: "tip"; label?: string; title: string; text: string }
  | { type: "controls"; title?: string; inputs: string[]; result: string; note?: string; successRate?: string }
  /** "Members only from here": everything below is FC Lads+. */
  | { type: "lock" };

/** "Beat the 71-depth press!" → "beat-the-71-depth-press" */
const anchor = (title: string) =>
  title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-") || "section";

/** Turns a stored guide body into page blocks. The first "lock" marker sets `lockedFrom`. Empty blocks are skipped. */
export function toGuideBlocks(body: EditorBlock[]) {
  const blocks: GuideBlock[] = [];
  const usedIds = new Set<string>();
  let lockedFrom: number | undefined;

  for (const block of body) {
    switch (block.type) {
      case "p":
        if (block.text) blocks.push({ type: "p", text: block.text });
        break;
      case "section": {
        if (!block.title) break;
        let id = anchor(block.title);
        for (let n = 2; usedIds.has(id); n += 1) id = `${anchor(block.title)}-${n}`;
        usedIds.add(id);
        blocks.push({ type: "section", id, title: block.title });
        break;
      }
      case "steps":
        if (block.items.length) blocks.push({ type: "steps", items: block.items });
        break;
      case "tip":
        if (block.title && block.text) blocks.push({ type: "tip", label: block.label, title: block.title, text: block.text });
        break;
      case "controls":
        if (block.inputs.length && block.result) {
          blocks.push({
            type: "controls",
            title: block.title || "Controller inputs",
            inputs: block.inputs,
            result: block.result,
            note: block.note,
            successRate: block.successRate,
          });
        }
        break;
      case "lock":
        lockedFrom ??= blocks.length;
        break;
    }
  }
  return { blocks, lockedFrom };
}
