/**
 * Projects API client. All responses consumed with nullish coalescing and safe arrays.
 */

import { api } from "@/lib/api";
import { safeArray } from "@/lib/api";
import type {
  Project,
  Roadmap,
  Ticket,
  PR,
  Release,
  CIJob,
  AgentSuggestion,
  ProjectApproval,
  ProjectCronjobOverview,
  RunArtifact,
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
};
