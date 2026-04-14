export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  currentRole?: string | null;
  headline?: string | null;
  about?: string | null;
  profileImageUrl?: string | null;
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

export interface AuthSession {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
}
