/**
 * Audit Trail & Reversibility hooks.
 * All array data uses safeArray / (data ?? []); responses validated before use.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { auditApi } from "@/api/audit";
import * as mock from "@/api/audit-mock";
import { safeArray } from "@/lib/api";
import type {
  AuditEventFilters,
  AuditEvent,
  RevertPrepareRequest,
  RevertExecuteRequest,
  AuditExportFilters,
  AuditRunSummary,
  PendingApprovalItem,
} from "@/types/audit";

const USE_MOCK =
  !import.meta.env.VITE_API_URL || import.meta.env.VITE_USE_MOCK_AUDIT === "true";

const keys = {
  events: (f: AuditEventFilters) => ["audit", "events", f] as const,
  event: (id: string) => ["audit", "events", id] as const,
  overview: () => ["audit", "overview"] as const,
  recentRuns: (limit: number) => ["audit", "recentRuns", limit] as const,
  pendingApprovals: () => ["audit", "pendingApprovals"] as const,
};

export function useAuditEvents(filters: AuditEventFilters = {}) {
  const query = useQuery({
    queryKey: keys.events(filters),
    queryFn: () =>
      USE_MOCK ? mock.mockListEvents(filters) : auditApi.listEvents(filters),
    staleTime: 30 * 1000,
  });
  const events = Array.isArray(query.data?.events)
    ? query.data.events
    : safeArray<AuditEvent>(query.data);
  const count = query.data && typeof query.data === "object" && "count" in query.data
    ? (query.data as { count: number }).count
    : events.length;
  return {
    ...query,
    events,
    count: count ?? events.length,
    page: (query.data && typeof query.data === "object" && "page" in query.data
      ? (query.data as { page: number }).page
      : 1) ?? 1,
    limit: (query.data && typeof query.data === "object" && "limit" in query.data
      ? (query.data as { limit: number }).limit
      : 50) ?? 50,
  };
}

export function useAuditEvent(id: string | null) {
  return useQuery({
    queryKey: keys.event(id ?? ""),
    queryFn: () =>
      USE_MOCK ? mock.mockGetEvent(id!) : auditApi.getEvent(id!),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
  });
}

export function useAuditOverview() {
  return useQuery({
    queryKey: keys.overview(),
    queryFn: () =>
      USE_MOCK ? mock.mockAuditOverview() : auditApi.getOverview(),
    staleTime: 60 * 1000,
  });
}

export function useRecentRuns(limit = 10) {
  const query = useQuery({
    queryKey: keys.recentRuns(limit),
    queryFn: async (): Promise<AuditRunSummary[]> => {
      if (USE_MOCK) return mock.mockRecentRuns();
      return auditApi.getRecentRuns(limit);
    },
    staleTime: 60 * 1000,
  });
  const runs = Array.isArray(query.data) ? query.data : [];
  return { ...query, runs };
}

export function usePendingApprovals() {
  const query = useQuery({
    queryKey: keys.pendingApprovals(),
    queryFn: async (): Promise<PendingApprovalItem[]> => {
      if (USE_MOCK) return mock.mockPendingApprovals();
      return auditApi.getPendingApprovals();
    },
    staleTime: 15 * 1000,
  });
  const items = Array.isArray(query.data) ? query.data : [];
  return { ...query, items };
}

export function useRevertPrepare() {
  return useMutation({
    mutationFn: (payload: RevertPrepareRequest) =>
      USE_MOCK ? mock.mockRevertPrepare(payload) : auditApi.revertPrepare(payload),
  });
}

export interface RevertExecuteMutationPayload {
  eventId: string;
  payload: Omit<RevertExecuteRequest, "eventId">;
}

export function useRevertExecute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, payload }: RevertExecuteMutationPayload) =>
      USE_MOCK
        ? mock.mockRevertExecute(eventId, payload)
        : auditApi.revertExecute(eventId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["audit"] });
      toast.success("Revert completed");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Revert failed"),
  });
}

export function useAuditExport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (filters: AuditExportFilters) =>
      USE_MOCK ? mock.mockExport(filters) : auditApi.export(filters),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["audit"] });
      if (data?.downloadUrl) {
        window.open(data.downloadUrl, "_blank");
        toast.success("Export ready");
      } else if (data?.status === "completed") {
        toast.success("Export completed");
      }
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Export failed"),
  });
}
