import { ArrowUpRight, CheckCircle2, Link2, RefreshCw, Unlink } from "lucide-react";
import { unlinkDiscord } from "@/app/(site)/account/actions";
import { StatusNote } from "@/components/auth/AuthBits";
import { Button } from "@/components/ui/Button";
import type { DiscordLink as Link } from "@/lib/discord";

// Discord connection for FC Lads+ members, on the dashboard's Discord tab and the membership page.
// "Connect" goes to /discord/connect (Discord's sign-in), which adds them to the server with the role.

const notes: Record<string, { tone: "success" | "info" | "error"; text: string }> = {
  linked: { tone: "success", text: "Discord connected. You're in the server with the FC Lads+ role." },
  unlinked: { tone: "info", text: "Discord disconnected and the FC Lads+ role removed." },
  cancelled: { tone: "info", text: "Discord wasn't connected. You can try again whenever you like." },
  "in-use": { tone: "error", text: "That Discord account is already connected to another FC Lads account." },
  "members-only": { tone: "info", text: "Connecting Discord is part of FC Lads+. Join to get the members role." },
  unavailable: { tone: "info", text: "Discord connection is being set up. Use the invite for now." },
  error: { tone: "error", text: "Something went wrong connecting Discord. Please try again in a minute." },
};

/** The message after coming back from Discord (?discord=…). */
export function DiscordNote({ result }: { result?: string | string[] }) {
  const note = typeof result === "string" ? notes[result] : undefined;
  return note ? <StatusNote tone={note.tone}>{note.text}</StatusNote> : null;
}

/** Linked / Not linked chip for panel headers. */
export function DiscordBadge({ link }: { link?: Link }) {
  return (
    <span className="tabular rounded-md border border-white/10 px-2 py-1 text-[11px] text-muted uppercase">
      {link ? "Linked" : "Not linked"}
    </span>
  );
}

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

export function DiscordConnect({
  link,
  configured,
  invite,
  serverUrl,
}: {
  link?: Link;
  configured: boolean;
  /** Public invite from Site settings, the fallback while linking isn't set up. */
  invite?: string;
  serverUrl?: string;
}) {
  if (!configured) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted">
          Automatic linking of your Discord account is being set up. For now, join with the invite and ask a Lad for the
          members role.
        </p>
        {invite ? (
          <Button href={invite} variant="primary" size="md" className="w-full" {...external}>
            Join the Discord
            <ArrowUpRight aria-hidden className="size-4" />
          </Button>
        ) : (
          <p className="text-sm text-muted">The invite link will appear here soon.</p>
        )}
      </div>
    );
  }

  if (!link) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted">
          Connect your Discord account and we&apos;ll add you to the server with the FC Lads+ role, which unlocks the
          members&apos; channels. It comes off automatically if your membership ends.
        </p>
        {/* A plain link: /discord/connect leaves the site for Discord's sign-in page. */}
        <a
          href="/discord/connect"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#5865F2] px-5 py-3 font-display text-sm font-extrabold tracking-wide text-white uppercase transition-colors hover:bg-[#4752c4]"
        >
          <Link2 aria-hidden className="size-4" />
          Connect Discord
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="flex items-center gap-2 text-sm">
        <CheckCircle2 aria-hidden className="size-4 shrink-0 text-primary" />
        <span>
          Connected as <span className="font-bold">{link.username}</span>
        </span>
      </p>
      <p className="text-sm text-muted">
        {link.roleGranted
          ? "Your FC Lads+ role is on. It stays while your membership is active."
          : "Your FC Lads+ role is missing (maybe you left the server). Connect again to get it back."}
      </p>
      {serverUrl && (
        <Button href={serverUrl} variant="primary" size="md" className="w-full" {...external}>
          Open the server
          <ArrowUpRight aria-hidden className="size-4" />
        </Button>
      )}
      <div className="flex flex-wrap gap-2">
        <a
          href="/discord/connect"
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-muted transition-colors hover:text-white"
        >
          <RefreshCw aria-hidden className="size-3.5" />
          {link.roleGranted ? "Reconnect" : "Connect again"}
        </a>
        <form action={unlinkDiscord}>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-muted transition-colors hover:border-red-400/40 hover:text-red-300"
          >
            <Unlink aria-hidden className="size-3.5" />
            Disconnect
          </button>
        </form>
      </div>
    </div>
  );
}
