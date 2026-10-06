import Link from "next/link";
import { ArrowRight, Gamepad2, Lightbulb, Plus } from "lucide-react";
import { getPlayer } from "@/data/players";
import type { GuideBlock } from "@/types";

/** Renders structured guide content. Section numbers count up through the whole guide. */
export function GuideBlocks({ blocks }: { blocks: GuideBlock[] }) {
  // Section number for each block index (counted before rendering, not mutated during it).
  const sectionNumbers = blocks.reduce<number[]>((numbers, block, index) => {
    const previous = index > 0 ? numbers[index - 1] : 0;
    numbers.push(block.type === "section" ? previous + 1 : previous);
    return numbers;
  }, []);

  return (
    <>
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;
        switch (block.type) {
          case "p":
            return (
              <p key={key} className="text-[17px] leading-relaxed text-muted">
                {block.text}
              </p>
            );

          case "section":
            return (
              <h2
                key={key}
                id={block.id}
                className="mt-6 flex scroll-mt-28 items-start gap-3 font-display text-2xl leading-tight font-extrabold uppercase"
              >
                <span className="tabular mt-1 shrink-0 rounded bg-primary/15 px-2 py-0.5 text-sm text-mint">
                  {String(sectionNumbers[index]).padStart(2, "0")}
                </span>
                {block.title}
              </h2>
            );

          case "steps":
            return (
              <ol key={key} className="flex flex-col gap-3">
                {block.items.map((item, step) => (
                  <li key={item.title} className="flex gap-4 rounded-xl border border-white/8 bg-surface-container p-4">
                    <span className="tabular flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-highest text-sm font-bold text-mint">
                      {step + 1}
                    </span>
                    <div>
                      <h3 className="font-display font-bold">{item.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted">{item.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            );

          case "tip":
            return (
              <aside
                key={key}
                className="flex gap-4 rounded-xl border-l-4 border-primary bg-gradient-to-r from-pitch-green to-surface-container p-5"
              >
                <Lightbulb aria-hidden className="mt-0.5 size-6 shrink-0 text-mint" />
                <div>
                  {block.label && <p className="text-label text-mint">{block.label}</p>}
                  <h3 className="mt-1 font-display text-lg font-extrabold">{block.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted">{block.text}</p>
                </div>
              </aside>
            );

          case "controls":
            return (
              <figure key={key} className="flex flex-col gap-4 rounded-xl border border-white/8 bg-[#090d14] p-5">
                <figcaption className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-label flex items-center gap-2 text-muted">
                    <Gamepad2 aria-hidden className="size-4 text-mint" />
                    {block.title}
                  </span>
                  {block.successRate && (
                    <span className="tabular text-xs font-bold text-primary">Success rate: {block.successRate}</span>
                  )}
                </figcaption>
                <ol className="flex flex-wrap items-center gap-2" aria-label="Button presses in order">
                  {block.inputs.map((input, step) => (
                    <li key={input} className="flex items-center gap-2">
                      {step > 0 && <Plus aria-hidden className="size-4 text-muted" />}
                      <kbd className="tabular rounded-lg border border-white/15 bg-surface-high px-3 py-1.5 text-sm font-bold text-white shadow-[inset_0_-2px_0_rgb(0_0_0/0.4)]">
                        {input}
                      </kbd>
                    </li>
                  ))}
                  <li className="flex items-center gap-2">
                    <ArrowRight aria-hidden className="size-4 text-muted" />
                    <span className="tabular rounded-lg bg-primary/15 px-3 py-1.5 text-sm font-bold text-mint">
                      {block.result}
                    </span>
                  </li>
                </ol>
                {block.note && <p className="text-sm text-muted">{block.note}</p>}
              </figure>
            );

          case "player": {
            const player = getPlayer(block.slug);
            if (!player) return null;
            return (
              <aside
                key={key}
                className="relative flex items-center gap-4 rounded-xl border border-white/8 bg-surface-container p-4 transition-colors hover:border-primary/40"
              >
                <span className="flex size-14 shrink-0 flex-col items-center justify-center rounded-lg bg-surface-highest">
                  <span className="font-display text-xl leading-none font-extrabold text-mint">{player.ovr}</span>
                  <span className="tabular text-[10px] text-muted">{player.position}</span>
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display font-extrabold">
                    <Link href={`/players/${player.slug}`} className="after:absolute after:inset-0">
                      {player.name}
                    </Link>
                    {player.playstyles?.[0] && (
                      <span className="tabular ml-2 text-xs font-bold text-primary">{player.playstyles[0]}</span>
                    )}
                  </h3>
                  <p className="text-sm text-muted">{block.note}</p>
                </div>
                <ArrowRight aria-hidden className="size-4 shrink-0 text-muted" />
              </aside>
            );
          }
        }
      })}
    </>
  );
}
