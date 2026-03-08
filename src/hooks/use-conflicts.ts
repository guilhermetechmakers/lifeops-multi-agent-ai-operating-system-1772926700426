/**
 * React Query hooks for Conflict Resolution Engine.
 * All array data uses safeArray / (data ?? []); responses validated before use.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { conflictsApi } from "@/api/conflicts";
import * as mock from "@/api/conflicts-mock";
import { safeArray } from "@/lib/api";
import type {
  Conflict,
  ResolutionRecord,
  ResolveConflictsRequest,
  ResolveConflictsResponse,
} from "@/types/conflicts";

const USE_MOCK =
  !import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_USE_MOCK_CONFLICTS === "true";

const keys = {
  conflict: (id: string) => ["conflicts", "detail", id] as const,
  list: () => ["conflicts", "list"] as const,
  resolutions: () => ["conflicts", "resolutions"] as const,
};

export function useConflicts() {
  const query = useQuery({
    queryKey: keys.list(),
    queryFn: () =>
      USE_MOCK ? Promise.resolve(mock.mockGetConflicts()) : conflictsApi.list(),
    staleTime: 30 * 1000,
  });

  const items = safeArray<Conflict>(query.data);
  return { ...query, items };
}

export function useConflict(id: string | null) {
  const query = useQuery({
    queryKey: keys.conflict(id ?? ""),
    queryFn: () =>
      USE_MOCK ? mock.mockGetConflict(id!) : conflictsApi.get(id!),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
  });

  const conflict = query.data ?? null;
  return { ...query, conflict };
}

export function useResolveConflicts() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: ResolveConflictsRequest) =>
      USE_MOCK ? mock.mockResolveConflicts(payload) : conflictsApi.resolve(payload),
    onSuccess: (data: ResolveConflictsResponse) => {
      const resolutions = safeArray<ResolutionRecord>(data?.resolutions);
      setLastResolutions(resolutions);
      qc.setQueryData(keys.resolutions(), resolutions);
      if (resolutions.length > 0) {
        toast.success(`Resolved ${resolutions.length} conflict(s)`);
      }
      qc.invalidateQueries({ queryKey: keys.list() });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Resolution failed");
    },
  });
}

export function useOverrideConflict() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { outcome?: string; notes?: string };
    }) =>
      USE_MOCK
        ? mock.mockOverrideConflict(id, payload)
        : conflictsApi.override(id, payload),
    onSuccess: (_, variables) => {
      if (variables.id) qc.invalidateQueries({ queryKey: keys.conflict(variables.id) });
      qc.invalidateQueries({ queryKey: keys.list() });
      toast.success("Override applied");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Override failed");
    },
  });
}

/** Cached resolutions from last resolve; for display in CRE panel. */
const lastResolutionsRef: { current: ResolutionRecord[] } = { current: [] };

export function setLastResolutions(resolutions: ResolutionRecord[]): void {
  lastResolutionsRef.current = resolutions ?? [];
}

/** Resolutions from last resolve; reactive via React Query. */
export function useLastResolutions(): ResolutionRecord[] {
  const query = useQuery({
    queryKey: keys.resolutions(),
    queryFn: () => Promise.resolve(lastResolutionsRef.current),
    staleTime: 60 * 1000,
  });
  return safeArray<ResolutionRecord>(query.data);
}
