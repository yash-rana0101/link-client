"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/features/auth/useAuth";

type AuthMode = "login" | "signup";

interface AuthFormProps {
  mode: AuthMode;
}

const copy: Record<
  AuthMode,
  {
    title: string;
    subtitle: string;
    submitLabel: string;
    swapLabel: string;
    swapHref: string;
  }
> = {
  login: {
    title: "Welcome back",
    subtitle: "Sign in to continue building your trust graph.",
    submitLabel: "Log In",
    swapLabel: "Need an account? Create one",
    swapHref: "/signup",
  },
  signup: {
    title: "Create your profile",
    subtitle: "Start with a verified identity-first profile.",
    submitLabel: "Sign Up",
    swapLabel: "Already have an account? Log in",
    swapHref: "/login",
  },
};

export const AuthForm = ({ mode }: AuthFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loginMutation, signupMutation } = useAuth();

  const isPending =
    mode === "login" ? loginMutation.isPending : signupMutation.isPending;

  const errorMessage =
    (mode === "login" ? loginMutation.error : signupMutation.error)?.message ??
    null;

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (mode === "login") {
      loginMutation.mutate({ email, password });
      return;
    }

    signupMutation.mutate({
      email,
      password,
      name: name || undefined,
    });
  };

  return (
    <Card className="w-full max-w-md border-surface-200 bg-white/95">
      <CardHeader className="mb-0 block">
        <CardTitle className="text-2xl">{copy[mode].title}</CardTitle>
        <p className="mt-2 text-sm text-surface-600">{copy[mode].subtitle}</p>
      </CardHeader>
      <CardBody>
        <form className="space-y-4" onSubmit={onSubmit}>
          {mode === "signup" ? (
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700">
                Full Name
              </label>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Aarav Sharma"
                autoComplete="name"
              />
            </div>
          ) : null}
          <div>
            <label className="mb-1 block text-sm font-medium text-surface-700">
              Email
            </label>
            <Input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@domain.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-surface-700">
              Password
            </label>
            <Input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>
          {errorMessage ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </p>
          ) : null}
          <Button className="w-full" type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Spinner className="mr-2 h-4 w-4 border-white/40 border-t-white" />
                Working...
              </>
            ) : (
              copy[mode].submitLabel
            )}
          </Button>
        </form>
        <Link
          href={copy[mode].swapHref}
          className="mt-4 inline-block text-sm font-medium text-trust-700 hover:text-trust-800"
        >
          {copy[mode].swapLabel}
        </Link>
      </CardBody>
    </Card>
  );
};
