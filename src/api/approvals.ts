/**
 * LifeOps Approvals Queue API.
 * GET/POST endpoints for queue list, item detail, and actions.
 * All responses use safe arrays and null guards.
 */

import { api } from "@/lib/api";
import { safeArray } from "@/lib/api";
import type {
  ApprovalQueueItem,
  ApprovalQueueFilters,
  ApprovalQueueResponse,
  ApprovePayload,
  ApproveWithConditionsPayload,
  RejectPayload,
  RequestChangesPayload,
  RevertPayload,
  AddCommentPayload,
  EscalatePayload,
  Comment,
} from "@/types/approvals";

const BASE = "/approvals/queue";

function buildQueryString(filters: ApprovalQueueFilters): string {
  const params = new URLSearchParams();
  if (filters.owner) params.set("owner", filters.owner);
  if (filters.cronName) params.set("cronName", filters.cronName);
  if (filters.module) params.set("module", filters.module);
  if (filters.severity) params.set("severity", filters.severity);
  if (filters.status) params.set("status", filters.status);
  if (filters.page != null) params.set("page", String(filters.page));
  if (filters.pageSize != null) params.set("pageSize", String(filters.pageSize));
  if (filters.search) params.set("search", filters.search);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.slaUrgency) params.set("slaUrgency", filters.slaUrgency);
  if (filters.assignedApprover) params.set("assignedApprover", filters.assignedApprover);
  const q = params.toString();
  return q ? `?${q}` : "";
}

/** GET /api/approvals/queue */
export async function getApprovalsQueue(
  filters: ApprovalQueueFilters = {}
): Promise<ApprovalQueueResponse> {
  const res = await api.get<{ data?: ApprovalQueueItem[]; total?: number }>(
    `${BASE}${buildQueryString(filters)}`
  );
  const data = safeArray<ApprovalQueueItem>(res?.data ?? (res as unknown as ApprovalQueueItem[]));
  const total =
    typeof (res as { total?: number })?.total === "number"
      ? (res as { total: number }).total
      : data.length;
  return { data, total };
}

/** GET /api/approvals/queue/:id */
export async function getApprovalItem(id: string): Promise<ApprovalQueueItem | null> {
  const item = await api.get<ApprovalQueueItem | null>(`${BASE}/${id}`);
  return item ?? null;
}

/** POST /api/approvals/queue/:id/approve */
export async function approveItem(
  id: string,
  payload: ApprovePayload = {}
): Promise<ApprovalQueueItem> {
  return api.post<ApprovalQueueItem>(`${BASE}/${id}/approve`, payload);
}

/** POST /api/approvals/queue/:id/approve-with-conditions */
export async function approveWithConditionsItem(
  id: string,
  payload: ApproveWithConditionsPayload
): Promise<ApprovalQueueItem> {
  return api.post<ApprovalQueueItem>(`${BASE}/${id}/approve-with-conditions`, payload);
}

/** POST /api/approvals/queue/:id/reject */
export async function rejectItem(
  id: string,
  payload: RejectPayload = {}
): Promise<ApprovalQueueItem> {
  return api.post<ApprovalQueueItem>(`${BASE}/${id}/reject`, payload);
}

/** POST /api/approvals/queue/:id/request-changes */
export async function requestChangesItem(
  id: string,
  payload: RequestChangesPayload = {}
): Promise<ApprovalQueueItem> {
  return api.post<ApprovalQueueItem>(`${BASE}/${id}/request-changes`, payload);
}

/** POST /api/approvals/queue/:id/revert */
export async function revertItem(
  id: string,
  payload: RevertPayload = {}
): Promise<ApprovalQueueItem> {
  return api.post<ApprovalQueueItem>(`${BASE}/${id}/revert`, payload);
}

/** POST /api/approvals/queue/:id/comments */
export async function addCommentItem(
  id: string,
  payload: AddCommentPayload
): Promise<Comment> {
  return api.post<Comment>(`${BASE}/${id}/comments`, payload);
}

/** POST /api/approvals/queue/:id/escalate */
export async function escalateItem(
  id: string,
  payload: EscalatePayload = {}
): Promise<ApprovalQueueItem> {
  return api.post<ApprovalQueueItem>(`${BASE}/${id}/escalate`, payload);
}
