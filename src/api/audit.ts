/**
 * Audit Trail & Reversibility API client.
 * All responses use safeArray / (data ?? []); validate before use.
 */

import { api, safeArray } from "@/lib/api";
import type {
  AuditEvent,
  AuditEventFilters,
  AuditEventsResponse,
  RevertPrepareRequest,
  RevertPrepareResponse,
  RevertExecuteRequest,
  RevertExecuteResponse,
  AuditExportFilters,
  AuditExportResponse,
  AuditOverviewMetrics,
  AuditRunSummary,
  PendingApprovalItem,
} from "@/types/audit";

/** Map filter actionType to API param type for event type filter */
function buildEventParams(filters: AuditEventFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.runId) params.set("runId", filters.runId);
  if (filters.cronJobId) params.set("cronJobId", filters.cronJobId);
  if (filters.userId) params.set("userId", filters.userId);
  if (filters.actionType) params.set("actionType", filters.actionType);
  if (filters.type) params.set("type", String(filters.type));
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.revertible !== undefined) params.set("revertible", String(filters.revertible));
  if (filters.status) params.set("status", filters.status);
  if (filters.page != null) params.set("page", String(filters.page));
  if (filters.limit != null) params.set("limit", String(filters.limit));
  return params;
}

const BASE = "audit";

function safeEvents(data: unknown): AuditEvent[] {
  const raw = data ?? [];
  if (Array.isArray(raw)) return raw as AuditEvent[];
  if (typeof data === "object" && data !== null && "events" in (data as Record<string, unknown>)) {
    const resp = data as { events?: unknown };
    return safeArray<AuditEvent>(resp.events);
  }
  return [];
}

export const auditApi = {
  listEvents: (filters: AuditEventFilters = {}) => {
    const params = buildEventParams(filters);
    const qs = params.toString();
    return api
      .get<AuditEventsResponse | AuditEvent[]>(`${BASE}/events${qs ? `?${qs}` : ""}`)
      .then((r) => {
        if (r && typeof r === "object" && "events" in (r as unknown as Record<string, unknown>)) {
          const resp = r as AuditEventsResponse;
          return {
            events: safeArray<AuditEvent>(resp.events),
            count: resp.count ?? 0,
            page: resp.page ?? 1,
            limit: resp.limit ?? 50,
          };
        }
        return {
          events: safeEvents(r),
          count: safeArray(r).length,
          page: 1,
          limit: 50,
        };
      });
  },

  getEvent: (id: string) =>
    api.get<AuditEvent>(`${BASE}/events/${id}`).then((r) => r ?? null),

  revertPrepare: (payload: RevertPrepareRequest) =>
    api.post<RevertPrepareResponse>(`${BASE}/events/revert-prepare`, payload),

  revertExecute: (eventId: string, payload: Omit<RevertExecuteRequest, "eventId">) =>
    api.post<RevertExecuteResponse>(`${BASE}/events/${eventId}/revert`, payload),

  export: (filters: AuditExportFilters) => {
    const params = new URLSearchParams();
    params.set("format", filters.format);
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    if (filters.runId) params.set("runId", filters.runId);
    if (filters.cronJobId) params.set("cronJobId", filters.cronJobId);
    if (filters.userId) params.set("userId", filters.userId);
    if (filters.actionType) params.set("actionType", filters.actionType);
    if (filters.eventType) params.set("eventType", filters.eventType);
    if (filters.status) params.set("status", filters.status ?? "");
    return api.get<AuditExportResponse>(`${BASE}/export?${params.toString()}`);
  },

  getOverview: () => api.get<AuditOverviewMetrics>(`${BASE}/overview`),

  getRecentRuns: (limit = 10) =>
    api.get<AuditRunSummary[]>(`${BASE}/runs/recent?limit=${limit}`).then((r) => safeArray<AuditRunSummary>(r)),

  getPendingApprovals: () =>
    api.get<PendingApprovalItem[]>(`${BASE}/approvals/pending`).then((r) => safeArray<PendingApprovalItem>(r)),
};
