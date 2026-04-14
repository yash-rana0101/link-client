"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  buildOAuthAuthorizationRequest,
  persistPendingOAuthRequest,
} from "@/features/auth/oauth";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/features/auth/useAuth";
import { cn } from "@/lib/cn";
import type { OAuthProvider } from "@/types/auth";

type AuthMode = "login" | "signup";

interface AuthFormProps {
  mode: AuthMode;
}

const copy: Record<
  AuthMode,
  {
    eyebrow: string;
    heading: string;
    title: string;
    subtitle: string;
    pendingLabel: string;
    securityLabel: string;
    helperLabel: string;
    submitLabel: string;
    swapPrompt: string;
    swapActionLabel: string;
    swapHref: string;
    highlights: string[];
  }
> = {
  login: {
    eyebrow: "Welcome Back",
    heading: "Sign in",
    title: "Log in to your account",
    subtitle: "Pick up where you left off.",
    pendingLabel: "Signing you in...",
    securityLabel: "Your account is protected",
    helperLabel: "Forgot password?",
    submitLabel: "Log in",
    swapPrompt: "Need an account?",
    swapActionLabel: "Create one",
    swapHref: "/signup",
    highlights: [
      "Sign in quickly with email or social login.",
      "Your data stays secure while you work.",
      "Access your feed, messages, and profile in one place.",
    ],
  },
  signup: {
    eyebrow: "Get Started",
    heading: "Create account",
    title: "Create your ZeroTrust account",
    subtitle: "Set up your account and start connecting.",
    pendingLabel: "Creating your account...",
    securityLabel: "Safe account setup",
    helperLabel: "Need help?",
    submitLabel: "Create account",
    swapPrompt: "Already have an account?",
    swapActionLabel: "Log in",
    swapHref: "/login",
    highlights: [
      "Set up your profile in a minute.",
      "Use email, Google, or Microsoft.",
      "Your account is secure from the start.",
    ],
  },
};

export const AuthForm = ({ mode }: AuthFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [oauthBusyProvider, setOauthBusyProvider] =
    useState<OAuthProvider | null>(null);
  const [oauthErrorMessage, setOauthErrorMessage] = useState<string | null>(null);
  const { loginMutation, signupMutation } = useAuth();

  const googleOAuthEnabled = Boolean(process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID);
  const microsoftOAuthEnabled = Boolean(
    process.env.NEXT_PUBLIC_MICROSOFT_OAUTH_CLIENT_ID,
  );

  const isPending =
    mode === "login" ? loginMutation.isPending : signupMutation.isPending;

  const errorMessage =
    (mode === "login" ? loginMutation.error : signupMutation.error)?.message ??
    null;

  const onOAuthStart = async (provider: OAuthProvider) => {
    if (isPending || oauthBusyProvider) {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    setOauthErrorMessage(null);
    setOauthBusyProvider(provider);

    try {
      const authorizationRequest = await buildOAuthAuthorizationRequest({
        provider,
        intent: mode,
        origin: window.location.origin,
        googleClientId: process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID,
        microsoftClientId: process.env.NEXT_PUBLIC_MICROSOFT_OAUTH_CLIENT_ID,
        microsoftTenantId: process.env.NEXT_PUBLIC_MICROSOFT_OAUTH_TENANT_ID,
      });

      persistPendingOAuthRequest(authorizationRequest.pendingRequest);
      window.location.assign(authorizationRequest.authorizationUrl);
    } catch (error) {
      setOauthBusyProvider(null);
      setOauthErrorMessage(
        error instanceof Error && error.message
          ? error.message
          : "Unable to start OAuth authentication.",
      );
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isPending) {
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();

    setOauthErrorMessage(null);

    if (!normalizedEmail || password.length < 6) {
      return;
    }

    if (mode === "login") {
      loginMutation.mutate({ email: normalizedEmail, password });
      return;
    }

    signupMutation.mutate({
      email: normalizedEmail,
      password,
      name: normalizedName || undefined,
    });
  };

  const canSubmit = email.trim().length > 0 && password.length >= 6;
  const isAuthPending = isPending || Boolean(oauthBusyProvider);
  const activeErrorMessage = errorMessage ?? oauthErrorMessage;

  return (
    <section className="relative h-full max-h-full w-full max-w-5xl overflow-hidden rounded-[1.75rem] border border-surface-300/70 bg-white/90 shadow-[0_24px_80px_rgba(23,34,27,0.16)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(84,191,117,0.12),transparent_38%),radial-gradient(circle_at_86%_88%,rgba(23,34,27,0.1),transparent_34%)]" />
      <div className="relative grid h-full lg:grid-cols-[1.04fr_1fr]">
        <aside className="hidden min-h-full flex-col border-r border-white/10 bg-linear-to-b from-surface-900 via-surface-800 to-trust-900 px-8 py-8 text-white lg:flex">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/30 bg-white/10 text-white shadow-sm">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <path d="M12 3 5 6v5c0 5 3.5 8.8 7 10 3.5-1.2 7-5 7-10V6l-7-3Z" />
              <path d="M9.6 11.8 11.2 13.4 14.8 9.8" />
            </svg>
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-trust-100/90">
            {copy[mode].eyebrow}
          </p>
          <h2 className="mt-2 text-3xl font-semibold leading-tight text-white">
            {copy[mode].heading}
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-surface-200">
            {copy[mode].subtitle}
          </p>

          <ul className="mt-6 space-y-3">
            {copy[mode].highlights.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-surface-100">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-semibold text-trust-100">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

        </aside>

        <div className="flex h-full flex-col justify-center p-4 sm:p-6 lg:p-8">
          <header className="mb-5 text-center lg:text-left">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-trust-200 bg-trust-100/80 text-trust-800 shadow-sm">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <rect x="4" y="10" width="16" height="10" rx="2.5" />
                <path d="M8 10V8a4 4 0 0 1 8 0v2" />
              </svg>
            </div>
            <p className="mt-3 text-[0.65rem] font-bold uppercase tracking-[0.24em] text-surface-600">
              ZeroTrust
            </p>
            <h1 className="mt-1.5 text-balance text-2xl font-semibold leading-tight text-surface-900 sm:text-3xl">
              {copy[mode].title}
            </h1>
            <p className="mt-2 text-sm text-surface-600">{copy[mode].subtitle}</p>
          </header>

          <form className="space-y-3.5" onSubmit={onSubmit}>
            {mode === "signup" ? (
              <div>
                <label
                  className="mb-1.5 block px-1 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-surface-600"
                  htmlFor="name"
                >
                  Full Name
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-4.5 w-4.5"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="8" r="3" />
                      <path d="M5 19c1.6-3 4-4.5 7-4.5s5.4 1.5 7 4.5" />
                    </svg>
                  </span>
                  <Input
                    id="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Aarav Sharma"
                    autoComplete="name"
                    className="h-10 rounded-lg border-surface-300/90 bg-surface-100/70 pl-10 pr-4 font-medium text-surface-900 placeholder:text-surface-500 focus-visible:ring-trust-500"
                  />
                </div>
              </div>
            ) : null}

            <div>
              <label
                className="mb-1.5 block px-1 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-surface-600"
                htmlFor="email"
              >
                Email
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4.5 w-4.5"
                    aria-hidden="true"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2.3" />
                    <path d="m4 7 8 6 8-6" />
                  </svg>
                </span>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="h-10 rounded-lg border-surface-300/90 bg-surface-100/70 pl-10 pr-4 font-medium text-surface-900 placeholder:text-surface-500 focus-visible:ring-trust-500"
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between px-1">
                <label
                  className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-surface-600"
                  htmlFor="password"
                >
                  Password
                </label>
                <a
                  href="mailto:support@zerotrust.network"
                  className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-trust-700 transition hover:opacity-75"
                >
                  {copy[mode].helperLabel}
                </a>
              </div>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4.5 w-4.5"
                    aria-hidden="true"
                  >
                    <path d="M8 11V8a4 4 0 1 1 8 0v3" />
                    <rect x="5" y="11" width="14" height="9" rx="2.4" />
                  </svg>
                </span>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className="h-10 rounded-lg border-surface-300/90 bg-surface-100/70 pl-10 pr-4 font-medium text-surface-900 placeholder:text-surface-500 focus-visible:ring-trust-500"
                />
              </div>
            </div>

            {activeErrorMessage ? (
              <p
                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700"
                role="alert"
              >
                {activeErrorMessage}
              </p>
            ) : null}

            <button
              className="group relative flex h-10 w-full items-center justify-center overflow-hidden rounded-xl bg-linear-to-r from-trust-700 via-trust-600 to-trust-500 text-sm font-semibold text-white shadow-[0_14px_26px_rgba(31,135,70,0.3)] transition-all duration-200 hover:shadow-[0_18px_30px_rgba(31,135,70,0.38)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={isAuthPending || !canSubmit}
            >
              <span
                className={cn(
                  "flex items-center gap-2 transition-opacity",
                  isPending ? "opacity-0" : "opacity-100",
                )}
              >
                {copy[mode].submitLabel}
              </span>
              <span
                className={cn(
                  "absolute inset-0 flex items-center justify-center gap-2 transition-opacity",
                  isPending ? "opacity-100" : "opacity-0",
                )}
              >
                <Spinner className="h-4 w-4 border-white/40 border-t-white" />
                {copy[mode].pendingLabel}
              </span>
            </button>

            <div>
              <div className="mb-3 flex items-center gap-2.5">
                <span className="h-px flex-1 bg-surface-300" />
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-surface-500">
                  Or continue with
                </span>
                <span className="h-px flex-1 bg-surface-300" />
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => void onOAuthStart("google")}
                  disabled={isAuthPending || !googleOAuthEnabled}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-surface-300 bg-white px-3 text-sm font-semibold text-surface-800 transition hover:border-surface-400 hover:bg-surface-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                    <path
                      fill="#EA4335"
                      d="M12 10.2v3.9h5.5c-.2 1.2-1.4 3.6-5.5 3.6-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3 14.7 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10c5.8 0 9.6-4.1 9.6-9.8 0-.7-.1-1.3-.2-2H12Z"
                    />
                    <path
                      fill="#34A853"
                      d="M2 12c0 2 0.7 3.8 1.9 5.2l3.1-2.4c-.8-.7-1.3-1.8-1.3-2.8s.5-2.1 1.3-2.8L3.9 6.8C2.7 8.2 2 10 2 12Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M12 22c2.7 0 5-0.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1l-3.2 2.4C5 19.3 8.2 22 12 22Z"
                    />
                    <path
                      fill="#4285F4"
                      d="M21.6 12.2c0-.7-.1-1.3-.2-2H12v3.9h5.5c-.3 1.2-1 2.2-2.1 2.9l3.2 2.5c1.9-1.8 3-4.4 3-7.3Z"
                    />
                  </svg>
                  {oauthBusyProvider === "google" ? "Redirecting..." : "Google"}
                </button>

                <button
                  type="button"
                  onClick={() => void onOAuthStart("microsoft")}
                  disabled={isAuthPending || !microsoftOAuthEnabled}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-surface-300 bg-white px-3 text-sm font-semibold text-surface-800 transition hover:border-surface-400 hover:bg-surface-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                    <rect x="2" y="2" width="9" height="9" fill="#F25022" />
                    <rect x="13" y="2" width="9" height="9" fill="#7FBA00" />
                    <rect x="2" y="13" width="9" height="9" fill="#00A4EF" />
                    <rect x="13" y="13" width="9" height="9" fill="#FFB900" />
                  </svg>
                  {oauthBusyProvider === "microsoft" ? "Redirecting..." : "Microsoft"}
                </button>
              </div>

              {!googleOAuthEnabled || !microsoftOAuthEnabled ? (
                <p className="mt-2 text-xs text-surface-500">
                  Social sign-in will be available once OAuth is set up.
                </p>
              ) : null}
            </div>
          </form>

          <footer className="mt-5 text-center lg:text-left">
            <p className="text-sm text-surface-600">
              {copy[mode].swapPrompt}
              <Link
                href={copy[mode].swapHref}
                className="ml-1.5 font-semibold text-trust-700 underline-offset-4 transition hover:text-trust-800 hover:underline"
              >
                {copy[mode].swapActionLabel}
              </Link>
            </p>

            <div className="mt-4 flex items-center justify-center gap-2 lg:justify-start">
              <span className="h-px w-9 bg-surface-300" />
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-surface-500">
                {copy[mode].securityLabel}
              </span>
              <span className="h-px w-9 bg-surface-300" />
            </div>

            <p className="mt-3 text-xs font-medium text-surface-500">
              Help Center • Privacy • Contact
            </p>
          </footer>
        </div>
      </div>
    </section>
  );
};
