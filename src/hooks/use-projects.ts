/**
 * React Query hooks for Projects Dashboard.
 * All array data uses safeArray / (data ?? []); responses validated before use.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { projectsApi } from "@/api/projects";
import * as mock from "@/api/projects-mock";
import { safeArray } from "@/lib/api";
import type {
  Roadmap,
  RoadmapItem,
  Ticket,
  TicketStatus,
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

const USE_MOCK =
  !import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_USE_MOCK_PROJECTS === "true";

const keys = {
  list: () => ["projects", "list"] as const,
  detail: (id: string) => ["projects", "detail", id] as const,
  backlog: (id: string) => ["projects", "backlog", id] as const,
  roadmapItems: (id: string) => ["projects", "roadmapItems", id] as const,
  roadmaps: (id: string) => ["projects", "roadmaps", id] as const,
  tickets: (id: string) => ["projects", "tickets", id] as const,
  prs: (id: string) => ["projects", "prs", id] as const,
  releases: (id: string) => ["projects", "releases", id] as const,
  ci: (id: string) => ["projects", "ci", id] as const,
  agentSuggestions: (id: string) => ["projects", "agentsuggestions", id] as const,
  approvals: (id?: string) => ["projects", "approvals", id ?? "all"] as const,
  cronjobs: (id?: string) => ["projects", "cronjobs", id ?? "all"] as const,
  runs: (id: string) => ["projects", "runs", id] as const,
  history: (id: string) => ["projects", "history", id] as const,
};

export function useProjectsList() {
  const query = useQuery({
    queryKey: keys.list(),
    queryFn: () => (USE_MOCK ? mock.mockGetProjects() : projectsApi.getList()),
    staleTime: 60 * 1000,
  });
  const data = query.data ?? [];
  const list = Array.isArray(data) ? data : [];
  return { ...query, data: list, items: list };
}

export function useProject(id: string | undefined | null, enabled = true) {
  return useQuery({
    queryKey: keys.detail(id ?? ""),
    queryFn: () =>
      USE_MOCK ? mock.mockGetProject(id!) : projectsApi.get(id!),
    enabled: Boolean(id) && enabled,
    staleTime: 60 * 1000,
  });
}

export function useProjectBacklog(projectId: string | undefined | null) {
  const query = useQuery({
    queryKey: keys.backlog(projectId ?? ""),
    queryFn: () =>
      USE_MOCK
        ? mock.mockGetBacklog(projectId!)
        : projectsApi.getBacklog(projectId!),
    enabled: Boolean(projectId),
    staleTime: 30 * 1000,
  });
  const items = safeArray<BacklogItem>(query.data);
  return { ...query, items };
}

export function useProjectRoadmapItems(projectId: string | undefined | null) {
  const query = useQuery({
    queryKey: keys.roadmapItems(projectId ?? ""),
    queryFn: () =>
      USE_MOCK
        ? mock.mockGetRoadmapItems(projectId!)
        : projectsApi.getRoadmapItems(projectId!),
    enabled: Boolean(projectId),
    staleTime: 60 * 1000,
  });
  const items = safeArray<RoadmapItem>(query.data);
  return { ...query, items };
}

export function useProjectHistory(projectId: string | undefined | null) {
  const query = useQuery({
    queryKey: keys.history(projectId ?? ""),
    queryFn: () =>
      USE_MOCK
        ? mock.mockGetHistory(projectId!)
        : projectsApi.getHistory(projectId!),
    enabled: Boolean(projectId),
    staleTime: 15 * 1000,
  });
  const items = safeArray<AgentRun>(query.data);
  return { ...query, items };
}

export function useProjectRoadmaps(projectId: string | undefined | null) {
  const query = useQuery({
    queryKey: keys.roadmaps(projectId ?? ""),
    queryFn: () =>
      USE_MOCK
        ? mock.mockGetRoadmaps(projectId!)
        : projectsApi.getRoadmaps(projectId!),
    enabled: Boolean(projectId),
    staleTime: 60 * 1000,
  });
  const items = safeArray<Roadmap>(query.data);
  return { ...query, items };
}

export function useProjectTickets(projectId: string | undefined | null) {
  const query = useQuery({
    queryKey: keys.tickets(projectId ?? ""),
    queryFn: () =>
      USE_MOCK
        ? mock.mockGetTickets(projectId!)
        : projectsApi.getTickets(projectId!),
    enabled: Boolean(projectId),
    staleTime: 30 * 1000,
  });
  const items = safeArray<Ticket>(query.data);
  return { ...query, items };
}

export function useProjectPRs(projectId: string | undefined | null) {
  const query = useQuery({
    queryKey: keys.prs(projectId ?? ""),
    queryFn: () =>
      USE_MOCK ? mock.mockGetPRs(projectId!) : projectsApi.getPRs(projectId!),
    enabled: Boolean(projectId),
    staleTime: 30 * 1000,
  });
  const items = safeArray<PR>(query.data);
  return { ...query, items };
}

export function useProjectReleases(projectId: string | undefined | null) {
  const query = useQuery({
    queryKey: keys.releases(projectId ?? ""),
    queryFn: () =>
      USE_MOCK
        ? mock.mockGetReleases(projectId!)
        : projectsApi.getReleases(projectId!),
    enabled: Boolean(projectId),
    staleTime: 60 * 1000,
  });
  const items = safeArray<Release>(query.data);
  return { ...query, items };
}

export function useProjectCI(projectId: string | undefined | null) {
  const query = useQuery({
    queryKey: keys.ci(projectId ?? ""),
    queryFn: () =>
      USE_MOCK ? mock.mockGetCI(projectId!) : projectsApi.getCI(projectId!),
    enabled: Boolean(projectId),
    staleTime: 30 * 1000,
  });
  const items = safeArray<CIJob>(query.data);
  return { ...query, items };
}

export function useProjectAgentSuggestions(projectId: string | undefined | null) {
  const query = useQuery({
    queryKey: keys.agentSuggestions(projectId ?? ""),
    queryFn: () =>
      USE_MOCK
        ? mock.mockGetAgentSuggestions(projectId!)
        : projectsApi.getAgentSuggestions(projectId!),
    enabled: Boolean(projectId),
    staleTime: 30 * 1000,
  });
  const items = safeArray<AgentSuggestion>(query.data);
  return { ...query, items };
}

export function useProjectApprovals(projectId?: string | null) {
  const query = useQuery({
    queryKey: keys.approvals(projectId ?? undefined),
    queryFn: () =>
      USE_MOCK
        ? mock.mockGetApprovals(projectId ?? undefined)
        : projectsApi.getApprovals(projectId ?? undefined),
    staleTime: 30 * 1000,
  });
  const items = safeArray<ProjectApproval>(query.data);
  return { ...query, items };
}

export function useProjectCronjobs(projectId?: string | null) {
  const query = useQuery({
    queryKey: keys.cronjobs(projectId ?? undefined),
    queryFn: () =>
      USE_MOCK
        ? mock.mockGetCronjobs(projectId ?? undefined)
        : projectsApi.getCronjobs(projectId ?? undefined),
    staleTime: 60 * 1000,
  });
  const items = safeArray<ProjectCronjobOverview>(query.data);
  return { ...query, items };
}

export function useProjectRuns(projectId: string | undefined | null) {
  const query = useQuery({
    queryKey: keys.runs(projectId ?? ""),
    queryFn: () =>
      USE_MOCK
        ? mock.mockGetRuns(projectId!)
        : projectsApi.getRuns(projectId!),
    enabled: Boolean(projectId),
    staleTime: 30 * 1000,
  });
  const items = safeArray<RunArtifact>(query.data);
  return { ...query, items };
}

export function useMoveTicket(projectId: string | undefined | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, status }: { ticketId: string; status: TicketStatus }) =>
      USE_MOCK
        ? mock.mockMoveTicket(ticketId, status)
        : projectsApi.moveTicket(ticketId, status as string),
    onSuccess: () => {
      if (projectId) qc.invalidateQueries({ queryKey: keys.tickets(projectId) });
      toast.success("Ticket moved");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to move ticket");
    },
  });
}

export function useAcceptSuggestion(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (suggestionId: string) =>
      USE_MOCK
        ? mock.mockAcceptSuggestion(suggestionId)
        : projectsApi.acceptSuggestion(suggestionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.agentSuggestions(projectId) });
      toast.success("Suggestion applied");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to apply suggestion");
    },
  });
}

export function useDismissSuggestion(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (suggestionId: string) =>
      USE_MOCK
        ? mock.mockDismissSuggestion(suggestionId)
        : projectsApi.dismissSuggestion(suggestionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.agentSuggestions(projectId) });
      toast.success("Suggestion dismissed");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to dismiss");
    },
  });
}

export function useReviewPR(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      prId,
      action,
      body,
    }: {
      prId: string;
      action: "approve" | "request_changes" | "comment";
      body?: string;
    }) =>
      USE_MOCK
        ? Promise.resolve({ ok: true })
        : projectsApi.reviewPR(prId, action, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.prs(projectId) });
      toast.success("Review submitted");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to submit review");
    },
  });
}

export function useCreateBacklogItem(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; description?: string; priority?: string }) =>
      USE_MOCK
        ? mock.mockCreateBacklogItem(projectId, data)
        : projectsApi.createBacklogItem(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.backlog(projectId) });
      toast.success("Backlog item added");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to add backlog item");
    },
  });
}

export function useCreateTicket(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; description?: string; priority?: string }) =>
      USE_MOCK
        ? mock.mockCreateTicket(projectId, data)
        : projectsApi.createTicket(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.tickets(projectId) });
      toast.success("Ticket created");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to create ticket");
    },
  });
}

export function useRunAgent(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (type: string) =>
      USE_MOCK
        ? mock.mockRunAgent(projectId, type)
        : projectsApi.runAgent(projectId, type),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.history(projectId) });
      toast.loading("Agent run started...", { id: "agent-run" });
      setTimeout(() => toast.success("Agent run completed", { id: "agent-run" }), 2000);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to start agent");
    },
  });
}

export function useTriggerCronjob(projectId?: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cronjobId: string) =>
      USE_MOCK
        ? mock.mockTriggerCronjob(cronjobId)
        : projectsApi.triggerCronjob(cronjobId),
    onSuccess: () => {
      if (projectId) qc.invalidateQueries({ queryKey: keys.history(projectId) });
      qc.invalidateQueries({ queryKey: keys.cronjobs(projectId ?? undefined) });
      toast.success("Cronjob triggered");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to trigger cronjob");
    },
  });
}

export function useBulkUpdateBacklog(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, updates }: { ids: string[]; updates: { status?: string } }) =>
      USE_MOCK
        ? mock.mockBulkUpdateBacklog(projectId, ids, updates)
        : projectsApi.bulkUpdateBacklog(projectId, ids, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.backlog(projectId) });
      toast.success("Backlog updated");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update backlog");
    },
  });
}

export function useBulkUpdateTickets(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, updates }: { ids: string[]; updates: { status?: string; assigneeId?: string } }) =>
      USE_MOCK
        ? mock.mockBulkUpdateTickets(projectId, ids, updates)
        : projectsApi.bulkUpdateTickets(projectId, ids, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.tickets(projectId) });
      toast.success("Tickets updated");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update tickets");
    },
  });
}
