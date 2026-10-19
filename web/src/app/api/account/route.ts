import { NextResponse } from "next/server";
import { canRunReviews, getViewer } from "@/lib/viewer";

// Who's signed in, for the site header. The header asks from the browser so the public pages
// themselves never read the login and can be served ready-made from the CDN.
export async function GET() {
  const viewer = await getViewer();
  const account = viewer.isSignedIn
    ? { name: viewer.name ?? "Lad", isMember: viewer.isMember, isCreator: canRunReviews(viewer) }
    : null;
  return NextResponse.json({ account }, { headers: { "Cache-Control": "private, no-store" } });
}
