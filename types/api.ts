export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiPageInfo {
  nextCursor: string | null;
  hasMore: boolean;
  limit: number;
}

export interface ApiClientError {
  message: string;
  statusCode?: number;
  details?: unknown;
}

export const isApiEnvelope = <T>(value: unknown): value is ApiEnvelope<T> => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const maybeEnvelope = value as Partial<ApiEnvelope<T>>;
  return typeof maybeEnvelope.success === "boolean" && "data" in maybeEnvelope;
};
