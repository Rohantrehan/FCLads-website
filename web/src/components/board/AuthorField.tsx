"use client";

import { SelectField } from "@/components/board/fields";

export interface BoardPerson {
  isAdmin: boolean;
  creatorSlug?: string;
}

export interface CreatorChoice {
  slug: string;
  name: string;
}

/** Admins choose who a post is by; creators always post as themselves (the server enforces it too). */
export function AuthorField({
  person,
  creators,
  value,
  onChange,
}: {
  person: BoardPerson;
  creators: CreatorChoice[];
  value: string;
  onChange: (slug: string) => void;
}) {
  if (!person.isAdmin) {
    const me = creators.find((creator) => creator.slug === person.creatorSlug);
    return (
      <p className="text-sm">
        <span className="font-semibold">Posted by</span> <span className="text-muted">· {me?.name ?? "you"}</span>
      </p>
    );
  }
  return (
    <SelectField
      label="Posted by"
      value={value}
      onChange={(slug) => onChange(slug)}
      options={creators.map((creator) => ({ value: creator.slug, label: creator.name }))}
      className="max-w-xs"
    />
  );
}
