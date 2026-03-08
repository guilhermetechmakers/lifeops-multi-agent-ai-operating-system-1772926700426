/**
 * Health APIs Adapter — Normalization layer for HealthKit and Google Fit.
 * Unifies disparate data shapes into HealthDataPoint[] for ingest.
 * Used by POST /api/health/ingest; run client-side before sending or in Edge Function.
 */

import type { HealthDataSource, HealthDataPoint } from "@/types/health";

/** Raw HealthKit sample shape (example) */
export interface HealthKitSample {
  type?: string;
  value?: number | string | Record<string, unknown>;
  startDate?: string;
  endDate?: string;
  unit?: string;
}

/** Raw Google Fit data point (example) */
export interface GoogleFitPoint {
  dataTypeName?: string;
  value?: Array<{ intVal?: number; fpVal?: number }>;
  startTimeNanos?: string;
  endTimeNanos?: string;
}

function safeArray<T>(x: unknown): T[] {
  if (Array.isArray(x)) return x as T[];
  return [];
}

function isoFromNanos(nanos: string | undefined): string {
  if (!nanos) return new Date().toISOString();
  const n = Number(BigInt(nanos) / BigInt(1e6));
  return new Date(n).toISOString();
}

/**
 * Normalize HealthKit payload into HealthDataPoint[].
 * Guards against null/undefined; returns [] for invalid input.
 */
export function normalizeHealthKit(
  userId: string,
  payload: unknown
): HealthDataPoint[] {
  const data = payload ?? {};
  if (typeof data !== "object" || Array.isArray(data)) return [];
  const samples = safeArray<HealthKitSample>(
    (data as Record<string, unknown>).samples ?? (data as Record<string, unknown>).data
  );
  return samples
    .filter((s) => s != null && (s.value !== undefined || s.startDate))
    .map((s) => ({
      userId,
      source: "healthkit" as HealthDataSource,
      type: (s as HealthKitSample).type ?? "unknown",
      timestamp: (s as HealthKitSample).startDate ?? (s as HealthKitSample).endDate ?? new Date().toISOString(),
      value: (s as HealthKitSample).value ?? 0,
    }));
}

/**
 * Normalize Google Fit payload into HealthDataPoint[].
 * Guards against null/undefined; returns [] for invalid input.
 */
export function normalizeGoogleFit(
  userId: string,
  payload: unknown
): HealthDataPoint[] {
  const data = payload ?? {};
  if (typeof data !== "object" || Array.isArray(data)) return [];
  const points = safeArray<GoogleFitPoint>(
    (data as Record<string, unknown>).point ?? (data as Record<string, unknown>).data
  );
  const out: HealthDataPoint[] = [];
  for (const p of points) {
    if (!p || typeof p !== "object") continue;
    const type = (p as GoogleFitPoint).dataTypeName ?? "unknown";
    const start = (p as GoogleFitPoint).startTimeNanos;
    const end = (p as GoogleFitPoint).endTimeNanos;
    const timestamp = isoFromNanos(start || end);
    const vals = safeArray<{ fpVal?: number; intVal?: number }>((p as GoogleFitPoint).value);
    const first = vals[0];
    const value =
      first !== undefined
        ? (first.fpVal ?? first.intVal ?? 0)
        : 0;
    out.push({ userId, source: "google_fit", type, timestamp, value });
  }
  return out;
}

/**
 * Normalize by source; returns unified HealthDataPoint[].
 */
export function normalizeHealthPayload(
  source: HealthDataSource,
  userId: string,
  payload: unknown
): HealthDataPoint[] {
  if (!userId || typeof userId !== "string") return [];
  switch (source) {
    case "healthkit":
      return normalizeHealthKit(userId, payload);
    case "google_fit":
      return normalizeGoogleFit(userId, payload);
    default:
      return [];
  }
}
