import "server-only";

import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { BOARD_HEADER } from "@/lib/supabase/proxy";
import { getViewer } from "@/lib/viewer";

// Who can use the posting board. Checked on the server for every page and every save; the database
// checks again with row-level security (migration 20261015000000_content.sql).

const BOARD_PATH = process.env.BOARD_PATH?.trim();

/** The board's hidden address segment, or undefined when the board is switched off. */
export const boardPath = BOARD_PATH && /^[a-z0-9-]{8,64}$/.test(BOARD_PATH) ? BOARD_PATH : undefined;

export interface Staff {
  id: string;
  name: string;
  email?: string;
  isAdmin: boolean;
  /** The creator profile this account posts as. Admins may have none. */
  creatorSlug?: string;
}

/** The signed-in creator or admin, or undefined for everyone else. Role comes from the database (profiles.role). */
export async function getStaff(): Promise<Staff | undefined> {
  const viewer = await getViewer();
  if (!viewer.isSignedIn || !viewer.id) return undefined;
  if (viewer.role !== "creator" && viewer.role !== "admin") return undefined;
  if (viewer.role === "creator" && !viewer.creatorSlug) return undefined;
  return {
    id: viewer.id,
    name: viewer.name ?? viewer.email ?? "Lad",
    email: viewer.email,
    isAdmin: viewer.role === "admin",
    creatorSlug: viewer.creatorSlug,
  };
}

/**
 * For board pages: the staff member, when they came in through the secret address (src/proxy.ts
 * marks those requests) and they're allowed in. Everyone else gets the normal 404, so the board
 * looks like it doesn't exist.
 */
export async function requireBoardPage({ adminOnly = false } = {}) {
  if (!boardPath || (await headers()).get(BOARD_HEADER) !== "1") notFound();
  const staff = await getStaff();
  if (!staff || (adminOnly && !staff.isAdmin)) notFound();
  return { staff, base: `/${boardPath}` };
}

export class NotAllowedError extends Error {
  constructor() {
    super("not_allowed");
  }
}

/** For board saves (Server Actions can be called directly, so each one checks again). */
export async function requireStaff({ adminOnly = false } = {}) {
  if (!boardPath) throw new NotAllowedError();
  const staff = await getStaff();
  if (!staff || (adminOnly && !staff.isAdmin)) throw new NotAllowedError();
  return staff;
}

/** "Now" for a board page, passed to editors so draft / scheduled / live labels match the server. */
export const boardNow = () => Date.now();
