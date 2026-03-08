/**
 * LifeOps Approvals Queue types.
 * All arrays and optional fields guarded for runtime safety.
 */

export type ApprovalQueueStatus =
  | "queued"
  | "pending"
  | "approved"
  | "rejected"
  | "conditional";

export type ApprovalSeverity = "low" | "medium" | "high" | "critical";

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
  priority: number;
  eta: string;
  status: ApprovalQueueStatus;
  createdAt: string;
  updatedAt: string;
  payload?: Record<string, unknown>;
  rationale: string;
  diffs?: Record<string, unknown> | unknown[];
  artifacts?: RunArtifact[];
  trace?: Record<string, unknown> | unknown[];
  comments?: Comment[];
  audit?: AuditEvent[];
  conditions?: Record<string, unknown>;
  runId?: string;
  cronjobId?: string;
  /** Backward compatibility: cronjob_name alias */
  cronjob_name?: string;
  /** Backward compatibility: agent/requester */
  agent?: string;
}

export interface ApprovalQueueFilters {
  owner?: string;
  cronName?: string;
  module?: string;
  severity?: ApprovalSeverity;
  status?: ApprovalQueueStatus;
  page?: number;
  pageSize?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
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
