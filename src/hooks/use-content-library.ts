/**
 * Content Library hooks — data fetch with null-safety and array guards.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import * as api from "@/api/content-library";
import * as mock from "@/api/content-library-mock";
import type { ContentItem, ContentLibraryFilters } from "@/types/content-library";

const USE_MOCK =
  !import.meta.env.VITE_API_URL || import.meta.env.VITE_USE_MOCK_CONTENT === "true";

interface ContentLibraryParams {
  search?: string;
  filters?: ContentLibraryFilters;
  page?: number;
  limit?: number;
}

const QUERY_KEYS = {
  items: (params?: ContentLibraryParams) => ["content-library", "items", params] as const,
  metadata: ["content-library", "metadata"] as const,
  pipelineState: (id: string) => ["content-library", "pipeline", id] as const,
  artifacts: (id: string) => ["content-library", "artifacts", id] as const,
};

export function useContentLibraryItems(
  paramsOrFilters: ContentLibraryParams | ContentLibraryFilters = {}
) {
  const raw = paramsOrFilters as ContentLibraryParams & ContentLibraryFilters;
  const params: ContentLibraryParams =
    raw && "filters" in raw && raw.filters !== undefined
      ? (raw as ContentLibraryParams)
      : {
          filters: (paramsOrFilters || {}) as ContentLibraryFilters,
          search: (paramsOrFilters as ContentLibraryFilters)?.search,
        };
  const query = useQuery({
    queryKey: QUERY_KEYS.items(params),
    queryFn: () =>
      USE_MOCK
        ? mock.mockFetchContentLibraryItems(params)
        : api.fetchContentLibraryItems(params),
    placeholderData: { data: [], total: 0 },
  });
  const data = query.data ?? { data: [], total: 0 };
  const items = Array.isArray(data.data) ? data.data : [];
  const total = typeof data.total === "number" ? data.total : 0;
  return { ...query, items, total };
}

export function useContentLibraryMetadata() {
  const query = useQuery({
    queryKey: QUERY_KEYS.metadata,
    queryFn: () =>
      USE_MOCK ? mock.mockFetchContentLibraryMetadata() : api.fetchContentLibraryMetadata(),
    placeholderData: { owners: [], channels: [], tags: [] },
  });
  const data = query.data ?? { owners: [], channels: [], tags: [], platforms: [] };
  const owners = Array.isArray(data.owners) ? data.owners : [];
  const channels = Array.isArray(data.channels) ? data.channels : [];
  const tags = Array.isArray(data.tags) ? data.tags : [];
  const platforms = Array.isArray(data.platforms) ? data.platforms : [];
  return { ...query, owners, channels, tags, platforms };
}

export function useContentItemPipelineState(id: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.pipelineState(id ?? ""),
    queryFn: () =>
      id
        ? USE_MOCK
          ? mock.mockFetchContentItemPipelineState(id)
          : api.fetchContentItemPipelineState(id)
        : Promise.resolve(null),
    enabled: !!id,
  });
}

/** Alias for useContentItemPipelineState */
export const usePipelineState = useContentItemPipelineState;

export function useContentItemArtifacts(id: string | null) {
  const query = useQuery({
    queryKey: QUERY_KEYS.artifacts(id ?? ""),
    queryFn: () =>
      id
        ? USE_MOCK
          ? mock.mockFetchContentItemArtifacts(id)
          : api.fetchContentItemArtifacts(id)
        : Promise.resolve([]),
    enabled: !!id,
  });
  const data = query.data;
  const artifacts = Array.isArray(data) ? data : [];
  return { ...query, artifacts };
}

/** Alias for useContentItemArtifacts - returns { data: { data } } shape for ItemDetailDrawer */
export function useArtifacts(id: string | null) {
  const q = useContentItemArtifacts(id);
  return { ...q, data: { data: q.artifacts } };
}

export function useBulkActionContentLibrary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof api.bulkActionContentItems>[0]) =>
      USE_MOCK ? mock.mockBulkActionContentItems(payload) : api.bulkActionContentItems(payload),
    onSuccess: (_data, _variables) => {
      queryClient.invalidateQueries({ queryKey: ["content-library"] });
      toast.success("Bulk action completed");
    },
    onError: () => toast.error("Bulk action failed"),
  });
}

/** Alias for useBulkActionContentLibrary */
export const useBulkAction = useBulkActionContentLibrary;

/** Selection state for bulk actions; guards and defaults. */
export function useContentLibrarySelection() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const toggleAll = useCallback((items: ContentItem[]) => {
    const ids = (items ?? []).map((i) => i.id);
    setSelectedIds((prev) =>
      ids.length > 0 && ids.every((id) => prev.includes(id))
        ? prev.filter((id) => !ids.includes(id))
        : [...new Set([...prev, ...ids])]
    );
  }, []);

  const clear = useCallback(() => setSelectedIds([]), []);

  const isSelected = useCallback(
    (id: string) => selectedIds.includes(id),
    [selectedIds]
  );

  const selectedCount = selectedIds.length;

  return useMemo(
    () => ({
      selectedIds,
      setSelectedIds,
      toggle,
      toggleAll,
      clear,
      isSelected,
      selectedCount,
    }),
    [selectedIds, toggle, toggleAll, clear, isSelected, selectedCount]
  );
}
