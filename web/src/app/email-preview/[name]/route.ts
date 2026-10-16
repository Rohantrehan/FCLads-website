import { notFound } from "next/navigation";
import {
  reviewForCreatorEmail,
  reviewLinkFixedEmail,
  reviewNewLinkEmail,
  reviewReadyEmail,
  reviewReceivedEmail,
  welcomeEmail,
} from "@/lib/email/templates";
import { DEFAULT_THEME_COLOR, isHexColor } from "@/lib/theme";

// Development only: see each email the site sends, with sample details.
// http://localhost:3000/email-preview/review-ready (add ?color=%23a970ff to try another site colour, ?text for plain text)

const to = "member@example.com";
const samples = {
  welcome: (c: string) => welcomeEmail(to, "Jordan Smith", c),
  "review-received": (c: string) => reviewReceivedEmail(to, "Jordan", "Stefan", c),
  "review-for-creator": (c: string) =>
    reviewForCreatorEmail(to, "Stefan", "Jordan", "I keep losing the ball when they press high. Second half from 60' is the worst.", false, c),
  "review-new-link": (c: string) => reviewNewLinkEmail(to, "Jordan", "Stefan", "The link says the video is private. Can you make it unlisted?", c),
  "review-link-fixed": (c: string) => reviewLinkFixedEmail(to, "Stefan", "Jordan", c),
  "review-ready": (c: string) =>
    reviewReadyEmail(to, "Jordan", "Stefan", "Beat the press, don't run from it", [
      "Drop your CDM between the centre-backs when they press with two.",
      "Use the first-time pass to the free full-back instead of turning.",
      "Stop sprinting in your own half: it pulls players out of shape.",
    ], c),
};

export async function GET(request: Request, { params }: RouteContext<"/email-preview/[name]">) {
  if (process.env.NODE_ENV === "production") notFound();
  const { name } = await params;
  const url = new URL(request.url);
  if (!(name in samples)) {
    const links = Object.keys(samples).map((key) => `<li><a href="/email-preview/${key}">${key}</a></li>`).join("");
    return new Response(`<ul style="font-family:sans-serif">${links}</ul>`, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
  const color = url.searchParams.get("color");
  const email = samples[name as keyof typeof samples](isHexColor(color) ? color : DEFAULT_THEME_COLOR);
  return url.searchParams.has("text")
    ? new Response(`Subject: ${email.subject}\n\n${email.text}`, { headers: { "Content-Type": "text/plain; charset=utf-8" } })
    : new Response(email.html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
