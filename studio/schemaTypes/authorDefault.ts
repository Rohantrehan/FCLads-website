import type { InitialValueResolverContext } from "sanity";

/**
 * New posts are credited to the creator whose "Studio login email" matches the person signed in,
 * so creators don't have to pick themselves. Admins without a creator profile pick one by hand.
 */
export async function creditCurrentUser(context: InitialValueResolverContext) {
  const email = context.currentUser?.email;
  if (!email) return undefined;
  const id = await context
    .getClient({ apiVersion: "2025-02-19" })
    .fetch<string | null>(`*[_type == "creator" && lower(studioEmail) == lower($email)][0]._id`, { email });
  return id ? { _ref: id.replace(/^drafts\./, "") } : undefined;
}
