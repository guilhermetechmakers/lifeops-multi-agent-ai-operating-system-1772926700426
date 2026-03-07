/**
 * LifeOps API client with correlation ID, normalized errors, and type-safe responses.
 */

import { normalizeApiError } from "@/lib/errors/normalize";
import { logApiError } from "@/lib/errors/logger";
import type { APIError } from "@/lib/errors/types";
import { getOrCreateCorrelationId } from "@/lib/api/correlation";
import { CORRELATION_HEADER } from "@/lib/api/correlation";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

function getAuthHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    [CORRELATION_HEADER]: getOrCreateCorrelationId(),
  };
  const token = localStorage.getItem("auth_token");
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export class ApiClientError extends Error implements APIError {
  code: string;
  message: string;
  details?: unknown;
  correlationId?: string;
  retryable?: boolean;
  status?: number;

  constructor(apiError: APIError) {
    super(apiError.message);
    this.name = "ApiClientError";
    this.code = apiError.code;
    this.message = apiError.message;
    this.details = apiError.details;
    this.correlationId = apiError.correlationId;
    this.retryable = apiError.retryable;
    this.status = apiError.status;
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers = { ...getAuthHeaders(), ...(options.headers as Record<string, string>) };

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (err) {
    const normalized = normalizeApiError({
      error: err instanceof Error ? err : String(err),
      endpoint: url,
    });
    logApiError(normalized, { endpoint: url, stack: err instanceof Error ? err.stack : undefined });
    throw new ApiClientError(normalized);
  }

  let body: { data?: T; error?: string; code?: string; message?: string; details?: unknown; correlationId?: string; retryable?: boolean };
  try {
    const text = await response.text();
    body = text ? (JSON.parse(text) as typeof body) : {};
  } catch {
    body = {};
  }

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }
    const normalized = normalizeApiError({
      response,
      body: {
        code: body.code,
        message: body.message ?? body.error,
        details: body.details,
        correlationId: body.correlationId,
        retryable: body.retryable,
      },
      endpoint: url,
    });
    logApiError(normalized, { endpoint: url });
    throw new ApiClientError(normalized);
  }

  if (body.data !== undefined) return body.data as T;
  return body as unknown as T;
}

export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint),
  post: <T>(endpoint: string, data: unknown) =>
    apiRequest<T>(endpoint, { method: "POST", body: JSON.stringify(data) }),
  put: <T>(endpoint: string, data: unknown) =>
    apiRequest<T>(endpoint, { method: "PUT", body: JSON.stringify(data) }),
  patch: <T>(endpoint: string, data: unknown) =>
    apiRequest<T>(endpoint, { method: "PATCH", body: JSON.stringify(data) }),
  delete: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: "DELETE" }),
};

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
}

/**
 * Type guard for ApiClientError.
 */
export function isApiClientError(err: unknown): err is ApiClientError {
  return err instanceof ApiClientError;
}

/**
 * Safe array extraction - use (data ?? []) and Array.isArray before map/filter/reduce.
 */
export { safeArray, safeObject, asArray } from "./api/guards";

/**
 * Extract APIError from unknown (e.g. from catch). Returns undefined if not an API error.
 */
export function asApiError(err: unknown): APIError | undefined {
  if (err instanceof ApiClientError)
    return {
      code: err.code,
      message: err.message,
      details: err.details,
      correlationId: err.correlationId,
      retryable: err.retryable,
      status: err.status,
    };
  return undefined;
}
