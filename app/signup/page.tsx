import { AuthForm } from "@/features/auth/AuthForm";

export default function SignupPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-app px-4 py-12 sm:px-6">
      <div className="pointer-events-none absolute -left-20 top-8 h-72 w-72 rounded-full bg-emerald-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-2 h-80 w-80 rounded-full bg-stone-300/40 blur-3xl" />
      <div className="relative mx-auto flex min-h-[80vh] max-w-4xl items-center justify-center">
        <AuthForm mode="signup" />
      </div>
    </main>
  );
}
