/**
 * Search & Filter API client.
 * Endpoints: global search, facets, autocomplete, saved-queries.
 * All responses consumed with nullish coalescing and safe arrays.
 */

import { api } from "@/lib/api";
import { safeArray } from "@/lib/api";

export { searchMock } from "./search-mock";
import type {
  GlobalSearchRequestBody,
  GlobalSearchResponse,
  FacetMeta,
  SavedQuery,
  SearchResult,
} from "@/types/search";

const BASE = "search";

function asGlobalResponse(raw: unknown): GlobalSearchResponse {
  if (raw !== null && typeof raw === "object" && "results" in (raw as Record<string, unknown>)) {
    const o = raw as { results?: unknown; total?: number; facets?: unknown[]; tookMs?: number };
    return {
      results: safeArray<SearchResult>(o.results),
      total: typeof o.total === "number" ? o.total : 0,
      facets: Array.isArray(o.facets) ? (o.facets as FacetMeta[]) : [],
      tookMs: o.tookMs,
    };
  }
  return { results: [], total: 0, facets: [] };
}

export const searchApi = {
  /** Execute global or module-scoped search with facets and pagination */
  global: (body: GlobalSearchRequestBody): Promise<GlobalSearchResponse> =>
    api
      .post<unknown>(`${BASE}/global`, body)
      .then(asGlobalResponse),

  /** Fetch facet definitions and counts for a scope */
  getFacets: (params: { scope: string; module?: string }): Promise<{ facets: FacetMeta[]; total: number }> => {
    const q = new URLSearchParams();
    q.set("scope", params.scope);
    if (params.module) q.set("module", params.module);
    return api
      .get<{ facets?: FacetMeta[]; total?: number }>(`${BASE}/facets?${q.toString()}`)
      .then((r) => ({
        facets: Array.isArray(r?.facets) ? r.facets : [],
        total: typeof r?.total === "number" ? r.total : 0,
      }));
  },

  /** Autocomplete suggestions */
  getAutocomplete: (params: { q: string; scope?: string; module?: string }): Promise<{ suggestions: string[] }> => {
    const q = new URLSearchParams();
    q.set("q", params.q);
    if (params.scope) q.set("scope", params.scope);
    if (params.module) q.set("module", params.module);
    return api
      .get<{ suggestions?: string[] }>(`${BASE}/autocomplete?${q.toString()}`)
      .then((r) => ({
        suggestions: Array.isArray(r?.suggestions) ? r.suggestions : [],
      }));
  },

  /** List saved queries */
  getSavedQueries: (): Promise<SavedQuery[]> =>
    api.get<SavedQuery[]>(`${BASE}/saved-queries`).then((r) => safeArray<SavedQuery>(r)),

  /** Create saved query */
  createSavedQuery: (body: {
    name: string;
    description?: string;
    query: string;
    scope: "global" | "module";
    module?: string;
    filters?: Record<string, unknown>;
    isShared?: boolean;
  }): Promise<SavedQuery> =>
    api.post<SavedQuery>(`${BASE}/saved-queries`, body),

  /** Update saved query */
  updateSavedQuery: (
    id: string,
    body: Partial<{ name: string; description: string; query: string; scope: string; module: string; isShared: boolean }>
  ): Promise<SavedQuery> =>
    api.put<SavedQuery>(`${BASE}/saved-queries/${id}`, body),

  /** Delete saved query */
  deleteSavedQuery: (id: string): Promise<{ success: boolean }> =>
    api.delete<{ success?: boolean }>(`${BASE}/saved-queries/${id}`).then((r) => ({ success: (r?.success ?? true) })),

  /** Run saved query and return results */
  runSavedQuery: (id: string, params?: { page?: number; pageSize?: number }): Promise<GlobalSearchResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.page != null) searchParams.set("page", String(params.page));
    if (params?.pageSize != null) searchParams.set("pageSize", String(params.pageSize));
    const suffix = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return api
      .post<unknown>(`${BASE}/saved-queries/${id}/run${suffix}`, {})
      .then(asGlobalResponse);
  },
};
