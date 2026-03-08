/**
 * Personas API client.
 * All responses consumed with nullish coalescing and safe arrays.
 */

import { api } from "@/lib/api";
import type {
  Persona,
  PersonaListParams,
  PersonaListResponse,
} from "@/types/templates-personas";

const BASE = "/personas";

function safeList<T>(data: unknown): T[] {
  const arr = data ?? [];
  return Array.isArray(arr) ? (arr as T[]) : [];
}

function buildQuery(params: PersonaListParams): string {
  const q = new URLSearchParams();
  if (params.search != null && params.search !== "") q.set("search", params.search);
  if (params.domain != null) q.set("domain", params.domain);
  if (params.page != null) q.set("page", String(params.page));
  if (params.pageSize != null) q.set("pageSize", String(params.pageSize));
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const personasApi = {
  getList: (params: PersonaListParams = {}) =>
    api
      .get<PersonaListResponse | Persona[]>(`${BASE}${buildQuery(params)}`)
      .then((r) => {
        if (r && typeof r === "object" && "data" in (r as unknown as Record<string, unknown>)) {
          const res = r as PersonaListResponse;
          return {
            data: safeList<Persona>(res.data ?? []),
            count: res.count ?? 0,
            page: res.page ?? 1,
            pageSize: res.pageSize ?? 20,
          };
        }
        const list = safeList<Persona>(r);
        return { data: list, count: list.length, page: 1, pageSize: list.length };
      }),

  get: (id: string) => api.get<Persona>(`${BASE}/${id}`),

  create: (payload: Partial<Persona>) => api.post<Persona>(`${BASE}`, payload),

  update: (id: string, payload: Partial<Persona>) =>
    api.put<Persona>(`${BASE}/${id}`, payload),

  delete: (id: string) => api.delete<unknown>(`${BASE}/${id}`),

  getPrompts: (id: string) =>
    api
      .get<{ prompts: string[] }>(`${BASE}/${id}/prompts`)
      .then((r) => (r && typeof r === "object" && Array.isArray((r as { prompts?: unknown }).prompts))
        ? ((r as { prompts: string[] }).prompts ?? [])
        : []),

  addPrompt: (id: string, prompt: string) =>
    api.post<{ prompts: string[] }>(`${BASE}/${id}/prompts`, { prompt }),
};
