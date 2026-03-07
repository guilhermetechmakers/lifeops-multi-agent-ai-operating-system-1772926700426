/**
 * Normalize various error shapes (HTTP, network, timeout, parse) into APIError.
 */

import type { APIError, APIErrorCode, ValidationError } from "./types";
import { ERROR_CODES } from "./types";
import { getMessageForCode } from "./messages";

const CORRELATION_HEADER = "x-correlation-id";

function generateCorrelationId(): string {
  return `corr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export interface NormalizedErrorInput {
  /** Response from fetch (optional, for HTTP errors) */
  response?: Response;
  /** Parsed JSON body if available */
  body?: { code?: string; message?: string; details?: unknown; correlationId?: string; retryable?: boolean };
  /** Original Error or string */
  error?: Error | string;
  /** Override correlation ID */
  correlationId?: string;
  /** Endpoint or URL for logging */
  endpoint?: string;
}

/**
 * Normalize HTTP/network/parse errors into the standard APIError shape.
 */
export function normalizeApiError(input: NormalizedErrorInput): APIError {
  const correlationId =
    input.correlationId ??
    input.body?.correlationId ??
    (typeof input.response?.headers?.get === "function"
      ? input.response.headers.get(CORRELATION_HEADER) ?? undefined
      : undefined) ??
    generateCorrelationId();

  const status = input.response?.status;
  const body = input.body;
  const code = body?.code ?? statusToCode(status);
  const message =
    body?.message ?? (typeof input.error === "string" ? input.error : input.error?.message) ?? getMessageForCode(code as APIErrorCode);
  const retryable = body?.retryable ?? isRetryableStatus(status) ?? false;
  const details = body?.details;

  return {
    code,
    message,
    ...(details !== undefined && { details }),
    correlationId,
    retryable,
    ...(status !== undefined && { status }),
  };
}

function statusToCode(status: number | undefined): string {
  if (status === undefined) return ERROR_CODES.API.INTERNAL_ERROR;
  if (status === 401) return ERROR_CODES.API.UNAUTHORIZED;
  if (status === 403) return ERROR_CODES.API.FORBIDDEN;
  if (status === 404) return ERROR_CODES.API.NOT_FOUND;
  if (status === 408 || status === 504) return ERROR_CODES.API.TIMEOUT;
  if (status === 409) return ERROR_CODES.API.CONFLICT;
  if (status === 422) return ERROR_CODES.API.VALIDATION_FAILED;
  if (status === 429) return ERROR_CODES.API.RATE_LIMITED;
  if (status >= 500) return ERROR_CODES.API.SERVICE_UNAVAILABLE;
  if (status >= 400) return ERROR_CODES.API.INVALID_REQUEST;
  return ERROR_CODES.API.INTERNAL_ERROR;
}

function isRetryableStatus(status: number | undefined): boolean {
  if (status === undefined) return false;
  return status === 408 || status === 429 || status === 502 || status === 503 || status === 504;
}

/**
 * Normalize unknown (e.g. from catch) into APIError.
 * Use when you have a raw error and need the standard shape.
 */
export function normalizeFromUnknown(err: unknown): APIError {
  if (err && typeof err === "object" && "code" in err && "message" in err) {
    const e = err as APIError;
    return {
      code: e.code,
      message: e.message,
      details: e.details,
      correlationId: e.correlationId ?? generateCorrelationId(),
      retryable: e.retryable,
      status: e.status,
    };
  }
  const error = err instanceof Error ? err : new Error(String(err ?? "Unknown error"));
  return normalizeApiError({ error });
}

/**
 * Extract field-level validation errors from API error details.
 */
export function getValidationErrorsFromApiError(error: APIError): ValidationError[] {
  const details = error.details;
  if (!details || typeof details !== "object") return [];
  const arr = Array.isArray((details as { errors?: unknown }).errors)
    ? (details as { errors: ValidationError[] }).errors
    : [];
  return arr.filter(
    (e): e is ValidationError =>
      typeof e === "object" && e !== null && typeof (e as ValidationError).field === "string" && typeof (e as ValidationError).message === "string"
  );
}
