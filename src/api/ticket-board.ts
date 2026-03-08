/**
 * Ticket Board API client.
 * All responses consumed with nullish coalescing and safe arrays.
 */

import { api } from "@/lib/api";
import { safeArray } from "@/lib/api";
import type { Ticket, TicketStatus } from "@/types/projects";
import type { Column, Sprint, Rule, Run, Artifact } from "@/types/ticket-board";

const BASE = "projects";

function safeList<T>(data: unknown): T[] {
  const raw = data ?? [];
  return Array.isArray(raw) ? (raw as T[]) : [];
}

export interface TicketFilters {
  assigneeId?: string;
  labels?: string;
  priority?: string;
  status?: string;
  sprintId?: string;
  search?: string;
}

export const ticketBoardApi = {
  getTickets: (projectId: string, filters?: TicketFilters) => {
    const params = filters ? new URLSearchParams(filters as Record<string, string>).toString() : "";
    const q = params ? `?${params}` : "";
    return api
      .get<Ticket[]>(`${BASE}/${projectId}/tickets${q}`)
      .then((r) => safeArray<Ticket>(r ?? []));
  },

  getColumns: (projectId: string) =>
    api
      .get<Column[]>(`${BASE}/${projectId}/columns`)
      .then((r) => safeArray<Column>(r ?? [])),

  getSprints: (projectId: string) =>
    api
      .get<Sprint[]>(`${BASE}/${projectId}/sprints`)
      .then((r) => safeArray<Sprint>(r ?? [])),

  getRules: (projectId: string) =>
    api
      .get<Rule[]>(`${BASE}/${projectId}/rules`)
      .then((r) => safeArray<Rule>(r ?? [])),

  createRule: (projectId: string, data: Partial<Rule>) =>
    api.post<Rule>(`${BASE}/${projectId}/rules`, data),

  updateRule: (projectId: string, ruleId: string, data: Partial<Rule>) =>
    api.patch<Rule>(`${BASE}/${projectId}/rules/${ruleId}`, data),

  patchTicket: (ticketId: string, data: Partial<Ticket>) =>
    api.patch<Ticket>(`tickets/${ticketId}`, data),

  bulkUpdateTickets: (
    projectId: string,
    ids: string[],
    updates: Partial<Pick<Ticket, "status" | "assigneeId" | "priority" | "sprintId"> & { labels?: string[] }>
  ) =>
    api.post<{ ok: boolean }>(`${BASE}/${projectId}/tickets/bulk`, { ids, updates }),

  runAutomation: (projectId: string, ruleId?: string) =>
    api.post<Run>("automation/run", { projectId, ruleId }),

  getRuns: (limit = 20) =>
    api.get<Run[]>(`agents/runs?limit=${limit}`).then((r) => safeArray<Run>(r ?? [])),

  getArtifact: (artifactId: string) =>
    api.get<Artifact>(`artifacts/${artifactId}`),

  moveTicket: (ticketId: string, status: TicketStatus) =>
    api.post<{ ok: boolean }>(`tickets/${ticketId}/move`, { status }),
};
