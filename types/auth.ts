export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  currentRole?: string | null;
  headline?: string | null;
  about?: string | null;
  profileImageUrl?: string | null;
  profileBannerUrl?: string | null;
  publicProfileUrl?: string | null;
  trustScore: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  email: string;
  password: string;
  name?: string;
}

export type OAuthProvider = "google" | "microsoft";

export interface OAuthCallbackPayload {
  code: string;
  redirectUri?: string;
  codeVerifier?: string;
}

export interface AuthSession {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
}
