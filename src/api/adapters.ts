/**
 * Adapters API client: CRUD, test, run, rotate credential, telemetry, health.
 * Uses api from @/lib/api. All responses use safe array/object handling.
 */

import { api, safeArray } from "@/lib/api";
import type {
  AdapterInstance,
  CreateAdapterInput,
  UpdateAdapterInput,
  TestAdapterResult,
  RunAdapterInput,
  RunAdapterResult,
  TelemetryEvent,
  HealthStatus,
} from "@/types/adapters";

const BASE = "/adapters";

function asList<T>(r: unknown): T[] {
  const raw = Array.isArray(r) ? r : (r as { data?: T[] })?.data;
  return safeArray<T>(raw);
}

export const adaptersApi = {
  list: async (): Promise<AdapterInstance[]> => {
    const r = await api.get<AdapterInstance[] | { data?: AdapterInstance[] }>(BASE);
    return asList<AdapterInstance>(r);
  },

  get: async (id: string): Promise<AdapterInstance | null> => {
    const r = await api.get<AdapterInstance | null>(`${BASE}/${id}`);
    return r ?? null;
  },

  create: async (input: CreateAdapterInput): Promise<AdapterInstance> => {
    const r = await api.post<AdapterInstance>(BASE, input);
    if (!r || typeof r !== "object") throw new Error("Invalid adapter response");
    return r as AdapterInstance;
  },

  update: async (id: string, input: UpdateAdapterInput): Promise<AdapterInstance> => {
    const r = await api.put<AdapterInstance>(`${BASE}/${id}`, input);
    if (!r || typeof r !== "object") throw new Error("Invalid adapter response");
    return r as AdapterInstance;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`${BASE}/${id}`);
  },

  test: async (id: string): Promise<TestAdapterResult> => {
    const r = await api.post<TestAdapterResult>(`${BASE}/${id}/test`, {});
    return r ?? { ok: false, message: "Unknown error" };
  },

  run: async (id: string, input: RunAdapterInput): Promise<RunAdapterResult> => {
    const r = await api.post<RunAdapterResult>(`${BASE}/${id}/run`, input);
    return r ?? { runId: "", status: "failed", error: "Unknown error" };
  },

  rotateCredential: async (id: string): Promise<{ credentialsRef: string }> => {
    const r = await api.post<{ credentialsRef: string }>(`${BASE}/${id}/rotate-credential`, {});
    return r ?? { credentialsRef: "" };
  },

  getTelemetry: async (): Promise<TelemetryEvent[]> => {
    const r = await api.get<TelemetryEvent[] | { data?: TelemetryEvent[] }>("/telemetry/adapters");
    return asList<TelemetryEvent>(r);
  },

  getHealth: async (): Promise<HealthStatus[]> => {
    const r = await api.get<HealthStatus[] | { data?: HealthStatus[] }>("/health/adapters");
    return asList<HealthStatus>(r);
  },
};
