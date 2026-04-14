import type { AuthSession, AuthUser } from "@/types/auth";

const SESSION_STORAGE_KEY = "zt_session_v1";
const SESSION_COOKIE_NAME = "zt_session";
const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7;

let memorySession: AuthSession | null = null;

const canUseBrowserStorage = () => typeof window !== "undefined";

const writeSessionCookie = (active: boolean) => {
  if (!canUseBrowserStorage()) {
    return;
  }

  if (active) {
    document.cookie = `${SESSION_COOKIE_NAME}=1; path=/; max-age=${ONE_WEEK_SECONDS}; SameSite=Lax`;
    return;
  }

  document.cookie = `${SESSION_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
};

const normalizeUser = (value: unknown): AuthUser | null => {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const maybeUser = value as Partial<AuthUser>;
  if (
    typeof maybeUser.id !== "string" ||
    typeof maybeUser.email !== "string" ||
    typeof maybeUser.trustScore !== "number"
  ) {
    return null;
  }

  return {
    id: maybeUser.id,
    email: maybeUser.email,
    name: maybeUser.name ?? null,
    currentRole: maybeUser.currentRole ?? null,
    headline: maybeUser.headline ?? null,
    about: maybeUser.about ?? null,
    profileImageUrl: maybeUser.profileImageUrl ?? null,
    profileBannerUrl: maybeUser.profileBannerUrl ?? null,
    publicProfileUrl: maybeUser.publicProfileUrl ?? null,
    trustScore: maybeUser.trustScore,
  };
};

const normalizeSession = (value: unknown): AuthSession | null => {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const maybeSession = value as Partial<AuthSession>;
  const user = normalizeUser(maybeSession.user);

  if (typeof maybeSession.accessToken !== "string") {
    return null;
  }

  return {
    accessToken: maybeSession.accessToken,
    refreshToken:
      typeof maybeSession.refreshToken === "string"
        ? maybeSession.refreshToken
        : null,
    user,
  };
};

export const persistSession = (session: AuthSession) => {
  memorySession = session;

  if (!canUseBrowserStorage()) {
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  writeSessionCookie(Boolean(session.accessToken));
};

export const readStoredSession = (): AuthSession | null => {
  if (memorySession) {
    return memorySession;
  }

  if (!canUseBrowserStorage()) {
    return null;
  }

  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    const session = normalizeSession(parsed);
    memorySession = session;
    return session;
  } catch {
    return null;
  }
};

export const clearStoredSession = () => {
  memorySession = null;

  if (!canUseBrowserStorage()) {
    return;
  }

  window.localStorage.removeItem(SESSION_STORAGE_KEY);
  writeSessionCookie(false);
};

export const getAccessToken = () => readStoredSession()?.accessToken ?? null;

export const getRefreshToken = () => readStoredSession()?.refreshToken ?? null;

export const updateStoredAccessToken = (accessToken: string) => {
  const currentSession = readStoredSession();
  if (!currentSession) {
    return;
  }

  persistSession({
    ...currentSession,
    accessToken,
  });
};
