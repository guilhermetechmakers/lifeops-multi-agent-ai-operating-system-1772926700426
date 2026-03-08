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

/**
 * Safe map — never call on null/undefined; returns [] if not array.
 */
export function safeMap<T, U>(data: unknown, fn: (item: T, index: number) => U): U[] {
  const arr = data ?? [];
  return Array.isArray(arr) ? (arr as T[]).map(fn) : [];
}

/**
 * Safe filter — never call on null/undefined; returns [] if not array.
 */
export function safeFilter<T>(data: unknown, fn: (item: T, index: number) => boolean): T[] {
  const arr = data ?? [];
  return Array.isArray(arr) ? (arr as T[]).filter(fn) : [];
}

/**
 * Safe reduce — never call on null/undefined; returns initial if not array.
 */
export function safeReduce<T, U>(
  data: unknown,
  fn: (acc: U, item: T, index: number) => U,
  initial: U
): U {
  const arr = data ?? [];
  return Array.isArray(arr) ? (arr as T[]).reduce(fn, initial) : initial;
}
