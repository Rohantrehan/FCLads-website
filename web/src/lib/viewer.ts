// Who is looking at the page. Stub until authentication exists (Phase 2).
// Replace the body with a real session lookup; every paywall check already goes through here.

export interface Viewer {
  isSignedIn: boolean;
  isMember: boolean;
}

export async function getViewer(): Promise<Viewer> {
  return { isSignedIn: false, isMember: false };
}
