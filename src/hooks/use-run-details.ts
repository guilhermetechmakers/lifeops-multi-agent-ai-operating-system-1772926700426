/**
 * React Query hooks for Run Details page.
 * All array data uses safeArray / (data ?? []); responses validated before use.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { runsApi } from "@/api/runs";
import * as mock from "@/api/runs-mock";
import { safeArray } from "@/lib/api";
import type {
  TraceEvent,
  LogEvent,
  DiffChunk,
  Artifact,
  TimingSection,
  ReversibleAction,
  AuditEvent,
  RevertPayload,
} from "@/types/run-details";

const USE_MOCK =
  !import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_USE_MOCK_RUNS === "true";

const keys = {
  detail: (runId: string, cronjobId?: string) =>
    ["runs", "detail", runId, cronjobId] as const,
  trace: (runId: string) => ["runs", "trace", runId] as const,
  logs: (runId: string) => ["runs", "logs", runId] as const,
  diffs: (runId: string) => ["runs", "diffs", runId] as const,
  artifacts: (runId: string) => ["runs", "artifacts", runId] as const,
};

export function useRunDetails(runId: string | undefined | null, cronjobId?: string) {
  const query = useQuery({
    queryKey: keys.detail(runId ?? "", cronjobId),
    queryFn: () =>
      USE_MOCK
        ? mock.mockGetRunDetail(runId!, cronjobId ?? undefined)
        : runsApi.get(runId!),
    enabled: Boolean(runId),
    staleTime: 30 * 1000,
  });

  const run = query.data ?? null;
  const trace = safeArray<TraceEvent>(run?.trace);
  const logs = safeArray<LogEvent>(run?.logs);
  const diffs = safeArray<DiffChunk>(run?.diffs);
  const artifacts = safeArray<Artifact>(run?.artifacts);
  const timing = safeArray<TimingSection>(run?.timing);
  const reversibleActions = safeArray<ReversibleAction>(run?.reversibleActions);
  const auditTrail = safeArray<AuditEvent>(run?.auditTrail);

  return {
    ...query,
    run,
    trace,
    logs,
    diffs,
    artifacts,
    timing,
    reversibleActions,
    auditTrail,
  };
}

export function useRevertRun(runId: string | undefined | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: RevertPayload) =>
      USE_MOCK ? mock.mockRevertRun(runId!, payload) : runsApi.revert(runId!, payload),
    onSuccess: () => {
      if (runId) {
        qc.invalidateQueries({ queryKey: keys.detail(runId) });
        qc.invalidateQueries({ queryKey: ["runs"] });
      }
      toast.success("Revert initiated successfully");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Revert failed");
    },
  });
}
