import type { Metadata } from "next";
import Link from "next/link";
import { ShieldMark } from "@/components/layout/Logo";
import { ForgotPasswordForm } from "@/components/auth/PasswordForms";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Reset the password for your FC Lads account.",
  robots: { index: false },
};

export default async function ForgotPasswordPage({ searchParams }: PageProps<"/forgot-password">) {
  const expired = (await searchParams).error === "link";
  return (
    <div className="glass w-full max-w-md rounded-3xl p-6 shadow-[0_30px_80px_rgb(0_0_0/0.6)] sm:p-8">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <ShieldMark className="size-14 drop-shadow-[0_0_20px_color-mix(in_oklab,var(--color-primary)_50%,transparent)]" />
        <h1 className="font-display text-3xl font-extrabold uppercase">Forgot password?</h1>
        <p className="text-muted">Enter your email and we&apos;ll send you a link to choose a new one.</p>
      </div>
      <div className="flex flex-col gap-6">
        <ForgotPasswordForm
          notice={expired ? "That reset link has expired or was already used. Ask for a new one." : undefined}
        />
        <p className="text-center text-sm text-muted">
          Remembered it?{" "}
          <Link href="/login" className="font-semibold text-primary hover:text-white">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
