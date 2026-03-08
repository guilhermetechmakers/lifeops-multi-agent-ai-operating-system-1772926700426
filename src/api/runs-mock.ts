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
    payloadExcerpt: '{"task":"triage","repo":"acme"}',
    outcome: "accepted",
  },
  {
    id: "t2",
    timestamp: new Date(started.getTime() + 5000).toISOString(),
    sender: "agent-pr-triage",
    receiver: "orchestrator",
    type: "result",
    payloadExcerpt: '{"prCount":3,"recommendations":[]}',
    outcome: "success",
  },
  {
    id: "t3",
    timestamp: new Date(started.getTime() + 15000).toISOString(),
    sender: "orchestrator",
    receiver: "agent-notifier",
    type: "alert",
    payloadExcerpt: '{"action":"notify","channel":"slack"}',
    outcome: "sent",
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

function buildRunDetail(runId: string, cronjobId: string, cronjobName: string): RunDetail {
  return {
    id: runId,
    cronjobId,
    cronjobName,
    startedAt: started.toISOString(),
    endedAt: ended.toISOString(),
    durationMs,
    status: "succeeded",
    inputs: { template: "{}", variables: {} },
    effectiveInputs: { repo: "acme", branch: "main" },
    scope: ["repo:acme", "agent:pr-triage"],
    permissions: ["read", "write"],
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

export async function mockGetRunDetail(runId: string, cronjobId?: string): Promise<RunDetail | null> {
  await new Promise((r) => setTimeout(r, 300));
  return getOrCreateRun(runId, cronjobId);
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
