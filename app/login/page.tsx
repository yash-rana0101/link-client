import { AuthForm } from "@/features/auth/AuthForm";

export default function LoginPage() {
  return (
    <main className="relative isolate h-[100dvh] overflow-hidden bg-app px-4 py-3 sm:px-6 sm:py-4">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(84,191,117,0.08),transparent_38%),linear-gradient(-150deg,rgba(37,49,41,0.1),transparent_42%)]" />
      <div className="pointer-events-none absolute -left-20 top-0 h-[24rem] w-[24rem] rounded-full bg-trust-300/35 blur-[110px]" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-[22rem] w-[22rem] rounded-full bg-surface-400/30 blur-[100px]" />
      <div className="relative mx-auto flex h-full max-w-6xl items-center justify-center">
        <AuthForm mode="login" />
      </div>
    </main>
  );
}
