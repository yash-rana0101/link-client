import type { OAuthProvider } from "@/types/auth";

export type OAuthIntent = "login" | "signup";

export interface PendingOAuthRequest {
  provider: OAuthProvider;
  intent: OAuthIntent;
  state: string;
  codeVerifier: string;
  redirectUri: string;
  createdAt: number;
}

interface BuildOAuthAuthorizationRequestInput {
  provider: OAuthProvider;
  intent: OAuthIntent;
  origin: string;
  googleClientId?: string;
  microsoftClientId?: string;
  microsoftTenantId?: string;
}

interface OAuthAuthorizationRequestResult {
  authorizationUrl: string;
  pendingRequest: PendingOAuthRequest;
}

const GOOGLE_AUTHORIZATION_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const OAUTH_STORAGE_KEY = "zt_oauth_pending_v1";

export const OAUTH_REQUEST_MAX_AGE_MS = 10 * 60 * 1000;

const toBase64Url = (bytes: Uint8Array): string => {
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

const randomBase64Url = (byteLength: number): string => {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
};

const createCodeVerifier = (): string => randomBase64Url(64).slice(0, 128);

const createOAuthState = (): string => randomBase64Url(24);

const createCodeChallenge = async (codeVerifier: string): Promise<string> => {
  const encodedVerifier = new TextEncoder().encode(codeVerifier);
  const digest = await crypto.subtle.digest("SHA-256", encodedVerifier);

  return toBase64Url(new Uint8Array(digest));
};

const normalizeOrigin = (origin: string): string => origin.replace(/\/$/, "");

const resolveMicrosoftTenantId = (tenantId?: string): string => {
  const normalized = tenantId?.trim() || "common";

  if (/^[a-zA-Z0-9.-]+$/.test(normalized)) {
    return normalized;
  }

  return "common";
};

const buildRedirectUri = (origin: string): string => `${normalizeOrigin(origin)}/oauth/callback`;

const parsePendingRequest = (rawValue: string): PendingOAuthRequest | null => {
  try {
    const parsed = JSON.parse(rawValue) as Partial<PendingOAuthRequest>;

    if (
      (parsed.provider !== "google" && parsed.provider !== "microsoft") ||
      (parsed.intent !== "login" && parsed.intent !== "signup") ||
      typeof parsed.state !== "string" ||
      typeof parsed.codeVerifier !== "string" ||
      typeof parsed.redirectUri !== "string" ||
      typeof parsed.createdAt !== "number"
    ) {
      return null;
    }

    return {
      provider: parsed.provider,
      intent: parsed.intent,
      state: parsed.state,
      codeVerifier: parsed.codeVerifier,
      redirectUri: parsed.redirectUri,
      createdAt: parsed.createdAt,
    };
  } catch {
    return null;
  }
};

export const buildOAuthAuthorizationRequest = async (
  input: BuildOAuthAuthorizationRequestInput,
): Promise<OAuthAuthorizationRequestResult> => {
  const redirectUri = buildRedirectUri(input.origin);
  const state = createOAuthState();
  const codeVerifier = createCodeVerifier();
  const codeChallenge = await createCodeChallenge(codeVerifier);

  if (input.provider === "google") {
    const clientId = input.googleClientId?.trim();

    if (!clientId) {
      throw new Error("Google OAuth is not configured. Add NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID.");
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      prompt: "select_account",
      include_granted_scopes: "true",
    });

    return {
      authorizationUrl: `${GOOGLE_AUTHORIZATION_ENDPOINT}?${params.toString()}`,
      pendingRequest: {
        provider: "google",
        intent: input.intent,
        state,
        codeVerifier,
        redirectUri,
        createdAt: Date.now(),
      },
    };
  }

  const clientId = input.microsoftClientId?.trim();

  if (!clientId) {
    throw new Error(
      "Microsoft OAuth is not configured. Add NEXT_PUBLIC_MICROSOFT_OAUTH_CLIENT_ID.",
    );
  }

  const tenantId = resolveMicrosoftTenantId(input.microsoftTenantId);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    response_mode: "query",
    scope: "openid profile email User.Read",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  });

  return {
    authorizationUrl: `https://login.microsoftonline.com/${encodeURIComponent(tenantId)}/oauth2/v2.0/authorize?${params.toString()}`,
    pendingRequest: {
      provider: "microsoft",
      intent: input.intent,
      state,
      codeVerifier,
      redirectUri,
      createdAt: Date.now(),
    },
  };
};

export const persistPendingOAuthRequest = (request: PendingOAuthRequest): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(OAUTH_STORAGE_KEY, JSON.stringify(request));
};

export const readPendingOAuthRequest = (): PendingOAuthRequest | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.sessionStorage.getItem(OAUTH_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  return parsePendingRequest(rawValue);
};

export const clearPendingOAuthRequest = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(OAUTH_STORAGE_KEY);
};
