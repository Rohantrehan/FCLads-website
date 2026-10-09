import { redirect } from "next/navigation";

// /legal has no page of its own: send people to the Terms of Service.
export default function LegalIndex() {
  redirect("/legal/terms");
}
