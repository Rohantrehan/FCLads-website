import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { ShieldMark } from "@/components/layout/Logo";
import { AuthTabs } from "@/components/auth/AuthBits";
import { SignupForm } from "@/components/auth/SignupForm";
import { ladsPlus } from "@/data/ladsPlus";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create a free FC Lads account, or join FC Lads+.",
  alternates: { canonical: "/signup" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function SignupPage({ searchParams }: { searchParams: SearchParams }) {
  // ?plan=plus comes from the "Join FC Lads+" buttons: after sign-up the user goes to checkout.
  const joiningPlus = (await searchParams).plan === "plus";

  return (
    <div className="glass w-full max-w-md rounded-3xl p-6 shadow-[0_30px_80px_rgb(0_0_0/0.6)] sm:p-8">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <ShieldMark className="size-14 drop-shadow-[0_0_20px_rgb(43_217_139/0.5)]" />
        <h1 className="font-display text-3xl font-extrabold uppercase">{joiningPlus ? "Join FC Lads+" : "Join the Lads"}</h1>
        <p className="text-muted">
          {joiningPlus ? "Step 1 of 2: create your account. Payment comes next." : "Create your free FC Lads account."}
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <AuthTabs active="signup" plan={joiningPlus ? "plus" : undefined} />

        {joiningPlus ? (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/40 bg-pitch-green p-4">
            <span className="flex items-center gap-2.5">
              <ShieldCheck aria-hidden className="size-5 text-primary" />
              <span className="font-display font-extrabold">FC Lads+</span>
            </span>
            <span className="tabular text-sm">
              <span className="font-bold text-mint">{ladsPlus.priceLabel}</span>
              <span className="text-muted"> / month</span>
            </span>
          </div>
        ) : null}

        <SignupForm joiningPlus={joiningPlus} />

        {!joiningPlus && (
          <p className="rounded-lg border border-white/8 bg-white/[0.03] p-3 text-center text-sm text-muted">
            Want premium guides and the private Discord?{" "}
            <Link href="/lads-plus" className="font-semibold text-mint hover:text-white">
              See FC Lads+ ({ladsPlus.priceLabel}/mo)
            </Link>
          </p>
        )}

        <p className="text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:text-white">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
