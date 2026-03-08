/**
 * React Query hooks for Agent Trace & Debugger.
 * All array data uses safeArray / (data ?? []); responses validated.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { debugTraceApi } from "@/api/debug-trace";
import * as mock from "@/api/debug-trace-mock";
import { safeArray } from "@/lib/api";
import type { Agent, Message, RunSummary, RevertPayload, ExportOptions } from "@/types/agent-trace";

const USE_MOCK =
  !import.meta.env.VITE_API_URL || import.meta.env.VITE_USE_MOCK_DEBUG === "true";

const keys = {
  trace: (runId: string) => ["debug", "trace", runId] as const,
  memory: (runId: string) => ["debug", "trace", runId, "memory"] as const,
  runs: (cronJobId: string) => ["debug", "runs", cronJobId] as const,
};

export function useTrace(runId: string | null) {
  const query = useQuery({
    queryKey: keys.trace(runId ?? ""),
    queryFn: () =>
      USE_MOCK ? mock.mockGetTrace(runId!) : debugTraceApi.getTrace(runId!),
    enabled: Boolean(runId),
    staleTime: 30 * 1000,
  });

  const data = query.data ?? null;
  const graph = data?.graph ?? { agents: [], messages: [] };
  const agents = safeArray<Agent>(graph.agents);
  const messages = safeArray<Message>(graph.messages);
  const steps = Array.isArray(data?.steps) ? data.steps : [];
  const artifacts = Array.isArray(data?.artifacts) ? data.artifacts : [];

  return {
    ...query,
    data,
    agents,
    messages,
    steps,
    artifacts,
    memory: data?.memory ?? { scopes: [], entries: [] },
  };
}

export function useTraceMemory(runId: string | null) {
  return useQuery({
    queryKey: keys.memory(runId ?? ""),
    queryFn: () =>
      USE_MOCK ? mock.mockGetMemory(runId!) : debugTraceApi.getMemory(runId!),
    enabled: Boolean(runId),
    staleTime: 30 * 1000,
  });
}

export function useDebugRuns(cronJobId: string | null) {
  const query = useQuery({
    queryKey: keys.runs(cronJobId ?? ""),
    queryFn: () =>
      USE_MOCK ? mock.mockGetRuns(cronJobId!) : debugTraceApi.getRuns(cronJobId!),
    enabled: Boolean(cronJobId),
    staleTime: 60 * 1000,
  });

  const raw = query.data as { runs?: RunSummary[] } | undefined;
  const runs: RunSummary[] = Array.isArray(raw?.runs) ? raw.runs : [];
  return { ...query, runs };
}

export function useRevertTrace(runId: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: RevertPayload) =>
      USE_MOCK ? mock.mockRevert(runId!) : debugTraceApi.revert(runId!, payload),
    onSuccess: () => {
      if (runId) {
        qc.invalidateQueries({ queryKey: keys.trace(runId) });
        qc.invalidateQueries({ queryKey: keys.memory(runId) });
      }
      toast.success("Revert initiated successfully");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Revert failed");
    },
  });
}

export function useExportTrace(runId: string | null) {
  return useMutation({
    mutationFn: (options: ExportOptions) =>
      USE_MOCK ? mock.mockExport(runId!, options) : debugTraceApi.exportRun(runId!, options),
    onSuccess: (_, variables) => {
      toast.success(`Export (${variables.format}) started`);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Export failed");
    },
  });
}
