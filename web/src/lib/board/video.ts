import type { VideoSource } from "@/types";

// Members-only videos are pasted on the board as a link; the site stores the provider and ID.

/** A Loom or YouTube link (or a bare YouTube ID) → { provider, id }, or undefined if it isn't one. */
export function parseVideoLink(input: string): VideoSource | undefined {
  const value = input.trim();
  if (!value) return undefined;
  if (/^[\w-]{11}$/.test(value)) return { provider: "youtube", id: value };

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return undefined;
  }
  const host = url.hostname.replace(/^www\./, "");
  if (host === "loom.com") {
    const match = url.pathname.match(/^\/(?:share|embed)\/([a-f0-9]{16,64})/i);
    return match ? { provider: "loom", id: match[1] } : undefined;
  }
  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return /^[\w-]{11}$/.test(id) ? { provider: "youtube", id } : undefined;
  }
  if (host === "youtube.com" || host === "m.youtube.com") {
    const id = url.searchParams.get("v") ?? url.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{11})/)?.[1];
    return id && /^[\w-]{11}$/.test(id) ? { provider: "youtube", id } : undefined;
  }
  return undefined;
}

/** { provider, id } → the link shown in the board's input. */
export function videoLink(video: VideoSource | null | undefined) {
  if (!video) return "";
  return video.provider === "loom" ? `https://www.loom.com/share/${video.id}` : `https://youtu.be/${video.id}`;
}
