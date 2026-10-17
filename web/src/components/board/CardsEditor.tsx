"use client";

import { useState } from "react";
import { ImageField, Section, TextField } from "@/components/board/fields";
import { SaveOnlyBar, useSaver } from "@/components/board/SaveBar";
import { saveCards } from "@/lib/board/actions";
import type { CardsInput } from "@/lib/board/schemas";
import type { CardPictures } from "@/types";

const homeSlots = [
  { title: "Front card", description: "The big card in the middle." },
  { title: "Back left card", description: "Tilted behind, on the left." },
  { title: "Back right card", description: "Tilted behind, on the right." },
];

type HomeCard = CardsInput["home"][number];

export function CardsEditor({ cards, creatorNames }: { cards: CardPictures | null; creatorNames: string[] }) {
  const [value, setValue] = useState<CardsInput>(() => ({
    home: [0, 1, 2].map((index) => ({ image: null, name: "", href: "", ...cards?.home?.[index] })),
    plus: cards?.plus ?? null,
  }));
  const { save, pending, result } = useSaver(saveCards);
  const setHome = (index: number, card: Partial<HomeCard>) =>
    setValue((old) => ({ ...old, home: old.home.map((item, i) => (i === index ? { ...item, ...card } : item)) }));

  return (
    <div className="flex flex-col gap-6">
      <Section
        title="Home: the three player cards"
        description="The fanned cards at the top of the Home page. Upload each card as one finished picture (made in a card maker), upright, about 2:3. A PNG with a see-through background looks best. An empty slot shows the drawn card instead."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {homeSlots.map((slot, index) => (
            <div key={slot.title} className="flex flex-col gap-4 rounded-xl border border-white/8 bg-surface p-4">
              <div>
                <h3 className="font-display font-extrabold uppercase">{slot.title}</h3>
                <p className="text-sm text-muted">
                  {slot.description}
                  {creatorNames[index] ? ` Empty shows ${creatorNames[index]}'s drawn card.` : ""}
                </p>
              </div>
              <ImageField label="Card picture" folder="site" value={value.home[index].image} onChange={(image) => setHome(index, { image })} />
              <TextField
                label="Who's on the card"
                hint="read out by screen readers"
                value={value.home[index].name ?? ""}
                onChange={(name) => setHome(index, { name })}
                placeholder="Stefan"
                maxLength={60}
              />
              <TextField
                label="Opens page"
                hint="optional"
                value={value.home[index].href}
                onChange={(href) => setHome(index, { href })}
                placeholder="/creators/stefan"
                maxLength={200}
              />
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="FC Lads+ page: Elite tier card"
        description="The membership card next to the price at the top of the FC Lads+ page. Upright, about 4:5. Empty shows the drawn Elite tier card."
      >
        <ImageField label="Card picture" folder="site" value={value.plus} onChange={(plus) => setValue((old) => ({ ...old, plus }))} />
      </Section>

      <SaveOnlyBar pending={pending} result={result} onSave={() => save(value)} />
    </div>
  );
}
