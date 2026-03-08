/**
 * Projects API client. All responses consumed with nullish coalescing and safe arrays.
 */

import { api } from "@/lib/api";
import { safeArray } from "@/lib/api";
import type {
  Project,
  Roadmap,
  RoadmapItem,
  Ticket,
  PR,
  Release,
  CIJob,
  AgentSuggestion,
  ProjectApproval,
  ProjectCronjobOverview,
  RunArtifact,
  BacklogItem,
  AgentRun,
} from "@/types/projects";

const BASE = "projects";

function safeList<T>(data: unknown): T[] {
  const raw = data ?? [];
  return Array.isArray(raw) ? (raw as T[]) : [];
}

export const projectsApi = {
  getList: () =>
    api.get<Project[] | { data: Project[] }>(BASE).then((r) => {
      if (r && typeof r === "object" && "data" in (r as Record<string, unknown>)) {
        return safeList<Project>((r as { data: unknown }).data);
      }
      return safeList<Project>(r);
    }),

  get: (id: string) => api.get<Project>(`${BASE}/${id}`),

  getBacklog: (projectId: string) =>
    api.get<BacklogItem[]>(`${BASE}/${projectId}/backlog`).then((r) => safeArray<BacklogItem>(r ?? [])),

  getRoadmapItems: (projectId: string) =>
    api.get<RoadmapItem[]>(`${BASE}/${projectId}/roadmap-items`).then((r) => safeArray<RoadmapItem>(r ?? [])),

  getRoadmaps: (projectId: string) =>
    api.get<Roadmap[]>(`${BASE}/${projectId}/roadmaps`).then((r) => safeArray<Roadmap>(r ?? [])),

  getTickets: (projectId: string, params?: { status?: string }) => {
    const q = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
    return api.get<Ticket[]>(`${BASE}/${projectId}/tickets${q}`).then((r) => safeArray<Ticket>(r ?? []));
  },

  getPRs: (projectId: string) =>
    api.get<PR[]>(`${BASE}/${projectId}/prs`).then((r) => safeArray<PR>(r ?? [])),

  getReleases: (projectId: string) =>
    api.get<Release[]>(`${BASE}/${projectId}/releases`).then((r) => safeArray<Release>(r ?? [])),

  getCI: (projectId: string) =>
    api.get<CIJob[]>(`${BASE}/${projectId}/ci`).then((r) => safeArray<CIJob>(r ?? [])),

  getAgentSuggestions: (projectId: string) =>
    api.get<AgentSuggestion[]>(`${BASE}/${projectId}/agentsuggestions`).then((r) => safeArray<AgentSuggestion>(r ?? [])),

  getRuns: (projectId: string) =>
    api.get<RunArtifact[]>(`${BASE}/${projectId}/runs`).then((r) => safeArray<RunArtifact>(r ?? [])),

  getHistory: (projectId: string) =>
    api.get<AgentRun[]>(`${BASE}/${projectId}/history`).then((r) => safeArray<AgentRun>(r ?? [])),

  createBacklogItem: (projectId: string, data: { title: string; description?: string; priority?: string }) =>
    api.post<BacklogItem>(`${BASE}/${projectId}/backlog`, data),

  createTicket: (projectId: string, data: { title: string; description?: string; priority?: string }) =>
    api.post<Ticket>(`${BASE}/${projectId}/tickets`, data),

  runAgent: (projectId: string, type: string) =>
    api.post<AgentRun>("agents/run", { projectId, type }),

  triggerCronjob: (cronjobId: string) =>
    api.post<{ ok: boolean }>("cronjobs/trigger", { cronjobId }),

  bulkUpdateBacklog: (projectId: string, ids: string[], updates: { status?: string }) =>
    api.post<{ ok: boolean }>(`${BASE}/${projectId}/backlog/bulk`, { ids, updates }),

  bulkUpdateTickets: (projectId: string, ids: string[], updates: { status?: string; assigneeId?: string }) =>
    api.post<{ ok: boolean }>(`${BASE}/${projectId}/tickets/bulk`, { ids, updates }),

  updateProjectStatus: (projectId: string, status: string) =>
    api.put<Project>(`${BASE}/${projectId}/status`, { status }),

  getApprovals: (projectId?: string) => {
    const q = projectId ? `?projectId=${projectId}` : "";
    return api.get<ProjectApproval[]>(`approvals${q}`).then((r) => safeArray<ProjectApproval>(r ?? []));
  },

  getCronjobs: (projectId?: string) => {
    const q = projectId ? `?projectId=${projectId}` : "";
    return api.get<ProjectCronjobOverview[]>(`cronjobs${q}`).then((r) => safeArray<ProjectCronjobOverview>(r ?? []));
  },

  moveTicket: (ticketId: string, status: string) =>
    api.post<{ ok: boolean }>(`tickets/${ticketId}/move`, { status }),

  commentTicket: (ticketId: string, comment: string) =>
    api.post<{ ok: boolean }>(`tickets/${ticketId}/comment`, { comment }),

  reviewPR: (prId: string, action: "approve" | "request_changes" | "comment", body?: string) =>
    api.post<{ ok: boolean }>(`prs/${prId}/review`, { action, body }),

  acceptSuggestion: (suggestionId: string) =>
    api.post<{ ok: boolean }>(`agentsuggestions/${suggestionId}/accept`, {}),

  dismissSuggestion: (suggestionId: string) =>
    api.post<{ ok: boolean }>(`agentsuggestions/${suggestionId}/dismiss`, {}),

  updateBacklogItem: (projectId: string, itemId: string, payload: Partial<BacklogItem>) =>
    api.patch<BacklogItem>(`${BASE}/${projectId}/backlog/${itemId}`, payload),

  updateRoadmapItem: (projectId: string, itemId: string, payload: Partial<RoadmapItem>) =>
    api.patch<RoadmapItem>(`${BASE}/${projectId}/roadmap-items/${itemId}`, payload),
};
