"use client";

import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import {
  clearStoredSession,
  persistSession,
  readStoredSession,
} from "@/services/session";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import { clearSession, setSession } from "@/store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type {
  AuthResponse,
  LoginPayload,
  OAuthCallbackPayload,
  OAuthProvider,
  SignupPayload,
} from "@/types/auth";

const handleSuccessSession = (
  dispatch: ReturnType<typeof useAppDispatch>,
  result: AuthResponse,
) => {
  persistSession({
    accessToken: result.tokens.accessToken,
    refreshToken: result.tokens.refreshToken,
    user: result.user,
  });

  dispatch(
    setSession({
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
      user: result.user,
    }),
  );
};

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();
  const authState = useAppSelector((state) => state.auth);

  const onAuthSuccess = useCallback(
    (result: AuthResponse) => {
      handleSuccessSession(dispatch, result);
      connectSocket(result.tokens.accessToken, result.user.id);
      router.push("/feed");
    },
    [dispatch, router],
  );

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: onAuthSuccess,
  });

  const signupMutation = useMutation({
    mutationFn: (payload: SignupPayload) => authService.signup(payload),
    onSuccess: onAuthSuccess,
  });

  const authenticateWithOAuth = useCallback(
    async (provider: OAuthProvider, payload: OAuthCallbackPayload) => {
      const result =
        provider === "google"
          ? await authService.oauthGoogle(payload)
          : await authService.oauthMicrosoft(payload);

      onAuthSuccess(result);
      return result;
    },
    [onAuthSuccess],
  );

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const refreshToken =
        authState.refreshToken ?? readStoredSession()?.refreshToken;

      if (refreshToken) {
        try {
          await authService.logout(refreshToken);
        } catch {
          // Logout should finish locally even if server call fails.
        }
      }
    },
    onSettled: () => {
      disconnectSocket();
      clearStoredSession();
      dispatch(clearSession());
      queryClient.clear();
      router.push("/login");
    },
  });

  return {
    loginMutation,
    signupMutation,
    authenticateWithOAuth,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
    isAuthenticated: Boolean(authState.accessToken && authState.user),
    user: authState.user,
  };
};
