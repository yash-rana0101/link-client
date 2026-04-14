import { api, unwrapData } from "@/services/api";
import type {
  AuthResponse,
  AuthUser,
  LoginPayload,
  OAuthCallbackPayload,
  SignupPayload,
} from "@/types/auth";

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await api.post<unknown>("/auth/login", payload);
    return unwrapData<AuthResponse>(response);
  },

  signup: async (payload: SignupPayload): Promise<AuthResponse> => {
    const response = await api.post<unknown>("/auth/signup", payload);
    return unwrapData<AuthResponse>(response);
  },

  oauthGoogle: async (payload: OAuthCallbackPayload): Promise<AuthResponse> => {
    const response = await api.post<unknown>("/auth/oauth/google", payload);
    return unwrapData<AuthResponse>(response);
  },

  oauthMicrosoft: async (payload: OAuthCallbackPayload): Promise<AuthResponse> => {
    const response = await api.post<unknown>("/auth/oauth/microsoft", payload);
    return unwrapData<AuthResponse>(response);
  },

  logout: async (refreshToken: string): Promise<void> => {
    await api.post("/auth/logout", {
      refreshToken,
    });
  },

  getMe: async (): Promise<AuthUser> => {
    const response = await api.get<unknown>("/user/me");
    return unwrapData<AuthUser>(response);
  },
};
