/**
 * React Query hooks for Master Dashboard.
 * All array data uses (data ?? []) / safeArray; responses validated before use.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { masterDashboardApi } from "@/api/master-dashboard";
import * as mock from "@/api/master-dashboard-mock";
import { safeArray } from "@/lib/api";
import type {
  MasterCronjob,
  MasterAlert,
  MasterApproval,
  MasterTemplate,
} from "@/types/master-dashboard";

const USE_MOCK =
  !import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_USE_MOCK_MASTER_DASHBOARD === "true";

const keys = {
  cronjobs: ["master-dashboard", "cronjobs"] as const,
  alerts: ["master-dashboard", "alerts"] as const,
  templates: ["master-dashboard", "templates"] as const,
  approvals: ["master-dashboard", "approvals"] as const,
  projectsSummary: ["master-dashboard", "projects", "summary"] as const,
  financeSnapshot: ["master-dashboard", "finance", "snapshot"] as const,
  healthWorkload: ["master-dashboard", "health", "workload"] as const,
  publishingQueue: ["master-dashboard", "publishing", "queue"] as const,
  search: (q: string) => ["master-dashboard", "search", q] as const,
};

export function useMasterCronjobs() {
  const query = useQuery({
    queryKey: keys.cronjobs,
    queryFn: () =>
      USE_MOCK ? mock.mockGetCronjobs() : masterDashboardApi.getCronjobs(),
    staleTime: 60 * 1000,
  });
  const items = safeArray<MasterCronjob>(query.data);
  return { ...query, items };
}

export function useCreateCronjob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<MasterCronjob>) =>
      USE_MOCK
        ? mock.mockCreateCronjob(payload)
        : masterDashboardApi.createCronjob(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.cronjobs });
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
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<Pick<MasterCronjob, "enabled" | "schedule" | "name">>;
    }) =>
      USE_MOCK
        ? mock.mockUpdateCronjob(id, payload)
        : masterDashboardApi.updateCronjob(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.cronjobs });
      toast.success("Cronjob updated");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update cronjob");
    },
  });
}

export function useMasterAlerts() {
  const query = useQuery({
    queryKey: keys.alerts,
    queryFn: () =>
      USE_MOCK ? mock.mockGetAlerts() : masterDashboardApi.getAlerts(),
    staleTime: 30 * 1000,
  });
  const items = safeArray<MasterAlert>(query.data);
  return { ...query, items };
}

export function useDigestAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      USE_MOCK ? mock.mockDigestAlert(id) : masterDashboardApi.digestAlert(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.alerts }),
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Failed to digest alert"),
  });
}

export function useSnoozeAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, until }: { id: string; until: string }) =>
      USE_MOCK
        ? mock.mockSnoozeAlert(id, until)
        : masterDashboardApi.snoozeAlert(id, until),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.alerts }),
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Failed to snooze alert"),
  });
}

export function useMasterTemplates() {
  const query = useQuery({
    queryKey: keys.templates,
    queryFn: () =>
      USE_MOCK ? mock.mockGetTemplates() : masterDashboardApi.getTemplates(),
    staleTime: 5 * 60 * 1000,
  });
  const items = safeArray<MasterTemplate>(query.data);
  return { ...query, items };
}

export function useMasterApprovals() {
  const query = useQuery({
    queryKey: keys.approvals,
    queryFn: () =>
      USE_MOCK ? mock.mockGetApprovals() : masterDashboardApi.getApprovals(),
    staleTime: 30 * 1000,
  });
  const items = safeArray<MasterApproval>(query.data);
  const pendingCount = items.filter((a) => a.status === "pending").length;
  return { ...query, items, pendingCount };
}

export function useApproveMaster() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comments }: { id: string; comments?: string }) =>
      USE_MOCK ? mock.mockApprove(id) : masterDashboardApi.approve(id, comments),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.approvals });
      toast.success("Approved");
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Failed to approve"),
  });
}

export function useRejectMaster() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comments }: { id: string; comments?: string }) =>
      USE_MOCK ? mock.mockReject(id) : masterDashboardApi.reject(id, comments),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.approvals });
      toast.success("Rejected");
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Failed to reject"),
  });
}

export function useProjectsSummary() {
  const query = useQuery({
    queryKey: keys.projectsSummary,
    queryFn: () =>
      USE_MOCK
        ? mock.mockGetProjectsSummary()
        : masterDashboardApi.getProjectsSummary(),
    staleTime: 60 * 1000,
  });
  return query;
}

export function useFinanceSnapshot() {
  const query = useQuery({
    queryKey: keys.financeSnapshot,
    queryFn: () =>
      USE_MOCK
        ? mock.mockGetFinanceSnapshot()
        : masterDashboardApi.getFinanceSnapshot(),
    staleTime: 60 * 1000,
  });
  return query;
}

export function useHealthWorkload() {
  const query = useQuery({
    queryKey: keys.healthWorkload,
    queryFn: () =>
      USE_MOCK
        ? mock.mockGetHealthWorkload()
        : masterDashboardApi.getHealthWorkload(),
    staleTime: 60 * 1000,
  });
  return query;
}

export function usePublishingQueue() {
  const query = useQuery({
    queryKey: keys.publishingQueue,
    queryFn: async () => {
      if (USE_MOCK) return mock.mockGetPublishingQueue();
      const r = await masterDashboardApi.getPublishingQueue();
      return r ?? { queued: 0, inProgress: 0, published: 0, lastUpdated: "" };
    },
    staleTime: 60 * 1000,
  });
  return query;
}

export function useGlobalSearch(query: string) {
  const enabled = typeof query === "string" && query.trim().length >= 2;
  const searchQuery = useQuery({
    queryKey: keys.search(query.trim()),
    queryFn: () =>
      USE_MOCK
        ? mock.mockSearch(query)
        : masterDashboardApi.search(query),
    enabled,
    staleTime: 10 * 1000,
  });
  const items = safeArray(searchQuery.data);
  return { ...searchQuery, items };
}

/** Alias for command palette: returns { data, isLoading } with data = search results array. */
export function useMasterSearch(query: string) {
  const { items, isFetching } = useGlobalSearch(query);
  const data = items ?? [];
  return { data, isLoading: isFetching };
}
