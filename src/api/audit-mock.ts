/**
 * Mock Audit API for development.
 * Returns consistent shapes; consume with (data ?? []).
 */

import type {
  AuditEvent,
  AuditEventFilters,
  AuditEventsResponse,
  RevertPrepareRequest,
  RevertPrepareResponse,
  RevertExecuteRequest,
  RevertExecuteResponse,
  AuditExportFilters,
  AuditExportResponse,
  AuditOverviewMetrics,
  AuditRunSummary,
  PendingApprovalItem,
} from "@/types/audit";

const now = new Date();
const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

const MOCK_EVENTS: AuditEvent[] = [
  {
    id: "ev-1",
    type: "RUN_START",
    timestamp: twoDaysAgo.toISOString(),
    actorUserId: "user-1",
    actorName: "System",
    runId: "run-abc",
    cronJobId: "cron-1",
    targetType: "Run",
    targetId: "run-abc",
    action: "Run started",
    beforeState: null,
    afterState: null,
    diffs: null,
    artifacts: null,
    rationale: null,
    approvedBy: null,
    revertible: false,
    status: "COMPLETED",
    details: { trigger: "schedule" },
  },
  {
    id: "ev-2",
    type: "RUN_COMPLETE",
    timestamp: new Date(twoDaysAgo.getTime() + 60000).toISOString(),
    actorUserId: "user-1",
    actorName: "System",
    runId: "run-abc",
    cronJobId: "cron-1",
    targetType: "Run",
    targetId: "run-abc",
    action: "Run completed successfully",
    beforeState: { status: "running" },
    afterState: { status: "succeeded" },
    diffs: null,
    artifacts: null,
    rationale: null,
    approvedBy: null,
    revertible: true,
    status: "COMPLETED",
  },
  {
    id: "ev-3",
    type: "ACTION_REVERT_REQUEST",
    timestamp: oneDayAgo.toISOString(),
    actorUserId: "user-2",
    actorName: "Admin User",
    runId: "run-xyz",
    cronJobId: "cron-2",
    targetType: "Run",
    targetId: "run-xyz",
    action: "Revert requested",
    beforeState: null,
    afterState: null,
    diffs: null,
    artifacts: null,
    rationale: "Incorrect configuration applied",
    approvedBy: null,
    revertible: true,
    status: "PENDING",
  },
  {
    id: "ev-4",
    type: "REVERT_COMPLETE",
    timestamp: new Date(oneDayAgo.getTime() + 5000).toISOString(),
    actorUserId: "user-2",
    actorName: "Admin User",
    runId: "run-xyz",
    cronJobId: "cron-2",
    targetType: "Run",
    targetId: "run-xyz",
    action: "Revert completed",
    beforeState: null,
    afterState: null,
    diffs: { path: "config.value", before: "new", after: "old" } as unknown as Record<string, unknown>,
    artifacts: null,
    rationale: null,
    approvedBy: null,
    revertible: false,
    status: "COMPLETED",
  },
  {
    id: "ev-5",
    type: "APPROVAL_REQUEST",
    timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    actorUserId: "user-1",
    actorName: "System",
    runId: "run-pending",
    cronJobId: "cron-3",
    targetType: "Run",
    targetId: "run-pending",
    action: "Approval required for scheduled action",
    beforeState: null,
    afterState: null,
    diffs: null,
    artifacts: null,
    rationale: null,
    approvedBy: null,
    revertible: false,
    status: "PENDING",
  },
];

export function mockListEvents(_filters: AuditEventFilters = {}): Promise<AuditEventsResponse> {
  return Promise.resolve({
    events: MOCK_EVENTS,
    count: MOCK_EVENTS.length,
    page: 1,
    limit: 50,
  });
}

export function mockGetEvent(id: string): Promise<AuditEvent | null> {
  const ev = MOCK_EVENTS.find((e) => e.id === id);
  return Promise.resolve(ev ?? null);
}

export function mockRevertPrepare(payload: RevertPrepareRequest): Promise<RevertPrepareResponse> {
  return Promise.resolve({
    eventId: payload.eventId,
    runId: payload.runId ?? "run-abc",
    canRevert: true,
    valid: true,
    reversible: true,
    preview: {
      beforeState: { status: "succeeded", config: { applied: true } },
      afterState: { status: "running", config: { applied: false } },
      diffs: { status: "succeeded -> running", "config.applied": "true -> false" },
    },
    previewDiffs: [
      { path: "status", before: "succeeded", after: "running" },
      { path: "config.applied", before: true, after: false },
    ],
    requiredApprovals: [],
    allowedActions: ["revert"],
  });
}

export function mockRevertExecute(
  eventId: string,
  _payload: Omit<RevertExecuteRequest, "eventId">
): Promise<RevertExecuteResponse> {
  return Promise.resolve({
    success: true,
    auditEntryId: `revert-${eventId}-${Date.now()}`,
    message: "Revert completed successfully",
  });
}

export function mockExport(_filters: AuditExportFilters): Promise<AuditExportResponse> {
  return Promise.resolve({
    downloadUrl: "/api/audit/export/sample.csv",
    taskId: "export-1",
    status: "completed",
  });
}

export function mockAuditOverview(): Promise<AuditOverviewMetrics> {
  return Promise.resolve({
    totalAudits: 1247,
    reversibleCount: 89,
    pendingApprovals: 3,
    recentRunsCount: 12,
    throughputLast24h: 156,
  });
}

export function mockRecentRuns(): Promise<AuditRunSummary[]> {
  return Promise.resolve([
    { id: "run-abc", cronjobId: "cron-1", cronjobName: "Daily sync", status: "succeeded", startedAt: twoDaysAgo.toISOString(), endedAt: new Date(twoDaysAgo.getTime() + 60000).toISOString(), durationMs: 60000, eventCount: 5 },
    { id: "run-xyz", cronjobId: "cron-2", cronjobName: "Report gen", status: "reverted", startedAt: oneDayAgo.toISOString(), eventCount: 4 },
    { id: "run-pending", cronjobId: "cron-3", status: "running", startedAt: new Date(now.getTime() - 3600000).toISOString(), eventCount: 2 },
  ]);
}

export function mockPendingApprovals(): Promise<PendingApprovalItem[]> {
  return Promise.resolve([
    { id: "pa-1", eventId: "ev-5", runId: "run-pending", actionType: "APPROVAL_REQUEST", requestedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), requestedBy: "System", context: { threshold: 5 } },
  ]);
}
