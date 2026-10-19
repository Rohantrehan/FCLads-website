import { PageSkeleton } from "@/components/ui/PageSkeleton";

// The board's menu stays; the page area pulses while the server loads the posts.
export default function Loading() {
  return <PageSkeleton />;
}
