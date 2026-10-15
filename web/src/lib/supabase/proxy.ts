import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Request header the proxy adds when it serves the posting board from its secret address. */
export const BOARD_HEADER = "x-fcl-board";

/**
 * Refreshes the Supabase session cookie on every request, so Server Components always see a valid one.
 * `rewriteTo` serves another route at the same address (the posting board); `board` marks that request.
 */
export async function updateSession(request: NextRequest, { rewriteTo, board = false }: { rewriteTo?: URL; board?: boolean } = {}) {
  const respond = () => {
    // Never trust this header from outside; only the proxy sets it.
    const headers = new Headers(request.headers);
    headers.delete(BOARD_HEADER);
    if (board) headers.set(BOARD_HEADER, "1");
    return rewriteTo ? NextResponse.rewrite(rewriteTo, { request: { headers } }) : NextResponse.next({ request: { headers } });
  };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return respond();

  let response = respond();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = respond();
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([name, value]) => response.headers.set(name, value));
      },
    },
  });

  // Nothing may run between creating the client and this call, or users can get logged out at random.
  await supabase.auth.getClaims();
  return response;
}
