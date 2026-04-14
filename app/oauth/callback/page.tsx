"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui/Spinner";
import {
  OAUTH_REQUEST_MAX_AGE_MS,
  clearPendingOAuthRequest,
  readPendingOAuthRequest,
} from "@/features/auth/oauth";
import { useAuth } from "@/features/auth/useAuth";
import type { OAuthProvider } from "@/types/auth";

type CallbackStatus =
  | {
    kind: "loading";
    title: string;
    message: string;
  }
  | {
    kind: "error";
    title: string;
    message: string;
    returnHref: "/login" | "/signup";
  };

const providerLabel: Record<OAuthProvider, string> = {
  google: "Google",
  microsoft: "Microsoft",
};

const fallbackErrorMessage = "Could not complete authentication. Please try again.";

const LoadingStateCard = () => (
  <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-app px-4 py-12 sm:px-6">
    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(130deg,rgba(123,214,148,0.12),transparent_40%),linear-gradient(-140deg,rgba(23,34,27,0.12),transparent_45%)]" />
    <section className="relative w-full max-w-md rounded-3xl border border-surface-300/80 bg-white/95 p-8 text-center shadow-[0_24px_80px_rgba(23,34,27,0.18)] backdrop-blur-sm">
      <Spinner className="mx-auto h-6 w-6 border-surface-300 border-t-trust-600" />
      <h1 className="mt-5 text-2xl font-semibold text-surface-900">Securing your identity</h1>
      <p className="mt-2 text-sm text-surface-600">
        Completing authentication with your provider...
      </p>
    </section>
  </main>
);

const OAuthCallbackContent = () => {
  const searchParams = useSearchParams();
  const { authenticateWithOAuth } = useAuth();
  const hasProcessedRef = useRef(false);
  const [status, setStatus] = useState<CallbackStatus>({
    kind: "loading",
    title: "Securing your identity",
    message: "Completing authentication with your provider...",
  });

  useEffect(() => {
    if (hasProcessedRef.current) {
      return;
    }

    hasProcessedRef.current = true;

    const completeOAuth = async () => {
      const providerError = searchParams.get("error");
      const providerErrorDescription = searchParams.get("error_description");
      const code = searchParams.get("code");
      const state = searchParams.get("state");

      const pendingRequest = readPendingOAuthRequest();
      const returnHref = pendingRequest?.intent === "signup" ? "/signup" : "/login";

      const fail = (message: string) => {
        clearPendingOAuthRequest();
        setStatus({
          kind: "error",
          title: "Authentication failed",
          message,
          returnHref,
        });
      };

      if (providerError) {
        fail(providerErrorDescription || "Authentication was canceled by the provider.");
        return;
      }

      if (!pendingRequest) {
        fail("OAuth session is missing. Start again from login or signup.");
        return;
      }

      if (!code || !state) {
        fail("Missing OAuth callback parameters. Please try again.");
        return;
      }

      if (state !== pendingRequest.state) {
        fail("OAuth state mismatch detected. Please retry authentication.");
        return;
      }

      if (Date.now() - pendingRequest.createdAt > OAUTH_REQUEST_MAX_AGE_MS) {
        fail("OAuth session expired. Please restart the sign-in flow.");
        return;
      }

      setStatus({
        kind: "loading",
        title: `Finalizing ${providerLabel[pendingRequest.provider]} authentication`,
        message: "Establishing your secure ZeroTrust session...",
      });

      try {
        await authenticateWithOAuth(pendingRequest.provider, {
          code,
          redirectUri: pendingRequest.redirectUri,
          codeVerifier: pendingRequest.codeVerifier,
        });

        clearPendingOAuthRequest();
      } catch (error) {
        const message =
          error instanceof Error && error.message ? error.message : fallbackErrorMessage;

        fail(message);
      }
    };

    void completeOAuth();
  }, [authenticateWithOAuth, searchParams]);

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-app px-4 py-12 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(130deg,rgba(123,214,148,0.12),transparent_40%),linear-gradient(-140deg,rgba(23,34,27,0.12),transparent_45%)]" />
      <section className="relative w-full max-w-md rounded-3xl border border-surface-300/80 bg-white/95 p-8 text-center shadow-[0_24px_80px_rgba(23,34,27,0.18)] backdrop-blur-sm">
        {status.kind === "loading" ? (
          <>
            <Spinner className="mx-auto h-6 w-6 border-surface-300 border-t-trust-600" />
            <h1 className="mt-5 text-2xl font-semibold text-surface-900">{status.title}</h1>
            <p className="mt-2 text-sm text-surface-600">{status.message}</p>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-red-700">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M12 8v5" />
                <path d="M12 16h.01" />
                <path d="M10.3 3.8 1.8 18.2A1.2 1.2 0 0 0 2.8 20h18.4a1.2 1.2 0 0 0 1-1.8L13.7 3.8a1.2 1.2 0 0 0-2 0Z" />
              </svg>
            </div>
            <h1 className="mt-5 text-2xl font-semibold text-surface-900">{status.title}</h1>
            <p className="mt-2 text-sm text-surface-600">{status.message}</p>
            <Link
              href={status.returnHref}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-trust-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-trust-700"
            >
              Return to authentication
            </Link>
          </>
        )}
      </section>
    </main>
  );
};

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingStateCard />}>
      <OAuthCallbackContent />
    </Suspense>
  );
}
