/**
 * Runs API client for Run Details page.
 * All responses consumed with nullish coalescing and safe arrays.
 */

import { api } from "@/lib/api";
import { safeArray } from "@/lib/api";
import type {
  RunDetail,
  TraceEvent,
  LogEvent,
  DiffChunk,
  Artifact,
  RevertPayload,
  RevertResponse,
} from "@/types/run-details";

const BASE = "runs";

function safeRunDetail(data: unknown): RunDetail | null {
  if (data && typeof data === "object" && "id" in (data as Record<string, unknown>)) {
    const r = data as RunDetail;
    return {
      ...r,
      trace: safeArray<TraceEvent>(r.trace),
      logs: safeArray<LogEvent>(r.logs),
      diffs: safeArray<DiffChunk>(r.diffs),
      artifacts: safeArray<Artifact>(r.artifacts),
      timing: safeArray(r.timing),
      reversibleActions: safeArray(r.reversibleActions),
      auditTrail: safeArray(r.auditTrail),
    };
  }
  return null;
}

export const runsApi = {
  get: (runId: string) =>
    api.get<RunDetail>(`${BASE}/${runId}`).then((r) => safeRunDetail(r ?? {})),

  getTrace: (runId: string) =>
    api.get<TraceEvent[]>(`${BASE}/${runId}/trace`).then((r) => safeArray<TraceEvent>(r)),

  getLogs: (runId: string) =>
    api.get<LogEvent[]>(`${BASE}/${runId}/logs`).then((r) => safeArray<LogEvent>(r)),

  getDiffs: (runId: string) =>
    api.get<DiffChunk[]>(`${BASE}/${runId}/diffs`).then((r) => safeArray<DiffChunk>(r)),

  getArtifacts: (runId: string) =>
    api.get<Artifact[]>(`${BASE}/${runId}/artifacts`).then((r) => safeArray<Artifact>(r)),

  revert: (runId: string, payload: RevertPayload) =>
    api.post<RevertResponse>(`${BASE}/${runId}/revert`, payload),
};
