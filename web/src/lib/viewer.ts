// Who is looking at the page. Stub until authentication exists (Phase 2).
// Replace the body with a real session lookup; every paywall check already goes through here.

export interface Viewer {
  isSignedIn: boolean;
  isMember: boolean;
  /** Display name, when signed in. */
  name?: string;
}

export async function getViewer(): Promise<Viewer> {
  // Design preview only: `DEV_VIEWER=member` in web/.env.local shows the site as a signed-in member.
  // Ignored in production builds.
  if (process.env.NODE_ENV === "development" && process.env.DEV_VIEWER === "member") {
    return { isSignedIn: true, isMember: true, name: "Arjun" };
  }
  return { isSignedIn: false, isMember: false };
}
