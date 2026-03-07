/**
 * Central log collector for API errors. Sanitizes data and masks PII.
 * Can be extended to emit to analytics/log service.
 */

import type { APIError } from "./types";

const PII_KEYS = new Set(["password", "token", "email", "authorization", "cookie", "secret"]);

function maskPayload(payload: unknown): unknown {
  if (payload === null || typeof payload !== "object") return payload;
  if (Array.isArray(payload)) return payload.map(maskPayload);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(payload)) {
    const keyLower = k.toLowerCase();
    if (PII_KEYS.has(keyLower) || keyLower.includes("password") || keyLower.includes("token")) {
      out[k] = "[REDACTED]";
    } else {
      out[k] = maskPayload(v);
    }
  }
  return out;
}

export interface LogApiErrorOptions {
  endpoint?: string;
  payload?: unknown;
  stack?: string;
}

/**
 * Persist or emit API error to analytics/log service.
 * In development, logs to console; in production can send to backend.
 */
export function logApiError(error: APIError, options: LogApiErrorOptions = {}): void {
  const { endpoint, payload, stack } = options;
  const entry = {
    correlationId: error.correlationId,
    code: error.code,
    message: error.message,
    status: error.status,
    endpoint,
    payload: payload !== undefined ? maskPayload(payload) : undefined,
    stack: stack ?? (error instanceof Error ? (error as Error).stack : undefined),
    timestamp: new Date().toISOString(),
  };
  if (import.meta.env.DEV) {
    console.error("[LifeOps API Error]", entry);
  }
  // TODO: send to backend/analytics when available
  // e.g. sendBeacon('/api/v1/logs/errors', JSON.stringify(entry));
}
