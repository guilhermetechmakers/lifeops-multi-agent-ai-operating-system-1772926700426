/**
 * Audit Trail & Reversibility types.
 * Event model: type, timestamp, actor, runId, cronJobId, targetId, action,
 * before/after state, diffs, artifacts, justification, approvals, revertable flag, status.
 */

export type AuditEventType =
  | "RUN_START"
  | "RUN_END"
  | "RUN_COMPLETE"
  | "ACTION_REVERT_REQUEST"
  | "REVERT_COMPLETE"
  | "REVERT_FAILED"
  | "APPROVAL_REQUEST"
  | "APPROVAL_GRANTED"
  | "APPROVAL_DENIED"
  | "POLICY_CHANGE"
  | "USER_ACTION"
  | "CRON_TRIGGER";

export type AuditEventStatus = "PENDING" | "COMPLETED" | "FAILED" | "REVERTED";

export interface AuditEvent {
  id: string;
  type: AuditEventType;
  timestamp: string;
  actorUserId?: string | null;
  actorName?: string;
  runId?: string | null;
  cronJobId?: string | null;
  targetType?: string;
  targetId?: string | null;
  action: string;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
  diffs?: Record<string, unknown> | unknown[] | null;
  artifacts?: unknown[] | null;
  rationale?: string | null;
  approvedBy?: string | null;
  revertible: boolean;
  status: AuditEventStatus;
  details?: Record<string, unknown>;
  metadata?: Record<string, unknown> | null;
}

export interface AuditEventFilters {
  runId?: string;
  cronJobId?: string;
  userId?: string;
  actionType?: string;
  type?: AuditEventType | string;
  from?: string;
  to?: string;
  revertible?: boolean;
  status?: AuditEventStatus | string;
  page?: number;
  limit?: number;
}

export interface AuditEventsResponse {
  events: AuditEvent[];
  count: number;
  page: number;
  limit: number;
}

export interface RevertPrepareRequest {
  eventId: string;
  runId?: string;
}

export interface RevertPrepareResponse {
  eventId: string;
  runId?: string;
  canRevert: boolean;
  valid?: boolean;
  reversible?: boolean;
  reason?: string;
  message?: string;
  preview?: {
    beforeState: Record<string, unknown>;
    afterState: Record<string, unknown>;
    diffs: Record<string, unknown>;
  };
  previewDiffs?: Array<{
    path: string;
    before: unknown;
    after: unknown;
  }>;
  requiredApprovals?: string[];
  allowedActions?: string[];
}

/** Request body for POST .../events/:eventId/revert (eventId is in path). */
export interface RevertExecuteRequest {
  rationale: string;
  confirmations?: string[];
}

export interface RevertExecuteResponse {
  success: boolean;
  auditEntryId?: string;
  message?: string;
}

export interface AuditExportParams {
  format: "csv" | "json";
  from?: string;
  to?: string;
  runId?: string;
  cronJobId?: string;
  userId?: string;
  actionType?: string;
  eventType?: string;
  status?: string;
}

/** API export request shape */
export interface AuditExportFilters extends AuditExportParams {}

export interface AuditExportResponse {
  downloadUrl?: string;
  taskId?: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  message?: string;
}

export interface AuditOverviewMetrics {
  totalAudits: number;
  reversibleCount: number;
  pendingApprovals: number;
  recentRunsCount: number;
  throughputLast24h: number;
}

export interface AuditRunSummary {
  id: string;
  cronjobId: string;
  cronjobName?: string;
  status: string;
  startedAt: string;
  endedAt?: string;
  durationMs?: number;
  eventCount: number;
}

export interface PendingApprovalItem {
  id: string;
  eventId: string;
  runId: string;
  actionType: string;
  requestedAt: string;
  requestedBy: string;
  context?: Record<string, unknown>;
  rationale?: string;
}
