/**
 * React Query hooks for Cronjobs Dashboard.
 * All array data uses safeArray / (data ?? []); responses validated before use.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cronjobsApi } from "@/api/cronjobs";
import * as mock from "@/api/cronjobs-mock";
import { safeArray } from "@/lib/api";
import type {
  CronjobRun,
  CronjobListParams,
  CreateCronjobInput,
  UpdateCronjobInput,
  BulkCronjobAction,
} from "@/types/cronjob";

const USE_MOCK =
  !import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_USE_MOCK_CRONJOBS === "true";

const keys = {
  list: (params: CronjobListParams) => ["cronjobs", "list", params] as const,
  detail: (id: string) => ["cronjobs", "detail", id] as const,
  runs: (id: string, runParams?: Record<string, string>) =>
    ["cronjobs", "runs", id, runParams] as const,
  alerts: () => ["cronjobs", "alerts"] as const,
};

export function useCronjobsList(params: CronjobListParams = {}) {
  const query = useQuery({
    queryKey: keys.list(params),
    queryFn: () =>
      USE_MOCK ? mock.mockGetCronjobsList(params) : cronjobsApi.getList(params),
    staleTime: 60 * 1000,
  });
  const data = query.data?.data ?? [];
  const list = Array.isArray(data) ? data : [];
  return {
    ...query,
    data: list,
    items: list,
    count: query.data?.count ?? 0,
    page: query.data?.page ?? 1,
    pageSize: query.data?.pageSize ?? 20,
  };
}

export function useCronjob(id: string | undefined | null, enabled = true) {
  const query = useQuery({
    queryKey: keys.detail(id ?? ""),
    queryFn: () =>
      USE_MOCK ? mock.mockGetCronjob(id!) : cronjobsApi.get(id!),
    enabled: Boolean(id) && enabled,
    staleTime: 60 * 1000,
  });
  return query;
}

export function useCronjobRuns(
  cronjobId: string | undefined | null,
  runParams?: { status?: string; from?: string; to?: string }
) {
  const query = useQuery({
    queryKey: keys.runs(cronjobId ?? "", runParams),
    queryFn: () =>
      USE_MOCK
        ? mock.mockGetCronjobRuns(cronjobId!, runParams)
        : cronjobsApi.getRuns(cronjobId!, runParams),
    enabled: Boolean(cronjobId),
    staleTime: 30 * 1000,
  });
  const items = safeArray<CronjobRun>(query.data);
  return { ...query, items };
}

export function useCronjobAlerts() {
  const query = useQuery({
    queryKey: keys.alerts(),
    queryFn: () =>
      USE_MOCK ? mock.mockGetCronjobAlerts() : cronjobsApi.getAlerts(),
    staleTime: 30 * 1000,
  });
  const items = Array.isArray(query.data) ? query.data : [];
  return { ...query, items };
}

export function useCreateCronjob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCronjobInput) =>
      USE_MOCK ? mock.mockCreateCronjob(payload) : cronjobsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cronjobs"] });
      toast.success("Cronjob created");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to create cronjob");
    },
  });
}

export function useUpdateCronjob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCronjobInput }) =>
      USE_MOCK
        ? mock.mockUpdateCronjob(id, payload)
        : cronjobsApi.patch(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["cronjobs"] });
      qc.invalidateQueries({ queryKey: keys.detail(id) });
      toast.success("Cronjob updated");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update cronjob");
    },
  });
}

export function useDeleteCronjob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      USE_MOCK ? mock.mockDeleteCronjob(id) : cronjobsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cronjobs"] });
      toast.success("Cronjob deleted");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete cronjob");
    },
  });
}

export function useRunNowCronjob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      USE_MOCK ? mock.mockRunNow(id) : cronjobsApi.runNow(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["cronjobs"] });
      qc.invalidateQueries({ queryKey: keys.detail(id) });
      qc.invalidateQueries({ queryKey: keys.runs(id) });
      toast.success("Run triggered");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Run failed");
    },
  });
}

/** Alias for compatibility. */
export const useRunCronjobNow = useRunNowCronjob;

export function useBulkCronjobs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: BulkCronjobAction) =>
      USE_MOCK
        ? mock.mockBulkCronjobs(payload)
        : cronjobsApi.bulk(payload),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["cronjobs"] });
      if (res?.errors?.length) {
        toast.warning(`Bulk action completed with ${res.errors.length} error(s)`);
      } else {
        toast.success(`Updated ${res?.updated ?? 0} cronjob(s)`);
      }
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Bulk action failed");
    },
  });
}
