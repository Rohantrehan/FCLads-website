import type { Metadata } from "next";
import Link from "next/link";
import { ShieldMark } from "@/components/layout/Logo";
import { AuthTabs } from "@/components/auth/AuthBits";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your FC Lads account.",
  alternates: { canonical: "/login" },
};

export default function LoginPage() {
  return (
    <div className="glass w-full max-w-md rounded-3xl p-6 shadow-[0_30px_80px_rgb(0_0_0/0.6)] sm:p-8">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <ShieldMark className="size-14 drop-shadow-[0_0_20px_rgb(43_217_139/0.5)]" />
        <h1 className="font-display text-3xl font-extrabold uppercase">Already a Lad?</h1>
        <p className="text-muted">Log in to your FC Lads account.</p>
      </div>
      <div className="flex flex-col gap-6">
        <AuthTabs active="login" />
        <LoginForm />
        <p className="text-center text-sm text-muted">
          New here?{" "}
          <Link href="/learn" className="font-semibold text-primary hover:text-white">
            Start learning free →
          </Link>
        </p>
      </div>
    </div>
  );
}
