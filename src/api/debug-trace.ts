/**
 * Debug Trace API — Agent Trace & Debugger.
 * GET /debug/trace/:runId, GET /debug/trace/:runId/memory, POST revert, GET runs, POST export.
 */

import { api, safeArray } from "@/lib/api";
import type {
  TraceResponse,
  GraphData,
  MemorySnapshot,
  RunSummary,
  RevertPayload,
  RevertResponse,
  ExportOptions,
  RunDetailsPayload,
} from "@/types/agent-trace";

const BASE = "debug";

function safeGraphData(data: unknown): GraphData {
  const raw = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  return {
    agents: safeArray(raw.agents),
    messages: safeArray(raw.messages),
  };
}

function safeMemorySnapshot(data: unknown): MemorySnapshot {
  const raw = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  return {
    scopes: safeArray(raw.scopes),
    entries: safeArray(raw.entries),
  };
}

export const debugTraceApi = {
  getTrace: (runId: string) =>
    api.get<TraceResponse>(`${BASE}/trace/${runId}`).then((r) => {
      const res = (r ?? {}) as TraceResponse & { graph?: unknown; memory?: unknown; steps?: unknown; artifacts?: unknown };
      return {
        graph: safeGraphData(res.graph),
        memory: safeMemorySnapshot(res.memory),
        steps: Array.isArray(res.steps) ? res.steps : [],
        artifacts: Array.isArray(res.artifacts) ? res.artifacts : [],
        runId: res.runId ?? runId,
      } as TraceResponse;
    }),

  getMemory: (runId: string) =>
    api.get<MemorySnapshot>(`${BASE}/trace/${runId}/memory`).then((r) => safeMemorySnapshot(r ?? {})),

  revert: (runId: string, payload: RevertPayload) =>
    api.post<RevertResponse>(`${BASE}/trace/${runId}/revert`, payload),

  getRuns: (cronJobId: string) =>
    api.get<{ runs: RunSummary[] }>(`${BASE}/runs/${cronJobId}`).then((res) => {
      const data = (res ?? {}) as { runs?: RunSummary[] };
      return { runs: Array.isArray(data.runs) ? data.runs : [] };
    }),

  exportRun: (runId: string, options: ExportOptions) =>
    api.post<{ format: string; data: unknown }>(`${BASE}/runs/${runId}/export`, options),

  getRunDetails: (runId: string) =>
    api.get<RunDetailsPayload>(`${BASE}/runs/${runId}/details`),

  /** Step-through execution: advance to next step. Spec: POST /debug/runs/{runId}/step */
  step: (runId: string, payload?: { direction?: "next" | "prev"; stepIndex?: number }) =>
    api.post<{ stepIndex: number; state: unknown }>(
      `${BASE}/runs/${runId}/step`,
      payload ?? {}
    ),
};
