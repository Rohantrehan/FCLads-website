"use client";

import { useState } from "react";
import type { CreatorChoice } from "@/components/board/AuthorField";
import { Choice, SelectField, TextField } from "@/components/board/fields";
import { ResultMessage, useSaver } from "@/components/board/SaveBar";
import { setTeamRole } from "@/lib/board/actions";

type Role = "member" | "creator" | "admin";

/** Give an existing account the creator or admin role, or take it away. */
export function TeamForm({ creators }: { creators: CreatorChoice[] }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("creator");
  const [creatorSlug, setCreatorSlug] = useState(creators[0]?.slug ?? "");
  const { save, pending, result } = useSaver(setTeamRole);

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        save({ email, role, creatorSlug: role === "member" ? "" : creatorSlug }, () => setEmail(""), "Done. They'll see the change next time a page loads.");
      }}
    >
      <TextField label="Their account email" hint="they sign up on the site first" type="email" value={email} onChange={setEmail} name="email" />
      <Choice
        label="Role"
        value={role}
        onChange={setRole}
        options={[
          { value: "creator", label: "Creator", hint: "Posts as their profile, runs reviews" },
          { value: "admin", label: "Admin", hint: "Everything, including this page" },
          { value: "member", label: "Remove access", hint: "Back to a normal account" },
        ]}
      />
      {role !== "member" && (
        <SelectField
          label="Posts as"
          hint={role === "admin" ? "optional for admins" : undefined}
          value={creatorSlug}
          onChange={(value) => setCreatorSlug(value)}
          options={creators.map((creator) => ({ value: creator.slug, label: creator.name }))}
          empty={role === "admin" ? "No creator profile" : undefined}
          className="max-w-xs"
        />
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="text-label rounded-xl bg-primary px-5 py-2.5 text-on-primary hover:brightness-110 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save role"}
        </button>
        <ResultMessage result={result} />
      </div>
    </form>
  );
}
