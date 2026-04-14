import { AuthForm } from "@/features/auth/AuthForm";

export default function SignupPage() {
  return (
    <main className="relative isolate h-[100dvh] overflow-hidden bg-app px-4 py-3 sm:px-6 sm:py-4">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(130deg,rgba(123,214,148,0.14),transparent_40%),linear-gradient(-135deg,rgba(23,34,27,0.12),transparent_44%)]" />
      <div className="pointer-events-none absolute -left-24 top-6 h-[24rem] w-[24rem] rounded-full bg-trust-200/45 blur-[110px]" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-[22rem] w-[22rem] rounded-full bg-surface-300/35 blur-[100px]" />
      <div className="relative mx-auto flex h-full max-w-6xl items-center justify-center">
        <AuthForm mode="signup" />
      </div>
    </main>
  );
}
