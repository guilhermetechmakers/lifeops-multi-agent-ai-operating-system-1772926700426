/**
 * LifeOps Approvals Queue types.
 * All arrays and optional fields guarded for runtime safety.
 */

export type ApprovalQueueStatus =
  | "queued"
  | "pending"
  | "approved"
  | "rejected"
  | "conditional"
  | "escalated";

export type ApprovalSeverity = "low" | "medium" | "high" | "critical";

/** Semantic priority for filtering; maps to severity. */
export type ApprovalPriority = "low" | "medium" | "high" | "critical";

export type AuditEventType =
  | "approval"
  | "rejection"
  | "comment"
  | "revert"
  | "request_change";

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
  editedAt?: string;
}

export interface AuditEvent {
  id: string;
  type: AuditEventType;
  authorId: string;
  authorName: string;
  timestamp: string;
  details?: string;
}

export interface RunArtifact {
  id: string;
  itemId: string;
  type: string;
  contentUrl?: string;
  inlineContent?: string;
  createdAt: string;
}

export interface ApprovalQueueItem {
  id: string;
  cronName: string;
  ownerId: string;
  ownerName: string;
  module: string;
  severity: ApprovalSeverity;
  /** Numeric priority for sorting (higher = more urgent). */
  priority: number;
  /** Display priority: low | medium | high | critical */
  priorityLevel?: ApprovalPriority;
  /** ETA or next run time (ISO string). */
  eta: string;
  /** Next run time (ISO); alias for eta when present. */
  nextRun?: string;
  /** SLA in minutes; used for countdown/expiry indicator. */
  slaMinutes?: number;
  /** Scheduled time for next run (ISO string). */
  scheduledTime?: string;
  /** Assigned approver or escalation group. */
  assignedApprover?: string;
  status: ApprovalQueueStatus;
  createdAt: string;
  updatedAt: string;
  /** Proposed/input payload for the action. */
  payload?: Record<string, unknown>;
  /** Current payload (before proposed changes); for diff rendering. */
  inputPayload?: Record<string, unknown>;
  currentPayload?: Record<string, unknown>;
  rationale: string;
  diffs?: Record<string, unknown> | unknown[];
  artifacts?: RunArtifact[];
  trace?: Record<string, unknown> | unknown[];
  comments?: Comment[];
  audit?: AuditEvent[];
  conditions?: Record<string, unknown>;
  runId?: string;
  cronjobId?: string;
  targetAgentId?: string;
  triggerType?: "time" | "event" | "conditional";
  escalationRuleId?: string | null;
  /** Backward compatibility: cronjob_name alias */
  cronjob_name?: string;
  /** Backward compatibility: agent/requester */
  agent?: string;
}

export type SlaUrgency = "all" | "expiring" | "overdue" | "ok";

export interface ApprovalQueueFilters {
  owner?: string;
  cronName?: string;
  module?: string;
  severity?: ApprovalSeverity;
  /** Priority filter (low|medium|high|critical); maps to severity. */
  priority?: ApprovalPriority;
  status?: ApprovalQueueStatus;
  page?: number;
  pageSize?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  /** Filter by SLA urgency: expiring soon, overdue, or all. */
  slaUrgency?: SlaUrgency;
  /** Assigned approver or escalation group. */
  assignedApprover?: string;
}

export interface ApprovalQueueResponse {
  data: ApprovalQueueItem[];
  total: number;
}

export interface ApprovePayload {
  comment?: string;
  conditions?: Record<string, unknown>;
}

export interface ApproveWithConditionsPayload {
  conditions: Record<string, unknown>;
  comment?: string;
}

export interface RejectPayload {
  comment?: string;
}

export interface RequestChangesPayload {
  comment?: string;
  requiredChanges?: string[];
}

export interface RevertPayload {
  reason?: string;
}

export interface AddCommentPayload {
  text: string;
}

export interface EscalatePayload {
  comment?: string;
  targetGroup?: string;
  targetApproverGroup?: string;
}
