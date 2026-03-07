/**
 * Mock Notifications API for development when backend is unavailable.
 * All responses use safe arrays and null guards.
 */

import type {
  Notification,
  NotificationPreferences,
  ApprovalItem,
  NotificationTemplate,
} from "@/types/notification";

const MOCK_USER_ID = "user-1";

const mockNotifications: Notification[] = [
  {
    id: "n1",
    user_id: MOCK_USER_ID,
    channel: "in_app",
    payload: {
      title: "Monthly close — post journal entries",
      body: "Finance Agent suggests posting 3 journal entries. Review and approve.",
      agent: "Finance Agent",
      cronjob_name: "Monthly close",
      severity: "warning",
      action_url: "/dashboard/approvals",
    },
    status: "pending",
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: "n2",
    user_id: MOCK_USER_ID,
    channel: "in_app",
    payload: {
      title: "PR triage completed",
      body: "PR #42 was triaged successfully.",
      agent: "Projects Agent",
      severity: "success",
    },
    status: "read",
    read_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "n3",
    user_id: MOCK_USER_ID,
    channel: "in_app",
    payload: {
      title: "Content publish — publish draft to CMS",
      body: "Content Agent requests approval to publish draft.",
      agent: "Content Agent",
      cronjob_name: "Content publish",
      severity: "info",
      action_url: "/dashboard/approvals",
    },
    status: "pending",
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
];

const mockApprovals: ApprovalItem[] = [
  {
    id: "a1",
    cronjob_id: "c1",
    cronjob_name: "Monthly close",
    requestor_id: "agent-finance",
    rationale:
      "Reconciliation complete. 3 journal entries ready to post. Total: $12,450. No anomalies detected.",
    status: "pending",
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    next_run: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    urgency: "high",
    agent: "Finance Agent",
    diff_blob: {
      entries: [
        { account: "Revenue", debit: 0, credit: 8500 },
        { account: "Expenses", debit: 3200, credit: 0 },
        { account: "Cash", debit: 5300, credit: 0 },
      ],
    },
  },
  {
    id: "a2",
    cronjob_id: "c2",
    cronjob_name: "Content publish",
    requestor_id: "agent-content",
    rationale:
      "Draft 'Q1 Product Launch' is ready. SEO score: 92. No conflicts with scheduled content.",
    status: "pending",
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    next_run: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    urgency: "medium",
    agent: "Content Agent",
    diff_blob: { draft_id: "d1", title: "Q1 Product Launch", status: "ready" },
  },
];

const defaultPreferences: NotificationPreferences = {
  in_app: true,
  email: true,
  push: false,
  digest_enabled: true,
  digest_frequency: "daily",
  quiet_hours_start: "22:00",
  quiet_hours_end: "08:00",
  locale: "en",
  timezone: "UTC",
};

const mockTemplates: NotificationTemplate[] = [
  {
    id: "t1",
    name: "run_outcome",
    locale: "en",
    subject: "Run {{cronjob_name}} {{status}}",
    body: "Run {{cronjob_name}} completed with status {{status}}. {{message}}",
    variables: ["cronjob_name", "status", "message"],
    last_modified: new Date().toISOString(),
  },
  {
    id: "t2",
    name: "approval_required",
    locale: "en",
    subject: "Approval required: {{cronjob_name}}",
    body: "{{agent}} requires approval for {{cronjob_name}}. {{rationale}}",
    variables: ["agent", "cronjob_name", "rationale"],
    last_modified: new Date().toISOString(),
  },
];

function delay<T>(ms: number, value: T): Promise<T> {
  return new Promise((r) => setTimeout(() => r(value), ms));
}

export const notificationsMockApi = {
  list: async (): Promise<{ items: Notification[]; count: number }> => {
    await delay(300, null);
    const items = [...mockNotifications];
    return { items, count: items.length };
  },

  getPreferences: async (): Promise<NotificationPreferences> => {
    await delay(150, null);
    return { ...defaultPreferences };
  },

  putPreferences: async (prefs: NotificationPreferences): Promise<NotificationPreferences> => {
    await delay(200, null);
    return { ...defaultPreferences, ...prefs };
  },

  snooze: async (notificationId: string, durationMinutes: number): Promise<Notification> => {
    await delay(200, null);
    const n = mockNotifications.find((x) => x.id === notificationId);
    if (!n) throw new Error("Notification not found");
    const updated = {
      ...n,
      status: "snoozed" as const,
      snoozed_until: new Date(Date.now() + durationMinutes * 60 * 1000).toISOString(),
    };
    const idx = mockNotifications.findIndex((x) => x.id === notificationId);
    if (idx >= 0) mockNotifications[idx] = updated;
    return updated;
  },

  markRead: async (notificationId: string): Promise<Notification> => {
    await delay(150, null);
    const n = mockNotifications.find((x) => x.id === notificationId);
    if (!n) throw new Error("Notification not found");
    const updated = { ...n, status: "read" as const, read_at: new Date().toISOString() };
    const idx = mockNotifications.findIndex((x) => x.id === notificationId);
    if (idx >= 0) mockNotifications[idx] = updated;
    return updated;
  },
};

export const approvalsMockApi = {
  getQueue: async (): Promise<ApprovalItem[]> => {
    await delay(300, null);
    return [...mockApprovals];
  },

  approve: async (id: string, comments?: string): Promise<ApprovalItem> => {
    await delay(250, null);
    const item = mockApprovals.find((a) => a.id === id);
    if (!item) throw new Error("Approval not found");
    const updated = {
      ...item,
      status: "approved" as const,
      comments: comments ?? item.comments,
      updated_at: new Date().toISOString(),
    };
    const idx = mockApprovals.findIndex((a) => a.id === id);
    if (idx >= 0) mockApprovals[idx] = updated;
    return updated;
  },

  reject: async (id: string, comments?: string): Promise<ApprovalItem> => {
    await delay(250, null);
    const item = mockApprovals.find((a) => a.id === id);
    if (!item) throw new Error("Approval not found");
    const updated = {
      ...item,
      status: "rejected" as const,
      comments: comments ?? item.comments,
      updated_at: new Date().toISOString(),
    };
    const idx = mockApprovals.findIndex((a) => a.id === id);
    if (idx >= 0) mockApprovals[idx] = updated;
    return updated;
  },

  conditionalApprove: async (
    id: string,
    conditions: Record<string, unknown>,
    comments?: string
  ): Promise<ApprovalItem> => {
    void conditions;
    await delay(250, null);
    const item = mockApprovals.find((a) => a.id === id);
    if (!item) throw new Error("Approval not found");
    const updated = {
      ...item,
      status: "conditional" as const,
      comments: comments ?? item.comments,
      updated_at: new Date().toISOString(),
    };
    const idx = mockApprovals.findIndex((a) => a.id === id);
    if (idx >= 0) mockApprovals[idx] = updated;
    return updated;
  },
};

export const templatesMockApi = {
  list: async (): Promise<NotificationTemplate[]> => {
    await delay(200, null);
    return [...mockTemplates];
  },

  get: async (id: string): Promise<NotificationTemplate | null> => {
    await delay(100, null);
    return mockTemplates.find((t) => t.id === id) ?? null;
  },

  preview: async (
    templateId: string,
    data: Record<string, string>
  ): Promise<{ subject?: string; body: string }> => {
    await delay(150, null);
    const t = mockTemplates.find((x) => x.id === templateId);
    if (!t) return { body: "" };
    let body = t.body ?? "";
    let subject = t.subject ?? "";
    for (const [k, v] of Object.entries(data)) {
      body = body.replace(new RegExp(`{{${k}}}`, "g"), v ?? "");
      subject = subject.replace(new RegExp(`{{${k}}}`, "g"), v ?? "");
    }
    return { subject, body };
  },
};
