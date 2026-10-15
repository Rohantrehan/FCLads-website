import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// The posting board's files live at /posting-board, but it's only served at its secret address
// (BOARD_PATH). Its real path always shows the normal 404.
const BOARD_ROUTE = "/posting-board";
const boardPath = process.env.BOARD_PATH?.trim();
const boardBase = boardPath && /^[a-z0-9-]{8,64}$/.test(boardPath) ? `/${boardPath}` : undefined;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === BOARD_ROUTE || pathname.startsWith(`${BOARD_ROUTE}/`)) {
    return updateSession(request, { rewriteTo: new URL("/404", request.url) });
  }
  if (boardBase && (pathname === boardBase || pathname.startsWith(`${boardBase}/`))) {
    const target = request.nextUrl.clone();
    target.pathname = BOARD_ROUTE + pathname.slice(boardBase.length);
    return updateSession(request, { rewriteTo: target, board: true });
  }
  return updateSession(request);
}

export const config = {
  // Everything except Next's own files and static images.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
