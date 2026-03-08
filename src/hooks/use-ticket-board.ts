/**
 * React Query hooks for Ticket Board.
 * All array data uses safeArray / (data ?? []); responses validated before use.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ticketBoardApi, type TicketFilters } from "@/api/ticket-board";
import * as mock from "@/api/ticket-board-mock";
import { safeArray } from "@/lib/api";
import type { Ticket, TicketStatus } from "@/types/projects";
import type { Column, Sprint, Rule, Run } from "@/types/ticket-board";

const USE_MOCK =
  !import.meta.env.VITE_API_URL || import.meta.env.VITE_USE_MOCK_PROJECTS === "true";

const keys = {
  tickets: (projectId: string, filters?: TicketFilters) =>
    ["ticket-board", "tickets", projectId, filters] as const,
  columns: (projectId: string) => ["ticket-board", "columns", projectId] as const,
  sprints: (projectId: string) => ["ticket-board", "sprints", projectId] as const,
  rules: (projectId: string) => ["ticket-board", "rules", projectId] as const,
  runs: () => ["ticket-board", "runs"] as const,
};

export function useTicketBoardTickets(
  projectId: string | undefined | null,
  filters?: TicketFilters
) {
  const query = useQuery({
    queryKey: keys.tickets(projectId ?? "", filters),
    queryFn: () =>
      USE_MOCK
        ? mock.mockGetTickets(projectId!, filters as Record<string, string>)
        : ticketBoardApi.getTickets(projectId!, filters),
    enabled: Boolean(projectId),
    staleTime: 30 * 1000,
  });
  const items = safeArray<Ticket>(query.data);
  return { ...query, items };
}

export function useTicketBoardColumns(projectId: string | undefined | null) {
  const query = useQuery({
    queryKey: keys.columns(projectId ?? ""),
    queryFn: () =>
      USE_MOCK ? mock.mockGetColumns(projectId!) : ticketBoardApi.getColumns(projectId!),
    enabled: Boolean(projectId),
    staleTime: 60 * 1000,
  });
  const items = safeArray<Column>(query.data);
  return { ...query, items };
}

export function useTicketBoardSprints(projectId: string | undefined | null) {
  const query = useQuery({
    queryKey: keys.sprints(projectId ?? ""),
    queryFn: () =>
      USE_MOCK ? mock.mockGetSprints(projectId!) : ticketBoardApi.getSprints(projectId!),
    enabled: Boolean(projectId),
    staleTime: 60 * 1000,
  });
  const items = safeArray<Sprint>(query.data);
  return { ...query, items };
}

export function useTicketBoardRules(projectId: string | undefined | null) {
  const query = useQuery({
    queryKey: keys.rules(projectId ?? ""),
    queryFn: () =>
      USE_MOCK ? mock.mockGetRules(projectId!) : ticketBoardApi.getRules(projectId!),
    enabled: Boolean(projectId),
    staleTime: 60 * 1000,
  });
  const items = safeArray<Rule>(query.data);
  return { ...query, items };
}

export function useTicketBoardRuns(limit?: number) {
  const query = useQuery({
    queryKey: keys.runs(),
    queryFn: () =>
      USE_MOCK ? mock.mockGetRuns(limit) : ticketBoardApi.getRuns(limit),
    staleTime: 15 * 1000,
  });
  const items = safeArray<Run>(query.data);
  return { ...query, items };
}

export function useMoveTicketBoardTicket(projectId: string | undefined | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, status }: { ticketId: string; status: TicketStatus }) =>
      USE_MOCK
        ? mock.mockMoveTicket(ticketId, status)
        : ticketBoardApi.moveTicket(ticketId, status),
    onSuccess: () => {
      if (projectId) qc.invalidateQueries({ queryKey: keys.tickets(projectId) });
      toast.success("Ticket moved");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to move ticket");
    },
  });
}

export function usePatchTicketBoardTicket(projectId: string | undefined | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, data }: { ticketId: string; data: Partial<Ticket> }) =>
      USE_MOCK
        ? mock.mockPatchTicket(ticketId, data)
        : ticketBoardApi.patchTicket(ticketId, data),
    onSuccess: () => {
      if (projectId) qc.invalidateQueries({ queryKey: keys.tickets(projectId) });
      toast.success("Ticket updated");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update ticket");
    },
  });
}

export function useBulkUpdateTicketBoard(projectId: string | undefined | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      ids,
      updates,
    }: {
      ids: string[];
      updates: Partial<
        Pick<Ticket, "status" | "assigneeId" | "priority" | "sprintId">
        & { labels?: string[] }
      >;
    }) =>
      USE_MOCK
        ? mock.mockBulkUpdateTickets(projectId!, ids, updates)
        : ticketBoardApi.bulkUpdateTickets(projectId!, ids, updates),
    onSuccess: () => {
      if (projectId) qc.invalidateQueries({ queryKey: keys.tickets(projectId) });
      toast.success("Tickets updated");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update tickets");
    },
  });
}

export function useCreateTicketBoardRule(projectId: string | undefined | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Rule>) =>
      USE_MOCK
        ? mock.mockCreateRule(projectId!, data)
        : ticketBoardApi.createRule(projectId!, data),
    onSuccess: () => {
      if (projectId) qc.invalidateQueries({ queryKey: keys.rules(projectId) });
      toast.success("Rule created");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to create rule");
    },
  });
}

export function useUpdateTicketBoardRule(projectId: string | undefined | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ruleId, data }: { ruleId: string; data: Partial<Rule> }) =>
      USE_MOCK
        ? mock.mockUpdateRule(projectId!, ruleId, data)
        : ticketBoardApi.updateRule(projectId!, ruleId, data),
    onSuccess: () => {
      if (projectId) qc.invalidateQueries({ queryKey: keys.rules(projectId) });
      toast.success("Rule updated");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update rule");
    },
  });
}

export function useRunTicketBoardAutomation(projectId: string | undefined | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ruleId?: string) =>
      USE_MOCK
        ? mock.mockRunAutomation(projectId!, ruleId)
        : ticketBoardApi.runAutomation(projectId!, ruleId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.runs() });
      if (projectId) qc.invalidateQueries({ queryKey: keys.tickets(projectId) });
      toast.success("Automation started");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to run automation");
    },
  });
}
