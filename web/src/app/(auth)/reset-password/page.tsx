import type { Metadata } from "next";
import Link from "next/link";
import { ShieldMark } from "@/components/layout/Logo";
import { ResetPasswordForm } from "@/components/auth/PasswordForms";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { index: false },
};

export default async function ResetPasswordPage() {
  // The reset email's link signs the user in before landing here.
  const { isSignedIn } = await getViewer();
  return (
    <div className="glass w-full max-w-md rounded-3xl p-6 shadow-[0_30px_80px_rgb(0_0_0/0.6)] sm:p-8">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <ShieldMark className="size-14 drop-shadow-[0_0_20px_color-mix(in_oklab,var(--color-primary)_50%,transparent)]" />
        <h1 className="font-display text-3xl font-extrabold uppercase">New password</h1>
        <p className="text-muted">
          {isSignedIn ? "Choose a new password for your account." : "Open the link in your reset email to get here."}
        </p>
      </div>
      {isSignedIn ? (
        <ResetPasswordForm />
      ) : (
        <p className="text-center">
          <Link href="/forgot-password" className="font-semibold text-primary hover:text-white">
            Send me a reset link
          </Link>
        </p>
      )}
    </div>
  );
}
