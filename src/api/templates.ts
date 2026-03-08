/**
 * Templates API client.
 * All responses consumed with nullish coalescing and safe arrays.
 */

import { api } from "@/lib/api";
import { safeArray } from "@/lib/api";
import type {
  AgentTemplate,
  TemplateVersion,
  TemplateListParams,
  TemplateListResponse,
} from "@/types/templates-personas";

const BASE = "/templates";

function safeList<T>(data: unknown): T[] {
  const arr = data ?? [];
  return Array.isArray(arr) ? (arr as T[]) : [];
}

type CreateTemplatePayload = Partial<AgentTemplate>;
type UpdateTemplatePayload = Partial<AgentTemplate>;

function buildQuery(params: TemplateListParams): string {
  const q = new URLSearchParams();
  if (params.search != null && params.search !== "") q.set("search", params.search);
  if (params.domain != null) q.set("domain", params.domain);
  if (params.status != null) q.set("status", params.status);
  if (params.page != null) q.set("page", String(params.page));
  if (params.pageSize != null) q.set("pageSize", String(params.pageSize));
  if (params.sort != null) q.set("sort", params.sort);
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const templatesApi = {
  getList: (params: TemplateListParams = {}) =>
    api
      .get<TemplateListResponse | AgentTemplate[]>(`${BASE}${buildQuery(params)}`)
      .then((r) => {
        if (r && typeof r === "object" && "data" in (r as unknown as Record<string, unknown>)) {
          const res = r as TemplateListResponse;
          return {
            data: safeList<AgentTemplate>(res.data ?? []),
            count: res.count ?? 0,
            page: res.page ?? 1,
            pageSize: res.pageSize ?? 20,
          };
        }
        const list = safeList<AgentTemplate>(r);
        return { data: list, count: list.length, page: 1, pageSize: list.length };
      }),

  get: (id: string) => api.get<AgentTemplate>(`${BASE}/${id}`),

  create: (payload: CreateTemplatePayload) => api.post<AgentTemplate>(`${BASE}`, payload),

  update: (id: string, payload: UpdateTemplatePayload) =>
    api.put<AgentTemplate>(`${BASE}/${id}`, payload),

  delete: (id: string) => api.delete<unknown>(`${BASE}/${id}`),

  getVersions: (id: string) =>
    api
      .get<TemplateVersion[]>(`${BASE}/${id}/versions`)
      .then((r) => safeArray<TemplateVersion>(r ?? [])),

  publish: (id: string) => api.post<AgentTemplate>(`${BASE}/${id}/publish`, {}),

  test: (id: string, payload?: Record<string, unknown>) =>
    api.post<{ runId: string; status: string }>(`${BASE}/${id}/test`, payload ?? {}),
};
