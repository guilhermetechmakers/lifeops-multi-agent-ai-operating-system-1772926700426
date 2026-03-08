/**
 * Mock Runs API for Run Details page development.
 * Returns consistent shapes; consume with (data ?? []).
 */

import type {
  RunDetail,
  TraceEvent,
  LogEvent,
  DiffChunk,
  Artifact,
  TimingSection,
  ReversibleAction,
  AuditEvent,
  RevertPayload,
  RevertResponse,
  RunSchedule,
  RunTarget,
  RunTTLMetadata,
} from "@/types/run-details";

const now = new Date();
const started = new Date(now.getTime() - 5 * 60 * 1000);
const ended = new Date(now.getTime() - 4 * 60 * 1000);
const durationMs = 60000;

const MOCK_TRACE: TraceEvent[] = [
  {
    id: "t1",
    timestamp: started.toISOString(),
    sender: "orchestrator",
    receiver: "agent-pr-triage",
    type: "handoff",
    version: "1.0",
    ttl: 3600,
    payloadExcerpt: '{"task":"triage","repo":"acme"}',
    outcome: "accepted",
    explainability: { action: "handoff", decision: "assign", rationale: "PR triage agent available" },
  },
  {
    id: "t2",
    timestamp: new Date(started.getTime() + 5000).toISOString(),
    sender: "agent-pr-triage",
    receiver: "orchestrator",
    type: "result",
    version: "1.0",
    payloadExcerpt: '{"prCount":3,"recommendations":[]}',
    outcome: "success",
    explainability: { action: "result", rationale: "Triage completed for 3 PRs" },
  },
  {
    id: "t3",
    timestamp: new Date(started.getTime() + 15000).toISOString(),
    sender: "orchestrator",
    receiver: "agent-notifier",
    type: "alert",
    version: "1.0",
    ttl: 1800,
    payloadExcerpt: '{"action":"notify","channel":"slack"}',
    outcome: "sent",
    explainability: { action: "alert", decision: "notify", rationale: "Slack notification sent" },
  },
];

const MOCK_LOGS: LogEvent[] = [
  { timestamp: started.toISOString(), level: "info", source: "engine", message: "Run started" },
  { timestamp: new Date(started.getTime() + 1000).toISOString(), level: "info", source: "agent-pr-triage", message: "Processing PRs" },
  { timestamp: new Date(started.getTime() + 5000).toISOString(), level: "info", source: "agent-pr-triage", message: "Triage complete" },
  { timestamp: new Date(started.getTime() + 15000).toISOString(), level: "info", source: "agent-notifier", message: "Notification sent" },
  { timestamp: ended.toISOString(), level: "info", source: "engine", message: "Run completed successfully" },
];

const MOCK_DIFFS: DiffChunk[] = [
  {
    resourceId: "pr-status-123",
    before: '{"status":"pending"}',
    after: '{"status":"triaged","reviewedBy":"agent-pr-triage"}',
    changedFields: ["status", "reviewedBy"],
    author: "agent-pr-triage",
    reason: "PR triage completed",
    revertRiskLevel: "low",
  },
];

const MOCK_ARTIFACTS: Artifact[] = [
  {
    id: "art-1",
    name: "triage-report.json",
    type: "application/json",
    size: 1024,
    producedAt: ended.toISOString(),
    url: "/artifacts/art-1/download",
    checksum: "sha256:abc123",
    provenance: { runId: "run-1-1", agent: "agent-pr-triage", timestamp: ended.toISOString() },
  },
];

const MOCK_TIMING: TimingSection[] = [
  { name: "Agent PR Triage", durationMs: 4500, details: "Processing 3 PRs" },
  { name: "Messaging latency", durationMs: 120, details: "Orchestrator → Agent" },
  { name: "Notification", durationMs: 800, details: "Slack API call" },
];

const MOCK_REVERSIBLE: ReversibleAction[] = [
  {
    actionId: "rev-1",
    type: "restore-pr-status",
    targetResource: "pr-status-123",
    requiredValidators: ["validator-pr-lock"],
    status: "passed",
  },
];

const MOCK_AUDIT: AuditEvent[] = [
  { id: "a1", timestamp: started.toISOString(), userId: "system", action: "run_started", details: "Cronjob triggered" },
  { id: "a2", timestamp: ended.toISOString(), userId: "system", action: "run_completed", details: "Success" },
];

const MOCK_SCHEDULE: RunSchedule = {
  cron: "0 9 * * 1-5",
  timeZone: "UTC",
  nextRunAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
};

const MOCK_TARGET: RunTarget = { type: "workflow", id: "wf-pr-triage", name: "PR Triage" };

const MOCK_TTL: RunTTLMetadata = {
  memoryScope: 3600,
  messageRetention: 86400,
  artifactRetention: 604800,
};

function buildRunDetail(runId: string, cronjobId: string, cronjobName: string): RunDetail {
  return {
    id: runId,
    cronjobId,
    cronjobName,
    startedAt: started.toISOString(),
    endedAt: ended.toISOString(),
    durationMs,
    status: "succeeded",
    schedule: MOCK_SCHEDULE,
    target: MOCK_TARGET,
    inputs: { template: "{}", variables: {} },
    effectiveInputs: { repo: "acme", branch: "main" },
    constraints: { maxDurationMs: 300000, maxRetries: 3 },
    scope: ["repo:acme", "agent:pr-triage"],
    permissions: ["read", "write"],
    ttlMetadata: MOCK_TTL,
    trace: MOCK_TRACE,
    logs: MOCK_LOGS,
    diffs: MOCK_DIFFS,
    artifacts: MOCK_ARTIFACTS,
    timing: MOCK_TIMING,
    outcome: { success: true, summary: "Run completed successfully", details: "All agents completed" },
    reversibleActions: MOCK_REVERSIBLE,
    auditTrail: MOCK_AUDIT,
    relatedRuns: { antecedent: ["run-1-0"], successor: [] },
    approvalId: "approval-1",
  };
}

const RUN_CACHE = new Map<string, RunDetail>();

function getOrCreateRun(runId: string, cronjobId?: string): RunDetail {
  const cached = RUN_CACHE.get(runId);
  if (cached) return cached;

  const parts = runId.split("-");
  const cronId = cronjobId ?? (parts.length >= 2 ? parts[1] : "1");
  const names: Record<string, string> = {
    "1": "PR triage",
    "2": "Daily digest",
    "3": "Monthly close",
    "4": "Content publish",
  };
  const name = names[cronId] ?? "Cronjob";
  const run = buildRunDetail(runId, cronId, name);
  RUN_CACHE.set(runId, run);
  return run;
}

export function getRunWithStatus(runId: string, status: RunDetail["status"], cronjobId?: string): RunDetail {
  const run = getOrCreateRun(runId, cronjobId);
  return { ...run, status };
}

export async function mockGetRunDetail(runId: string, cronjobId?: string): Promise<RunDetail | null> {
  await new Promise((r) => setTimeout(r, 300));
  const run = getOrCreateRun(runId, cronjobId);
  if (runId === "run-2" || runId.endsWith("-running")) {
    const runningRun = { ...run, status: "running" as const, endedAt: undefined };
    runningRun.pendingApprovals = [
      {
        id: "approval-1",
        actionType: "human-review",
        context: { prCount: 3, threshold: 5 },
        requestedAt: run.startedAt,
      },
    ];
    return runningRun;
  }
  if (runId.endsWith("-paused")) {
    const pausedRun = { ...run, status: "paused" as const, endedAt: undefined };
    pausedRun.pendingApprovals = [
      {
        id: "approval-1",
        actionType: "human-review",
        context: { prCount: 3, threshold: 5 },
        requestedAt: run.startedAt,
      },
    ];
    return pausedRun;
  }
  return run;
}

export async function mockGetRunTrace(_runId: string): Promise<TraceEvent[]> {
  await new Promise((r) => setTimeout(r, 100));
  return [...MOCK_TRACE];
}

export async function mockGetRunLogs(_runId: string): Promise<LogEvent[]> {
  await new Promise((r) => setTimeout(r, 100));
  return [...MOCK_LOGS];
}

export async function mockGetRunDiffs(_runId: string): Promise<DiffChunk[]> {
  await new Promise((r) => setTimeout(r, 100));
  return [...MOCK_DIFFS];
}

export async function mockGetRunArtifacts(_runId: string): Promise<Artifact[]> {
  await new Promise((r) => setTimeout(r, 100));
  return [...MOCK_ARTIFACTS];
}

export async function mockRevertRun(runId: string, _payload: RevertPayload): Promise<RevertResponse> {
  await new Promise((r) => setTimeout(r, 500));
  return {
    success: true,
    message: "Revert initiated",
    auditEntryId: `audit-revert-${runId}-${Date.now()}`,
  };
}

export async function mockPauseRun(_runId: string): Promise<{ success: boolean; state: string }> {
  await new Promise((r) => setTimeout(r, 300));
  return { success: true, state: "paused" };
}

export async function mockResumeRun(_runId: string): Promise<{ success: boolean; state: string }> {
  await new Promise((r) => setTimeout(r, 300));
  return { success: true, state: "running" };
}

export async function mockHaltRun(_runId: string): Promise<{ success: boolean; state: string }> {
  await new Promise((r) => setTimeout(r, 300));
  return { success: true, state: "halted" };
}

export async function mockInjectInput(
  _runId: string,
  _payload: { stepId?: string; agentId?: string; input: Record<string, unknown>; reason?: string }
): Promise<{ success: boolean }> {
  await new Promise((r) => setTimeout(r, 400));
  return { success: true };
}
