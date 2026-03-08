/**
 * React Query hooks for Approvals Queue.
 * Filters synced to URL search params. All array/response shapes guarded.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  getApprovalsQueue,
  getApprovalItem,
  getAuditTrail,
  approveItem,
  approveWithConditionsItem,
  rejectItem,
  requestChangesItem,
  revertItem,
  addCommentItem,
  escalateItem,
} from "@/api/approvals";
import { approvalsMockApi } from "@/api/approvals-mock";
import { safeArray } from "@/lib/api";
import type {
  ApprovalQueueItem,
  ApprovalQueueFilters,
  ApprovePayload,
  ApproveWithConditionsPayload,
  RejectPayload,
  RequestChangesPayload,
  RevertPayload,
  AddCommentPayload,
  EscalatePayload,
} from "@/types/approvals";

const USE_MOCK =
  import.meta.env.VITE_USE_MOCK_APPROVALS === "true" ||
  !import.meta.env.VITE_API_URL;

const approvalsKeys = {
  all: ["approvals"] as const,
  queue: (filters: ApprovalQueueFilters) =>
    ["approvals", "queue", filters] as const,
  item: (id: string | null) => ["approvals", "item", id] as const,
  audit: (refId: string | null) => ["approvals", "audit", refId] as const,
};

function parseFiltersFromSearchParams(
  searchParams: URLSearchParams
): ApprovalQueueFilters {
  const page = searchParams.get("page");
  const pageSize = searchParams.get("pageSize");
  return {
    owner: searchParams.get("owner") ?? undefined,
    cronName: searchParams.get("cronName") ?? undefined,
    module: searchParams.get("module") ?? undefined,
    severity: (searchParams.get("severity") as ApprovalQueueFilters["severity"]) ?? undefined,
    status: (searchParams.get("status") as ApprovalQueueFilters["status"]) ?? undefined,
    priority: (searchParams.get("priority") as ApprovalQueueFilters["priority"]) ?? undefined,
    slaUrgency: (searchParams.get("slaUrgency") as ApprovalQueueFilters["slaUrgency"]) ?? undefined,
    assignedApprover: searchParams.get("assignedApprover") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    dateFrom: searchParams.get("dateFrom") ?? undefined,
    dateTo: searchParams.get("dateTo") ?? undefined,
    page: page ? parseInt(page, 10) : 1,
    pageSize: pageSize ? parseInt(pageSize, 10) : 20,
  };
}

export function useApprovalsQueueFilters(): [
  ApprovalQueueFilters,
  (updates: Partial<ApprovalQueueFilters>) => void
] {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = parseFiltersFromSearchParams(searchParams);

  const setFilters = (updates: Partial<ApprovalQueueFilters>) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      const merged = { ...filters, ...updates };
      if (merged.owner) next.set("owner", merged.owner);
      else next.delete("owner");
      if (merged.cronName) next.set("cronName", merged.cronName);
      else next.delete("cronName");
      if (merged.module) next.set("module", merged.module);
      else next.delete("module");
      if (merged.severity) next.set("severity", merged.severity);
      else next.delete("severity");
      if (merged.status) next.set("status", merged.status);
      else next.delete("status");
      if (merged.priority) next.set("priority", merged.priority);
      else next.delete("priority");
      if (merged.slaUrgency) next.set("slaUrgency", merged.slaUrgency);
      else next.delete("slaUrgency");
      if (merged.assignedApprover) next.set("assignedApprover", merged.assignedApprover);
      else next.delete("assignedApprover");
      if (merged.search) next.set("search", merged.search);
      else next.delete("search");
      if (merged.dateFrom) next.set("dateFrom", merged.dateFrom);
      else next.delete("dateFrom");
      if (merged.dateTo) next.set("dateTo", merged.dateTo);
      else next.delete("dateTo");
      next.set("page", String(merged.page ?? 1));
      next.set("pageSize", String(merged.pageSize ?? 20));
      return next;
    });
  };

  return [filters, setFilters];
}

export function useApprovalsQueue() {
  const [filters] = useApprovalsQueueFilters();
  const query = useQuery({
    queryKey: approvalsKeys.queue(filters),
    queryFn: async () => {
      if (USE_MOCK) return approvalsMockApi.getQueue(filters);
      return getApprovalsQueue(filters);
    },
  });
  const raw = query.data;
  const items = Array.isArray((raw as { data?: ApprovalQueueItem[] })?.data)
    ? ((raw as { data: ApprovalQueueItem[] }).data ?? [])
    : safeArray<ApprovalQueueItem>(raw);
  const total =
    typeof (raw as { total?: number })?.total === "number"
      ? (raw as { total: number }).total
      : items.length;
  return { ...query, items, total };
}

export function useApprovalItem(id: string | null) {
  const query = useQuery({
    queryKey: approvalsKeys.item(id),
    queryFn: async () => {
      if (!id) return null;
      if (USE_MOCK) return approvalsMockApi.getItem(id);
      return getApprovalItem(id);
    },
    enabled: !!id,
  });
  return query;
}

export function useAuditTrail(refId: string | null) {
  const query = useQuery({
    queryKey: approvalsKeys.audit(refId),
    queryFn: async () => {
      if (!refId) return [];
      if (USE_MOCK) return approvalsMockApi.getAuditTrail(refId);
      return getAuditTrail(refId);
    },
    enabled: !!refId,
  });
  const events = Array.isArray(query.data) ? query.data : [];
  return { ...query, events };
}

export function useApproveApprovalItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload?: ApprovePayload }) => {
      if (USE_MOCK) return approvalsMockApi.approve(id, payload ?? {});
      return approveItem(id, payload ?? {});
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: approvalsKeys.all });
      toast.success("Approved");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to approve");
    },
  });
}

export function useApproveWithConditionsApprovalItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: ApproveWithConditionsPayload;
    }) => {
      if (USE_MOCK) return approvalsMockApi.approveWithConditions(id, payload);
      return approveWithConditionsItem(id, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: approvalsKeys.all });
      toast.success("Approved with conditions");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to approve");
    },
  });
}

export function useRejectApprovalItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload?: RejectPayload }) => {
      if (USE_MOCK) return approvalsMockApi.reject(id, payload ?? {});
      return rejectItem(id, payload ?? {});
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: approvalsKeys.all });
      toast.success("Rejected");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to reject");
    },
  });
}

export function useRequestChangesApprovalItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload?: RequestChangesPayload;
    }) => {
      if (USE_MOCK) return approvalsMockApi.requestChanges(id, payload ?? {});
      return requestChangesItem(id, payload ?? {});
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: approvalsKeys.all });
      toast.success("Changes requested");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to request changes");
    },
  });
}

export function useRevertApprovalItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload?: RevertPayload }) => {
      if (USE_MOCK) return approvalsMockApi.revert(id, payload ?? {});
      return revertItem(id, payload ?? {});
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: approvalsKeys.all });
      toast.success("Revert queued");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to revert");
    },
  });
}

export function useAddApprovalComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: { id: string; payload: AddCommentPayload }) => {
      if (USE_MOCK) return approvalsMockApi.addComment(id, payload);
      return addCommentItem(id, payload);
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: approvalsKeys.item(id) });
      qc.invalidateQueries({ queryKey: approvalsKeys.all });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to add comment");
    },
  });
}

export function useEscalateApprovalItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: { id: string; payload?: EscalatePayload }) => {
      if (USE_MOCK) return approvalsMockApi.escalate(id, payload ?? {});
      return escalateItem(id, payload ?? {});
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: approvalsKeys.all });
      toast.success("Escalated");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to escalate");
    },
  });
}
