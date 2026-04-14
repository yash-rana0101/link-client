import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import {
  clearStoredSession,
  getAccessToken,
  getRefreshToken,
  persistSession,
  readStoredSession,
} from "@/services/session";
import type { ApiClientError } from "@/types/api";
import { isApiEnvelope } from "@/types/api";
import type { AuthResponse } from "@/types/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const normalizeApiError = (error: unknown): ApiClientError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      message:
        axiosError.response?.data?.message ??
        axiosError.message ??
        "Request failed",
      statusCode: axiosError.response?.status,
      details: axiosError.response?.data,
    };
  }

  return {
    message: "An unexpected error occurred.",
  };
};

const extractEnvelopeData = <T>(payload: unknown): T => {
  if (isApiEnvelope<T>(payload)) {
    return payload.data;
  }

  return payload as T;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let subscribers: Array<(nextToken: string | null) => void> = [];

const notifySubscribers = (nextToken: string | null) => {
  subscribers.forEach((callback) => callback(nextToken));
  subscribers = [];
};

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    if (!config.headers) {
      config.headers = new AxiosHeaders();
    }

    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const axiosError = error as AxiosError;
    const originalRequest = axiosError.config as RetryableRequestConfig | undefined;

    if (
      axiosError.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearStoredSession();
        return Promise.reject(normalizeApiError(error));
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribers.push((nextToken) => {
            if (!nextToken) {
              reject(normalizeApiError(error));
              return;
            }

            if (!originalRequest.headers) {
              originalRequest.headers = new AxiosHeaders();
            }

            originalRequest.headers.Authorization = `Bearer ${nextToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post<unknown>(
          `${API_BASE_URL}/auth/refresh`,
          {
            refreshToken,
          },
        );

        const refreshedSession = extractEnvelopeData<AuthResponse>(
          refreshResponse.data,
        );

        const currentSession = readStoredSession();
        const nextRefreshToken =
          refreshedSession.tokens.refreshToken ??
          currentSession?.refreshToken ??
          refreshToken;

        persistSession({
          accessToken: refreshedSession.tokens.accessToken,
          refreshToken: nextRefreshToken,
          user: refreshedSession.user ?? currentSession?.user ?? null,
        });

        notifySubscribers(refreshedSession.tokens.accessToken);

        if (!originalRequest.headers) {
          originalRequest.headers = new AxiosHeaders();
        }

        originalRequest.headers.Authorization = `Bearer ${refreshedSession.tokens.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        clearStoredSession();
        notifySubscribers(null);
        return Promise.reject(normalizeApiError(refreshError));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizeApiError(error));
  },
);

export const unwrapData = <T>(response: AxiosResponse<unknown>): T =>
  extractEnvelopeData<T>(response.data);

export { api, normalizeApiError };
