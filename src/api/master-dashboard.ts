/**
 * Master Dashboard API client.
 * Endpoints: cronjobs, alerts, templates, approvals, projects/summary, finance/snapshot, health/workload, search, run-artifacts.
 * All responses consumed with nullish coalescing and safe arrays.
 */

import { api } from "@/lib/api";
import type {
  MasterCronjob,
  MasterTemplate,
  MasterAlert,
  MasterApproval,
  RunArtifact,
  ProjectsSummary,
  FinanceSnapshot,
  HealthWorkload,
  PublishingQueueSummary,
  GlobalSearchResult,
} from "@/types/master-dashboard";

const BASE = "master-dashboard";

function safeList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && "data" in (data as Record<string, unknown>)) {
    const d = (data as { data: unknown }).data;
    return Array.isArray(d) ? (d as T[]) : [];
  }
  return [];
}

export const masterDashboardApi = {
  getCronjobs: () =>
    api.get<MasterCronjob[]>(`${BASE}/cronjobs`).then((r) => safeList<MasterCronjob>(r ?? [])),

  createCronjob: (payload: Partial<MasterCronjob>) =>
    api.post<MasterCronjob>(`${BASE}/cronjobs`, payload),

  updateCronjob: (id: string, payload: Partial<Pick<MasterCronjob, "enabled" | "schedule" | "name">>) =>
    api.patch<MasterCronjob>(`${BASE}/cronjobs/${id}`, payload),

  getAlerts: () =>
    api.get<MasterAlert[]>(`${BASE}/alerts`).then((r) => safeList<MasterAlert>(r ?? [])),

  digestAlert: (id: string) =>
    api.post<MasterAlert>(`${BASE}/alerts/${id}/digest`, {}),

  snoozeAlert: (id: string, until: string) =>
    api.post<MasterAlert>(`${BASE}/alerts/${id}/snooze`, { until }),

  getTemplates: () =>
    api.get<MasterTemplate[]>(`${BASE}/templates`).then((r) => safeList<MasterTemplate>(r ?? [])),

  getApprovals: () =>
    api.get<MasterApproval[]>(`${BASE}/approvals`).then((r) => safeList<MasterApproval>(r ?? [])),

  approve: (id: string, comments?: string) =>
    api.post<MasterApproval>(`${BASE}/approvals/${id}/approve`, { comments }),

  reject: (id: string, comments?: string) =>
    api.post<MasterApproval>(`${BASE}/approvals/${id}/reject`, { comments }),

  getProjectsSummary: () =>
    api.get<ProjectsSummary>(`${BASE}/projects/summary`),

  getFinanceSnapshot: () =>
    api.get<FinanceSnapshot>(`${BASE}/finance/snapshot`),

  getHealthWorkload: () =>
    api.get<HealthWorkload>(`${BASE}/health/workload`),

  getPublishingQueue: () =>
    api.get<PublishingQueueSummary>(`${BASE}/publishing/queue`).catch(() => null),

  search: (q: string) =>
    api.get<GlobalSearchResult[]>(`${BASE}/search?q=${encodeURIComponent(q)}`).then((r) => safeList<GlobalSearchResult>(r ?? [])),

  getRunArtifact: (runId: string) =>
    api.get<RunArtifact>(`${BASE}/run-artifacts/${runId}`),
};
