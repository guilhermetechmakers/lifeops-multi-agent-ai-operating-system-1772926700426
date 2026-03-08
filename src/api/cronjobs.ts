/**
 * Cronjobs API client. All responses consumed with nullish coalescing and safe arrays.
 */

import { api } from "@/lib/api";
import type {
  Cronjob,
  CronjobRun,
  CronjobListParams,
  CronjobListResponse,
  CreateCronjobInput,
  UpdateCronjobInput,
  BulkCronjobAction,
} from "@/types/cronjob";

const BASE = "cronjobs";

function safeList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && "data" in (data as Record<string, unknown>)) {
    const d = (data as { data: unknown }).data;
    return Array.isArray(d) ? (d as T[]) : [];
  }
  return [];
}

function buildQuery(params: CronjobListParams): string {
  const q = new URLSearchParams();
  if (params.search != null && params.search !== "") q.set("search", params.search);
  if (params.page != null) q.set("page", String(params.page));
  if (params.pageSize != null) q.set("pageSize", String(params.pageSize));
  if (params.sort != null) q.set("sort", params.sort);
  if (params.module != null) q.set("module", params.module);
  if (params.owner != null) q.set("owner", params.owner);
  if (params.status != null) q.set("status", params.status);
  if (params.tag != null) q.set("tag", params.tag);
  if (params.nextRunAfter != null) q.set("nextRunAfter", params.nextRunAfter);
  if (params.nextRunBefore != null) q.set("nextRunBefore", params.nextRunBefore);
  if (params.lastRunAfter != null) q.set("lastRunAfter", params.lastRunAfter);
  if (params.lastRunBefore != null) q.set("lastRunBefore", params.lastRunBefore);
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const cronjobsApi = {
  getList: (params: CronjobListParams = {}) =>
    api
      .get<CronjobListResponse | Cronjob[]>(`${BASE}${buildQuery(params)}`)
      .then((r) => {
        if (r && typeof r === "object" && "data" in (r as unknown as Record<string, unknown>)) {
          const res = r as CronjobListResponse;
          return {
            data: safeList<Cronjob>(res.data),
            count: res.count ?? 0,
            page: res.page ?? 1,
            pageSize: res.pageSize ?? 20,
          };
        }
        const list = safeList<Cronjob>(r);
        return { data: list, count: list.length, page: 1, pageSize: list.length };
      }),

  get: (id: string) => api.get<Cronjob>(`${BASE}/${id}`),

  create: (payload: CreateCronjobInput) => api.post<Cronjob>(`${BASE}`, payload),

  update: (id: string, payload: UpdateCronjobInput) =>
    api.put<Cronjob>(`${BASE}/${id}`, payload),

  patch: (id: string, payload: UpdateCronjobInput) =>
    api.patch<Cronjob>(`${BASE}/${id}`, payload),

  delete: (id: string) => api.delete<unknown>(`${BASE}/${id}`),

  runNow: (id: string) => api.post<CronjobRun>(`${BASE}/${id}/run-now`, {}),

  bulk: (payload: BulkCronjobAction) =>
    api.post<{ updated: number; errors?: string[] }>(`${BASE}/bulk`, payload),

  getRuns: (id: string, params?: { status?: string; from?: string; to?: string }) => {
    const q = params
      ? "?" + new URLSearchParams(params as Record<string, string>).toString()
      : "";
    return api
      .get<CronjobRun[]>(`${BASE}/${id}/runs${q}`)
      .then((r) => safeList<CronjobRun>(r ?? []));
  },

  getAlerts: () =>
    api
      .get<{ items: unknown[] }>(`${BASE}/alerts`)
      .then((r) => (Array.isArray((r as { items?: unknown[] })?.items) ? (r as { items: unknown[] }).items : [])),

  validate: (id: string, payload?: Record<string, unknown>) =>
    api.post<{ valid: boolean; errors?: string[] }>(`${BASE}/${id}/validate`, payload ?? {}),

  preview: (payload: Record<string, unknown>) =>
    api.post<{
      valid: boolean;
      estimatedCost?: number;
      estimatedDurationMs?: number;
      conflicts?: string[];
      errors?: string[];
      nextRunPreview?: string;
    }>(`${BASE}/preview`, payload),
};
