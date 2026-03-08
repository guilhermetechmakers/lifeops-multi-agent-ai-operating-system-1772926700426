/**
 * React Query hooks for Search & Filter: autocomplete, facets, saved queries.
 * All array data uses safeArray / (data ?? []); responses validated before use.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { searchApi, searchMock } from "@/api/search";
import { safeArray } from "@/lib/api";
import type { SavedQuery, FacetMeta, SearchModule } from "@/types/search";

const USE_MOCK =
  !import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_USE_MOCK_SEARCH === "true";

const keys = {
  autocomplete: (q: string, scope?: string, module?: string) =>
    ["search", "autocomplete", q, scope, module] as const,
  facets: (scope: string, module?: string) =>
    ["search", "facets", scope, module] as const,
  savedQueries: ["search", "saved-queries"] as const,
};

const DEBOUNCE_MS = 300;

/** Autocomplete suggestions; enable when query length >= 2 */
export function useSearchAutocomplete(
  query: string,
  scope?: string,
  module?: string,
  enabled = true
) {
  const q = (query ?? "").trim();
  const shouldRun = enabled && q.length >= 2;
  const queryResult = useQuery({
    queryKey: keys.autocomplete(q, scope, module),
    queryFn: () =>
      USE_MOCK
        ? searchMock.getAutocomplete({ q })
        : searchApi.getAutocomplete({ q, scope, module }),
    enabled: shouldRun,
    staleTime: 60 * 1000,
  });
  const suggestions = Array.isArray(queryResult.data?.suggestions)
    ? queryResult.data.suggestions
    : [];
  return { ...queryResult, suggestions };
}

/** Facet definitions and counts for a scope */
export function useSearchFacets(scope: string, module?: string, enabled = true) {
  const queryResult = useQuery({
    queryKey: keys.facets(scope, module ?? ""),
    queryFn: () =>
      USE_MOCK
        ? searchMock.getFacets({ scope, module })
        : searchApi.getFacets({ scope, module }),
    enabled: Boolean(scope) && enabled,
    staleTime: 2 * 60 * 1000,
  });
  const facets: FacetMeta[] = Array.isArray(queryResult.data?.facets)
    ? queryResult.data.facets
    : [];
  const total = typeof queryResult.data?.total === "number" ? queryResult.data.total : 0;
  return { ...queryResult, facets, total };
}

/** List saved queries */
export function useSavedQueries() {
  const queryResult = useQuery({
    queryKey: keys.savedQueries,
    queryFn: () =>
      USE_MOCK ? searchMock.getSavedQueries() : searchApi.getSavedQueries(),
    staleTime: 60 * 1000,
  });
  const items = safeArray<SavedQuery>(queryResult.data);
  return { ...queryResult, items };
}

/** Create saved query */
export function useCreateSavedQuery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name: string;
      description?: string;
      query: string;
      scope: "global" | "module";
      module?: string;
      isShared?: boolean;
    }) =>
      USE_MOCK
        ? searchMock.createSavedQuery(body)
        : searchApi.createSavedQuery(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.savedQueries });
      toast.success("Saved query created");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to create saved query");
    },
  });
}

/** Update saved query */
export function useUpdateSavedQuery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Partial<{ name: string; description: string; query: string; scope: "global" | "module"; module?: SearchModule; isShared: boolean }>;
    }) =>
      USE_MOCK
        ? searchMock.updateSavedQuery(id, body)
        : searchApi.updateSavedQuery(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.savedQueries });
      toast.success("Saved query updated");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update saved query");
    },
  });
}

/** Delete saved query */
export function useDeleteSavedQuery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      USE_MOCK
        ? searchMock.deleteSavedQuery(id)
        : searchApi.deleteSavedQuery(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.savedQueries });
      toast.success("Saved query deleted");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete saved query");
    },
  });
}

/** Run saved query (returns results; can be used from context or page) */
export function useRunSavedQuery() {
  return useMutation({
    mutationFn: ({
      id,
      page,
      pageSize,
    }: {
      id: string;
      page?: number;
      pageSize?: number;
    }) =>
      USE_MOCK
        ? searchMock.runSavedQuery(id)
        : searchApi.runSavedQuery(id, { page, pageSize }),
  });
}

export { DEBOUNCE_MS };
