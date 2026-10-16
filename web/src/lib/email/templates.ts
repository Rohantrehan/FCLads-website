import "server-only";

import type { Email } from "@/lib/email/send";
import { themeTokens } from "@/lib/theme";

// The emails the site sends itself. Each one has an HTML version (tables and inline styles, which is
// what email apps understand) and a plain-text version. The sign-up and password emails are sent by
// Supabase instead: their templates are in supabase/templates/.

/** Public address of the site, for links in emails. */
export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000").replace(/\/$/, "");

const escape = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const FONT = "font-family:Manrope,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

interface Layout {
  /** Shown in the inbox list next to the subject. */
  preview: string;
  heading: string;
  /** Paragraphs and blocks, already HTML (escape anything a person typed). */
  body: string[];
  button?: { label: string; href: string };
  /** The site colour from Site settings, so emails match the site. */
  color: string;
}

function layout({ preview, heading, body, button, color }: Layout) {
  const t = themeTokens(color);
  const cta = button
    ? `<tr><td style="padding:8px 32px 8px"><a href="${escape(button.href)}" style="display:inline-block;background:${t.primary};color:${t["on-primary"]};${FONT};font-size:14px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;text-decoration:none;padding:14px 26px;border-radius:12px">${escape(button.label)}</a></td></tr>`
    : "";
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><title>${escape(heading)}</title></head>
<body style="margin:0;padding:0;background:#07090d">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escape(preview)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#07090d"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
<tr><td style="padding:0 4px 20px;${FONT};font-size:18px;font-weight:900;letter-spacing:0.02em;color:#ffffff">FC <span style="color:${t.primary}">LADS</span></td></tr>
<tr><td style="background:#0f141b;border:1px solid #1f2731;border-radius:20px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td style="height:4px;background:${t.primary};border-radius:20px 20px 0 0;font-size:0;line-height:0">&nbsp;</td></tr>
<tr><td style="padding:28px 32px 8px;${FONT};font-size:24px;line-height:1.25;font-weight:800;color:#ffffff">${escape(heading)}</td></tr>
${body.map((html) => `<tr><td style="padding:8px 32px;${FONT};font-size:15px;line-height:1.6;color:#c9d3dd">${html}</td></tr>`).join("\n")}
${cta}
<tr><td style="padding:16px 32px 28px">&nbsp;</td></tr>
</table></td></tr>
<tr><td style="padding:20px 4px 0;${FONT};font-size:12px;line-height:1.6;color:#6b7785">
You're getting this because you have an FC Lads account. <a href="${siteUrl()}/account" style="color:#8b98a5">Your account</a><br>
FC Lads is a fan community and isn't affiliated with EA SPORTS.
</td></tr>
</table></td></tr></table>
</body></html>`;
}

const quote = (text: string, color: string) =>
  `<div style="border-left:3px solid ${themeTokens(color).primary};padding:10px 14px;background:#0b1016;border-radius:0 10px 10px 0;color:#e6edf3;white-space:pre-line">${escape(text)}</div>`;

function email(to: string, subject: string, view: Layout, text: string[]): Email {
  return { to, subject, html: layout(view), text: [...text, "", "FC Lads", siteUrl()].join("\n") };
}

const firstName = (name: string) => name.trim().split(/\s+/)[0] || "Lad";

// ---- Account

export function welcomeEmail(to: string, name: string, color: string) {
  const url = siteUrl();
  return email(
    to,
    "Welcome to FC Lads",
    {
      color,
      preview: "Your account is ready. Here's where to start.",
      heading: `Welcome, ${firstName(name)}`,
      body: [
        "Your email is confirmed and your FC Lads account is ready.",
        "Follow the Feed for what the Lads are spotting this week, and meet the creators behind the guides.",
        "Want every guide and video collection, the trading calls and a monthly gameplay review from a Lad? Try FC Lads+ free for 14 days.",
      ],
      button: { label: "Explore FC Lads", href: url },
    },
    [
      `Welcome, ${firstName(name)}`,
      "",
      "Your email is confirmed and your FC Lads account is ready.",
      "FC Lads+ adds every guide and video collection, the trading calls and a monthly gameplay review, free for 14 days.",
      "",
      url,
    ],
  );
}

// ---- Gameplay reviews

export function reviewReceivedEmail(to: string, member: string, lad: string | undefined, color: string) {
  const url = `${siteUrl()}/dashboard/review`;
  const who = lad ? `${lad} will` : "The first free Lad will";
  return email(
    to,
    "We've got your match",
    {
      color,
      preview: `${who} pick it up soon.`,
      heading: "We've got your match",
      body: [
        `Thanks, ${escape(firstName(member))}. ${escape(who)} watch it and send you a written or video review with a plan of up to 3 things to work on.`,
        "We'll email you when it's ready. Until a Lad starts, you can change the link or your note, or cancel to get this month's review back.",
      ],
      button: { label: "See your review", href: url },
    },
    [
      "We've got your match",
      "",
      `Thanks, ${firstName(member)}. ${who} watch it and send you a review with a plan of up to 3 things to work on. We'll email you when it's ready.`,
      "",
      `Your review: ${url}`,
    ],
  );
}

export function reviewForCreatorEmail(to: string, creator: string, member: string, focus: string, forAnyLad: boolean, color: string) {
  const url = `${siteUrl()}/creator`;
  const intro = forAnyLad
    ? `${escape(member)} sent a match for any Lad to review. Whoever starts it first gets it.`
    : `${escape(member)} asked for you to review their match.`;
  return email(
    to,
    forAnyLad ? `New match to review from ${member}` : `${member} wants your review`,
    {
      color,
      preview: focus || "Open the Creator hub to start it.",
      heading: "A new match to review",
      body: [`Hi ${escape(firstName(creator))}, ${intro}`, ...(focus ? [`What they want help with:`, quote(focus, color)] : [])],
      button: { label: "Open the Creator hub", href: url },
    },
    [
      "A new match to review",
      "",
      `Hi ${firstName(creator)}, ${forAnyLad ? `${member} sent a match for any Lad to review.` : `${member} asked for you to review their match.`}`,
      ...(focus ? ["", `What they want help with: ${focus}`] : []),
      "",
      `Creator hub: ${url}`,
    ],
  );
}

export function reviewNewLinkEmail(to: string, member: string, lad: string, note: string, color: string) {
  const url = `${siteUrl()}/dashboard/review`;
  return email(
    to,
    "Your match link needs fixing",
    {
      color,
      preview: `${lad} couldn't watch it yet.`,
      heading: "We need a new link",
      body: [
        `Hi ${escape(firstName(member))}, ${escape(lad)} couldn't watch your match from the link you sent.`,
        ...(note ? [quote(note, color)] : []),
        "Add a new link and it goes straight back to them. Your review for this month is kept.",
      ],
      button: { label: "Add a new link", href: url },
    },
    [
      "We need a new link",
      "",
      `Hi ${firstName(member)}, ${lad} couldn't watch your match from the link you sent.`,
      ...(note ? ["", note] : []),
      "",
      `Add a new link: ${url}`,
    ],
  );
}

export function reviewLinkFixedEmail(to: string, creator: string, member: string, color: string) {
  const url = `${siteUrl()}/creator`;
  return email(
    to,
    `${member} sent a new link`,
    {
      color,
      preview: "Their match is back in your queue.",
      heading: "New link added",
      body: [`Hi ${escape(firstName(creator))}, ${escape(member)} added a new match link. It's back in your queue in the Creator hub.`],
      button: { label: "Open the Creator hub", href: url },
    },
    ["New link added", "", `Hi ${firstName(creator)}, ${member} added a new match link. It's back in your queue.`, "", `Creator hub: ${url}`],
  );
}

export function reviewReadyEmail(to: string, member: string, lad: string, title: string, plan: string[], color: string) {
  const url = `${siteUrl()}/dashboard/review`;
  const t = themeTokens(color);
  const steps = plan
    .map(
      (point, i) =>
        `<tr><td valign="top" style="padding:6px 12px 6px 0;width:28px"><div style="width:26px;height:26px;border-radius:13px;background:${t.primary};color:${t["on-primary"]};${FONT};font-size:13px;font-weight:800;line-height:26px;text-align:center">${i + 1}</div></td><td style="padding:8px 0;${FONT};font-size:15px;line-height:1.5;color:#e6edf3">${escape(point)}</td></tr>`,
    )
    .join("");
  return email(
    to,
    `Your review from ${lad} is ready`,
    {
      color,
      preview: plan[0] ? `First on your plan: ${plan[0]}` : "Open it on your dashboard.",
      heading: "Your review is ready",
      body: [
        `Hi ${escape(firstName(member))}, ${escape(lad)} has finished reviewing your match${title ? `: <strong style="color:#ffffff">${escape(title)}</strong>` : ""}.`,
        ...(plan.length ? ["Your plan:", `<table role="presentation" cellpadding="0" cellspacing="0">${steps}</table>`] : []),
        "The full notes and any video are on your dashboard.",
      ],
      button: { label: "Read your review", href: url },
    },
    [
      "Your review is ready",
      "",
      `Hi ${firstName(member)}, ${lad} has finished reviewing your match${title ? `: ${title}` : ""}.`,
      ...(plan.length ? ["", "Your plan:", ...plan.map((point, i) => `${i + 1}. ${point}`)] : []),
      "",
      `Read your review: ${url}`,
    ],
  );
}
