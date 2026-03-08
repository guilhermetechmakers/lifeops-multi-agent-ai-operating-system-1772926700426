/**
 * Mock Approvals Queue API for development.
 * Returns full ApprovalQueueItem shape with payload, diffs, artifacts, trace, comments, audit.
 */

import type {
  ApprovalQueueItem,
  ApprovalQueueFilters,
  ApprovalQueueResponse,
  Comment,
  AuditEvent,
  RunArtifact,
  ApprovePayload,
  ApproveWithConditionsPayload,
  RejectPayload,
  RequestChangesPayload,
  RevertPayload,
  AddCommentPayload,
  EscalatePayload,
} from "@/types/approvals";

const now = new Date();
const soon = new Date(now.getTime() + 24 * 60 * 60 * 1000);

const mockComments: Comment[] = [
  {
    id: "c1",
    authorId: "u1",
    authorName: "Reviewer One",
    text: "Looks good, pending spend cap.",
    createdAt: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
  },
];

const mockAudit: AuditEvent[] = [
  {
    id: "e1",
    type: "comment",
    authorId: "u1",
    authorName: "Reviewer One",
    timestamp: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
    details: "Comment added",
  },
];

const mockArtifacts: RunArtifact[] = [
  {
    id: "ar1",
    itemId: "aq1",
    type: "log",
    inlineContent: "Journal entries prepared. Total: $12,450.",
    createdAt: now.toISOString(),
  },
];

const mockTrace = {
  steps: [
    { id: "s1", agent: "Finance Agent", action: "Reconcile", timestamp: now.toISOString() },
    { id: "s2", agent: "Validator", action: "Validate", timestamp: now.toISOString() },
  ],
};

let queueItems: ApprovalQueueItem[] = [
  {
    id: "aq1",
    cronName: "Monthly close",
    ownerId: "agent-finance",
    ownerName: "Finance Agent",
    module: "finance",
    severity: "high",
    priority: 1,
    eta: soon.toISOString(),
    slaMinutes: 120,
    scheduledTime: soon.toISOString(),
    status: "pending",
    createdAt: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
    updatedAt: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
    payload: {
      entries: [
        { account: "Revenue", debit: 0, credit: 8500 },
        { account: "Expenses", debit: 3200, credit: 0 },
        { account: "Cash", debit: 5300, credit: 0 },
      ],
      total: 12450,
    },
    rationale:
      "Reconciliation complete. 3 journal entries ready to post. Total: $12,450. No anomalies detected.",
    diffs: {
      entries: [
        { account: "Revenue", debit: 0, credit: 8500 },
        { account: "Expenses", debit: 3200, credit: 0 },
        { account: "Cash", debit: 5300, credit: 0 },
      ],
    },
    artifacts: mockArtifacts,
    trace: mockTrace as unknown as ApprovalQueueItem["trace"],
    comments: mockComments,
    audit: mockAudit,
    runId: "run-1",
    cronjobId: "c1",
    cronjob_name: "Monthly close",
    agent: "Finance Agent",
  },
  {
    id: "aq2",
    cronName: "Content publish",
    ownerId: "agent-content",
    ownerName: "Content Agent",
    module: "content",
    severity: "medium",
    priority: 2,
    eta: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
    slaMinutes: 120,
    scheduledTime: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
    status: "pending",
    createdAt: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
    payload: { draft_id: "d1", title: "Q1 Product Launch", status: "ready" },
    rationale:
      "Draft 'Q1 Product Launch' is ready. SEO score: 92. No conflicts with scheduled content.",
    diffs: { draft_id: "d1", title: "Q1 Product Launch", status: "ready" },
    artifacts: [],
    trace: { steps: [] },
    comments: [],
    audit: [],
    cronjobId: "c2",
    cronjob_name: "Content publish",
    agent: "Content Agent",
  },
];

function delay<T>(ms: number, value: T): Promise<T> {
  return new Promise((r) => setTimeout(() => r(value), ms));
}

function filterItems(
  items: ApprovalQueueItem[],
  filters: ApprovalQueueFilters
): ApprovalQueueItem[] {
  let out = [...items];
  if (filters.owner)
    out = out.filter((i) => i.ownerId === filters.owner || i.ownerName === filters.owner);
  if (filters.cronName)
    out = out.filter(
      (i) =>
        i.cronName === filters.cronName || i.cronjob_name === filters.cronName
    );
  if (filters.module) out = out.filter((i) => i.module === filters.module);
  if (filters.severity) out = out.filter((i) => i.severity === filters.severity);
  if (filters.priority) out = out.filter((i) => i.severity === filters.priority);
  if (filters.status) out = out.filter((i) => i.status === filters.status);
  if (filters.assignedApprover)
    out = out.filter((i) => i.assignedApprover === filters.assignedApprover);
  if (filters.slaUrgency && filters.slaUrgency !== "all") {
    const now = Date.now();
    out = out.filter((i) => {
      if (!i.slaMinutes || !i.createdAt) return filters.slaUrgency === "expired";
      const expiry = new Date(i.createdAt).getTime() + i.slaMinutes * 60 * 1000;
      if (filters.slaUrgency === "expired") return expiry < now;
      if (filters.slaUrgency === "expiring") return expiry > now && expiry < now + 60 * 60 * 1000;
      return true;
    });
  }
  if (filters.search) {
    const s = filters.search.toLowerCase();
    out = out.filter(
      (i) =>
        i.cronName.toLowerCase().includes(s) ||
        (i.ownerName ?? "").toLowerCase().includes(s) ||
        (i.rationale ?? "").toLowerCase().includes(s)
    );
  }
  return out;
}

export const approvalsMockApi = {
  getQueue: async (
    filters: ApprovalQueueFilters = {}
  ): Promise<ApprovalQueueResponse> => {
    await delay(300, null);
    const filtered = filterItems(queueItems, filters);
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);
    return { data, total: filtered.length };
  },

  getItem: async (id: string): Promise<ApprovalQueueItem | null> => {
    await delay(150, null);
    const item = queueItems.find((i) => i.id === id) ?? null;
    return item ? { ...item } : null;
  },

  approve: async (
    id: string,
    payload: ApprovePayload = {}
  ): Promise<ApprovalQueueItem> => {
    await delay(250, null);
    const idx = queueItems.findIndex((i) => i.id === id);
    if (idx < 0) throw new Error("Approval not found");
    const item = queueItems[idx];
    const updated: ApprovalQueueItem = {
      ...item,
      status: "approved",
      updatedAt: new Date().toISOString(),
      audit: [
        ...(item.audit ?? []),
        {
          id: `e-${Date.now()}`,
          type: "approval",
          authorId: "current-user",
          authorName: "Current User",
          timestamp: new Date().toISOString(),
          details: payload.comment,
        },
      ],
    };
    queueItems[idx] = updated;
    return updated;
  },

  approveWithConditions: async (
    id: string,
    payload: ApproveWithConditionsPayload
  ): Promise<ApprovalQueueItem> => {
    await delay(250, null);
    const idx = queueItems.findIndex((i) => i.id === id);
    if (idx < 0) throw new Error("Approval not found");
    const item = queueItems[idx];
    const updated: ApprovalQueueItem = {
      ...item,
      status: "conditional",
      conditions: payload.conditions,
      updatedAt: new Date().toISOString(),
      audit: [
        ...(item.audit ?? []),
        {
          id: `e-${Date.now()}`,
          type: "approval",
          authorId: "current-user",
          authorName: "Current User",
          timestamp: new Date().toISOString(),
          details: payload.comment ?? "Approved with conditions",
        },
      ],
    };
    queueItems[idx] = updated;
    return updated;
  },

  reject: async (
    id: string,
    payload: RejectPayload = {}
  ): Promise<ApprovalQueueItem> => {
    await delay(250, null);
    const idx = queueItems.findIndex((i) => i.id === id);
    if (idx < 0) throw new Error("Approval not found");
    const item = queueItems[idx];
    const updated: ApprovalQueueItem = {
      ...item,
      status: "rejected",
      updatedAt: new Date().toISOString(),
      audit: [
        ...(item.audit ?? []),
        {
          id: `e-${Date.now()}`,
          type: "rejection",
          authorId: "current-user",
          authorName: "Current User",
          timestamp: new Date().toISOString(),
          details: payload.comment,
        },
      ],
    };
    queueItems[idx] = updated;
    return updated;
  },

  requestChanges: async (
    id: string,
    payload: RequestChangesPayload = {}
  ): Promise<ApprovalQueueItem> => {
    await delay(250, null);
    const idx = queueItems.findIndex((i) => i.id === id);
    if (idx < 0) throw new Error("Approval not found");
    const item = queueItems[idx];
    const updated: ApprovalQueueItem = {
      ...item,
      status: "pending",
      updatedAt: new Date().toISOString(),
      audit: [
        ...(item.audit ?? []),
        {
          id: `e-${Date.now()}`,
          type: "request_change",
          authorId: "current-user",
          authorName: "Current User",
          timestamp: new Date().toISOString(),
          details: payload.comment ?? payload.requiredChanges?.join("; "),
        },
      ],
    };
    queueItems[idx] = updated;
    return updated;
  },

  revert: async (
    id: string,
    payload: RevertPayload = {}
  ): Promise<ApprovalQueueItem> => {
    await delay(250, null);
    const idx = queueItems.findIndex((i) => i.id === id);
    if (idx < 0) throw new Error("Approval not found");
    const item = queueItems[idx];
    const updated: ApprovalQueueItem = {
      ...item,
      status: "pending",
      updatedAt: new Date().toISOString(),
      audit: [
        ...(item.audit ?? []),
        {
          id: `e-${Date.now()}`,
          type: "revert",
          authorId: "current-user",
          authorName: "Current User",
          timestamp: new Date().toISOString(),
          details: payload.reason,
        },
      ],
    };
    queueItems[idx] = updated;
    return updated;
  },

  addComment: async (id: string, payload: AddCommentPayload): Promise<Comment> => {
    await delay(200, null);
    const idx = queueItems.findIndex((i) => i.id === id);
    if (idx < 0) throw new Error("Approval not found");
    const item = queueItems[idx];
    const comment: Comment = {
      id: `c-${Date.now()}`,
      authorId: "current-user",
      authorName: "Current User",
      text: payload.text,
      createdAt: new Date().toISOString(),
    };
    const comments = [...(item.comments ?? []), comment];
    queueItems[idx] = { ...item, comments, updatedAt: new Date().toISOString() };
    return comment;
  },

  escalate: async (
    id: string,
    payload: EscalatePayload = {}
  ): Promise<ApprovalQueueItem> => {
    await delay(250, null);
    const idx = queueItems.findIndex((i) => i.id === id);
    if (idx < 0) throw new Error("Approval not found");
    const item = queueItems[idx];
    const updated: ApprovalQueueItem = {
      ...item,
      status: "escalated",
      assignedApprover: payload.targetGroup ?? payload.targetApproverGroup ?? "escalation-group",
      updatedAt: new Date().toISOString(),
      audit: [
        ...(item.audit ?? []),
        {
          id: `e-${Date.now()}`,
          type: "request_change",
          authorId: "current-user",
          authorName: "Current User",
          timestamp: new Date().toISOString(),
          details: payload.comment ?? "Escalated to next approver",
        },
      ],
    };
    queueItems[idx] = updated;
    return updated;
  },
};
