import "server-only";

// Sends one email through Resend (https://resend.com, free for 3,000 emails a month) with a plain
// fetch, so there's no extra package. Without RESEND_API_KEY nothing is sent: the email is only
// logged, so local development and tests never email anyone. Never throws: a failed email must not
// undo a review or a sign-up, so callers run it inside after().

const apiKey = process.env.RESEND_API_KEY?.trim();
const from = process.env.EMAIL_FROM?.trim() || "FC Lads <onboarding@resend.dev>";
const replyTo = process.env.EMAIL_REPLY_TO?.trim() || undefined;

export const isEmailConfigured = Boolean(apiKey);

/** Test and placeholder addresses (QA accounts use @fclads.test). These never leave the server. */
const RESERVED = /@(?:[^@]+\.)?(?:test|example|invalid|localhost)$|@example\.(?:com|org|net)$/i;
export const isDeliverable = (address: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address) && !RESERVED.test(address);

export interface Email {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export type SendResult = "sent" | "skipped" | "failed";

export async function sendEmail(email: Email): Promise<SendResult> {
  if (!isDeliverable(email.to) || !apiKey) {
    // Only the subject and the address's domain: no personal details in the logs.
    console.info(`[email] not sent (${apiKey ? "test address" : "RESEND_API_KEY not set"}): "${email.subject}" to …@${email.to.split("@")[1] ?? "?"}`);
    return "skipped";
  }
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [email.to], subject: email.subject, html: email.html, text: email.text, reply_to: replyTo }),
      cache: "no-store",
    });
    if (response.ok) return "sent";
    console.error(`[email] Resend refused "${email.subject}": ${response.status} ${(await response.text()).slice(0, 300)}`);
  } catch (error) {
    console.error(`[email] couldn't reach Resend for "${email.subject}"`, error);
  }
  return "failed";
}
