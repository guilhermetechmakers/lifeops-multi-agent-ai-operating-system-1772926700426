/**
 * Integrations API client. All responses consumed with nullish coalescing and safe arrays.
 */

import { api } from "@/lib/api";
import type {
  Integration,
  Connector,
  DeploymentTarget,
  RunRecord,
  LogEntry,
  AdapterConfig,
  RepoLink,
  IntegrationAuditEntry,
} from "@/types/integrations";

const BASE = "projects";

function safeList<T>(data: unknown): T[] {
  const raw = data ?? [];
  return Array.isArray(raw) ? (raw as T[]) : [];
}

function safePaginated<T>(r: unknown): { items: T[]; count: number } {
  if (r && typeof r === "object" && "data" in (r as Record<string, unknown>)) {
    const obj = r as { data?: unknown; count?: number };
    return {
      items: safeList<T>(obj.data),
      count: typeof obj.count === "number" ? obj.count : 0,
    };
  }
  return { items: safeList<T>(r), count: 0 };
}

export const integrationsApi = {
  getList: (projectId: string) =>
    api.get<Integration[]>(`${BASE}/${projectId}/integrations`).then((r) => safeList<Integration>(r ?? [])),

  create: (projectId: string, data: Partial<Integration>) =>
    api.post<Integration>(`${BASE}/${projectId}/integrations`, data),

  update: (projectId: string, integrationId: string, data: Partial<Integration>) =>
    api.patch<Integration>(`${BASE}/${projectId}/integrations/${integrationId}`, data),

  triggerRun: (integrationId: string) =>
    api.post<RunRecord>(`integrations/${integrationId}/run`, {}),

  getRuns: (integrationId: string, params?: { page?: number; limit?: number }) => {
    const q = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
    return api
      .get<{ data?: RunRecord[]; items?: RunRecord[]; count?: number }>(`integrations/${integrationId}/runs${q}`)
      .then((r) => {
        const raw = r ?? {};
        if (typeof raw === "object" && Array.isArray((raw as { items?: unknown }).items)) {
          const o = raw as { items: RunRecord[]; count?: number };
          return { items: o.items ?? [], count: typeof o.count === "number" ? o.count : (o.items?.length ?? 0) };
        }
        return safePaginated<RunRecord>(r);
      });
  },

  getLogs: (integrationId: string, params?: { runId?: string; level?: string; limit?: number }) => {
    const q = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
    return api.get<LogEntry[]>(`integrations/${integrationId}/logs${q}`).then((r) => safeList<LogEntry>(r ?? []));
  },

  getAdapters: (integrationId: string) =>
    api.get<AdapterConfig[]>(`integrations/${integrationId}/adapters`).then((r) => safeList<AdapterConfig>(r ?? [])),

  saveAdapters: (integrationId: string, adapters: Partial<AdapterConfig>[]) =>
    api.post<AdapterConfig[]>(`integrations/${integrationId}/adapters`, { adapters }),

  getDeploymentTargets: (projectId: string) =>
    api
      .get<DeploymentTarget[]>(`${BASE}/${projectId}/deployment-targets`)
      .then((r) => safeList<DeploymentTarget>(r ?? [])),

  activateDeployment: (deploymentTargetId: string) =>
    api.put<{ ok: boolean }>(`deployments/${deploymentTargetId}/activate`, {}),

  getHealth: (projectId: string, integrationId: string) =>
    api.get<{ healthScore: number; lastError?: string }>(
      `${BASE}/${projectId}/integrations/${integrationId}/health`
    ),

  getConnectors: (integrationId: string) =>
    api.get<Connector[]>(`integrations/${integrationId}/connectors`).then((r) => safeList<Connector>(r ?? [])),

  getRepoLinks: (projectId: string) =>
    api.get<RepoLink[]>(`${BASE}/${projectId}/repo-links`).then((r) => safeList<RepoLink>(r ?? [])),

  saveRepoLink: (projectId: string, data: Partial<RepoLink>) =>
    api.post<RepoLink>(`${BASE}/${projectId}/repo-links`, data),

  getAuditTrail: (projectId: string, integrationId?: string) => {
    const q = integrationId ? `?integrationId=${integrationId}` : "";
    return api
      .get<IntegrationAuditEntry[]>(`${BASE}/${projectId}/integrations/audit${q}`)
      .then((r) => safeList<IntegrationAuditEntry>(r ?? []));
  },
};
