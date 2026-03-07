/**
 * Response type guards and safe array/object access for API data.
 */

/**
 * Ensure value is an array; return empty array if not.
 */
export function asArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  return [];
}

/**
 * Safe array from response: (data ?? []) with Array.isArray check.
 */
export function safeArray<T>(data: unknown): T[] {
  const raw = data ?? [];
  return Array.isArray(raw) ? (raw as T[]) : [];
}

/**
 * Safe object from response with optional default.
 */
export function safeObject<T extends Record<string, unknown>>(data: unknown, fallback: T): T {
  if (data !== null && typeof data === "object" && !Array.isArray(data)) {
    return { ...fallback, ...(data as Record<string, unknown>) } as T;
  }
  return fallback;
}
