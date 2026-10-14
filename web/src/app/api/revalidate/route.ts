import { revalidateTag } from "next/cache";
import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";
import { CONTENT_TAG } from "@/lib/sanity/client";

// Called by a Sanity webhook whenever something is published, changed or deleted, so the site
// shows it straight away instead of after the 5-minute cache. Set up in sanity.io/manage → API →
// Webhooks with this URL and the same secret as SANITY_WEBHOOK_SECRET.

export async function POST(request: Request) {
  const secret = process.env.SANITY_WEBHOOK_SECRET;
  if (!secret) return Response.json({ message: "Webhook secret not set." }, { status: 500 });

  const body = await request.text();
  const signature = request.headers.get(SIGNATURE_HEADER_NAME) ?? "";
  if (!(await isValidSignature(body, signature, secret))) {
    return Response.json({ message: "Invalid signature." }, { status: 401 });
  }

  // Expire now: the next visit gets fresh content (no stale copy first).
  revalidateTag(CONTENT_TAG, { expire: 0 });
  return Response.json({ revalidated: true });
}
