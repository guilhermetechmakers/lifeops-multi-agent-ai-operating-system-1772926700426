/**
 * Correlation ID generation and storage for request tracing.
 */

const STORAGE_KEY = "lifeops_correlation_id";

export function getOrCreateCorrelationId(): string {
  let id = sessionStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = `corr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

export function setCorrelationId(id: string): void {
  sessionStorage.setItem(STORAGE_KEY, id);
}

export const CORRELATION_HEADER = "X-Correlation-Id";
