/**
 * Centralized API error format and related types for LifeOps.
 * Shared between client and server for consistent error handling.
 */

export interface APIError {
  code: string;
  message: string;
  details?: unknown;
  correlationId?: string;
  retryable?: boolean;
  status?: number;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface LoadingState {
  status: "idle" | "loading" | "success" | "error";
  message?: string;
  correlationId?: string;
}

/** Diagnostic payload for expanded error view */
export interface ErrorDiagnostics {
  correlationId?: string;
  timestamp?: string;
  endpoint?: string;
  snippet?: string;
}

/** Canonical error codes */
export const ERROR_CODES = {
  API: {
    INVALID_REQUEST: "INVALID_REQUEST",
    VALIDATION_FAILED: "VALIDATION_FAILED",
    UNAUTHORIZED: "UNAUTHORIZED",
    FORBIDDEN: "FORBIDDEN",
    NOT_FOUND: "NOT_FOUND",
    CONFLICT: "CONFLICT",
    RATE_LIMITED: "RATE_LIMITED",
    INTERNAL_ERROR: "INTERNAL_ERROR",
    SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
    TIMEOUT: "TIMEOUT",
  },
  APP_LOGIC: {
    MISSING_DEPENDENCY: "MISSING_DEPENDENCY",
    INVALID_STATE: "INVALID_STATE",
    ACTION_NOT_ALLOWED: "ACTION_NOT_ALLOWED",
  },
} as const;

export type APIErrorCode =
  | (typeof ERROR_CODES.API)[keyof typeof ERROR_CODES.API]
  | (typeof ERROR_CODES.APP_LOGIC)[keyof typeof ERROR_CODES.APP_LOGIC];
