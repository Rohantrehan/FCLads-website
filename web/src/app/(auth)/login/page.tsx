import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldMark } from "@/components/layout/Logo";
import { AuthTabs } from "@/components/auth/AuthBits";
import { LoginForm } from "@/components/auth/LoginForm";
import { safeNext } from "@/lib/auth/validation";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your FC Lads account.",
  alternates: { canonical: "/login" },
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  // ?next= is where to go after logging in, e.g. a members-only page that sent the user here.
  const next = params.next ? safeNext(params.next) : undefined;
  const viewer = await getViewer();
  if (viewer.isSignedIn) redirect(next ?? (viewer.isMember ? "/dashboard" : "/account"));

  return (
    <div className="glass w-full max-w-md rounded-3xl p-6 shadow-[0_30px_80px_rgb(0_0_0/0.6)] sm:p-8">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <ShieldMark className="size-14 drop-shadow-[0_0_20px_color-mix(in_oklab,var(--color-primary)_50%,transparent)]" />
        <h1 className="font-display text-3xl font-extrabold uppercase">Already a Lad?</h1>
        <p className="text-muted">Log in to your FC Lads account.</p>
      </div>
      <div className="flex flex-col gap-6">
        <AuthTabs active="login" />
        <LoginForm
          next={next}
          notice={params.error === "link" ? "That link has expired or was already used. Log in, or sign up again." : undefined}
        />
        <p className="text-center text-sm text-muted">
          New here?{" "}
          <Link href="/lads-plus" className="font-semibold text-primary hover:text-white">
            See FC Lads+ →
          </Link>
        </p>
      </div>
    </div>
  );
}
