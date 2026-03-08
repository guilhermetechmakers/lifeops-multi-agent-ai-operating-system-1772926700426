/**
 * Mock data for Agent Trace & Debugger when backend is not ready.
 */

import type {
  TraceResponse,
  MemorySnapshot,
  RunSummary,
  Assertion,
  Conflict,
} from "@/types/agent-trace";

const agents = [
  { id: "agent-1", name: "Orchestrator", type: "orchestrator", metadata: {} },
  { id: "agent-2", name: "Validator", type: "validator", metadata: {} },
  { id: "agent-3", name: "Executor", type: "executor", metadata: {} },
];

const messages = [
  { id: "msg-1", fromAgentId: "agent-1", toAgentId: "agent-2", type: "handoff" as const, timestamp: "2025-03-08T10:00:00Z", payloadSummary: "Task payload", state: {} },
  { id: "msg-2", fromAgentId: "agent-2", toAgentId: "agent-3", type: "handoff" as const, timestamp: "2025-03-08T10:00:05Z", payloadSummary: "Validated task", state: {} },
  { id: "msg-3", fromAgentId: "agent-3", toAgentId: "agent-1", type: "response" as const, timestamp: "2025-03-08T10:00:10Z", payloadSummary: "Done", state: {} },
];

const scopes = [
  { id: "scope-1", agentId: "agent-1", scope: "session", encrypted: true, createdAt: "2025-03-08T10:00:00Z", updatedAt: "2025-03-08T10:00:10Z" },
  { id: "scope-2", agentId: "agent-2", scope: "session", encrypted: false, createdAt: "2025-03-08T10:00:00Z", updatedAt: "2025-03-08T10:00:05Z" },
];

const entries = [
  { id: "e1", scopeId: "scope-1", key: "taskId", value: "task-123", timestamp: "2025-03-08T10:00:00Z", encrypted: false },
  { id: "e2", scopeId: "scope-1", key: "token", value: "***", timestamp: "2025-03-08T10:00:00Z", encrypted: true },
];

const steps = [
  { stepIndex: 0, messageId: "msg-1", timestamp: "2025-03-08T10:00:00Z", memorySnapshot: {}, activeAgentId: "agent-1" },
  { stepIndex: 1, messageId: "msg-2", timestamp: "2025-03-08T10:00:05Z", memorySnapshot: {}, activeAgentId: "agent-2" },
  { stepIndex: 2, messageId: "msg-3", timestamp: "2025-03-08T10:00:10Z", memorySnapshot: {}, activeAgentId: "agent-3" },
];

export function mockGetTrace(runId: string): Promise<TraceResponse> {
  return Promise.resolve({
    graph: { agents, messages },
    memory: { scopes, entries },
    steps,
    artifacts: [{ id: "art-1", runId, type: "log", metadata: {} }],
    runId,
  });
}

export function mockGetMemory(_runId: string): Promise<MemorySnapshot> {
  return Promise.resolve({ scopes, entries });
}

export function mockGetRuns(_cronJobId: string): Promise<{ runs: RunSummary[] }> {
  return Promise.resolve({
    runs: [
      { id: "run-1", cronJobId: "cron-1", cronJobName: "Daily Sync", status: "succeeded", startedAt: "2025-03-08T10:00:00Z", finishedAt: "2025-03-08T10:01:00Z" },
      { id: "run-2", cronJobId: "cron-1", status: "running", startedAt: "2025-03-08T11:00:00Z" },
    ],
  });
}

export function mockRevert(_runId: string): Promise<{ success: boolean; auditLog?: { id: string; timestamp: string; action: string } }> {
  return Promise.resolve({ success: true, auditLog: { id: "audit-1", timestamp: new Date().toISOString(), action: "revert" } });
}

export function mockExport(_runId: string, options: { format: "json" | "zip" }): Promise<{ format: string; data: unknown }> {
  return Promise.resolve({ format: options.format, data: { exported: true, at: new Date().toISOString() } });
}

export function mockGetRunDetails(runId: string): Promise<{
  id: string;
  cronjobId: string;
  status: string;
  startedAt: string;
  trace: unknown[];
  logs: unknown[];
  diffs: unknown[];
  artifacts: unknown[];
  timing: unknown[];
  outcome?: { success: boolean; summary?: string };
}> {
  return Promise.resolve({
    id: runId,
    cronjobId: "cron-1",
    status: "succeeded",
    startedAt: "2025-03-08T10:00:00Z",
    finishedAt: "2025-03-08T10:01:00Z",
    trace: [],
    logs: [],
    diffs: [],
    artifacts: [],
    timing: [],
    outcome: { success: true, summary: "Completed" },
  });
}

export const mockAssertions: Assertion[] = [
  { id: "a1", runId: "run-1", ruleId: "priority-1", explanation: "Higher priority rule applied", violated: false, details: {} },
  { id: "a2", runId: "run-1", ruleId: "conflict-resolved", explanation: "Conflict resolved by rule", violated: false, details: {} },
];

export const mockConflicts: Conflict[] = [
  { id: "c1", runId: "run-1", conflictPair: ["agent-1", "agent-2"], appliedRules: ["priority-1"], rationale: "First-come priority." },
];
