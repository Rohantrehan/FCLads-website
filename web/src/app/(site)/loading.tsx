import { PageSkeleton } from "@/components/ui/PageSkeleton";

// Lets a click show something straight away (and lets Next prefetch this part of every page).
export default function Loading() {
  return <PageSkeleton className="page-container pt-10 pb-20" />;
}
