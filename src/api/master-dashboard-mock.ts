/**
 * Mock Master Dashboard API for development and testing.
 * Returns consistent shapes with safe arrays; use (data ?? []) when consuming.
 */

import type {
  MasterCronjob,
  MasterTemplate,
  MasterAlert,
  MasterApproval,
  ProjectsSummary,
  FinanceSnapshot,
  HealthWorkload,
  PublishingQueueSummary,
  GlobalSearchResult,
} from "@/types/master-dashboard";

const MOCK_CRONJOBS: MasterCronjob[] = [
  {
    id: "1",
    name: "PR triage",
    enabled: true,
    schedule: "0 */15 * * *",
    timezone: "UTC",
    triggerType: "time",
    targetId: "tpl-dev-triage",
    inputPayload: {},
    permissions: { automationLevel: "approval-required" },
    nextRun: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    lastRunResult: "success",
  },
  {
    id: "2",
    name: "Daily digest",
    enabled: true,
    schedule: "0 9 * * *",
    timezone: "UTC",
    triggerType: "time",
    targetId: "tpl-content-digest",
    inputPayload: {},
    permissions: { automationLevel: "bounded-autopilot" },
    nextRun: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    lastRunResult: "success",
  },
  {
    id: "3",
    name: "Monthly close",
    enabled: true,
    schedule: "0 0 1 * *",
    timezone: "UTC",
    triggerType: "time",
    targetId: "tpl-finance-close",
    inputPayload: {},
    permissions: { automationLevel: "approval-required" },
    nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    lastRunResult: "approval",
  },
];

const MOCK_TEMPLATES: MasterTemplate[] = [
  {
    id: "tpl-dev-triage",
    domain: "developer",
    name: "Developer triage",
    description: "Triages PRs and issues, suggests reviewers.",
    inputSchema: { repo: "string", branch: "string" },
    previewSnippet: "Run on push to main",
    tags: ["pr", "triage", "automation"],
  },
  {
    id: "tpl-content-writer",
    domain: "content",
    name: "Content writer",
    description: "Draft and refine marketing copy.",
    inputSchema: { topic: "string", tone: "string" },
    previewSnippet: "Blog and social drafts",
    tags: ["content", "draft", "marketing"],
  },
  {
    id: "tpl-finance-reconciler",
    domain: "finance",
    name: "Finance reconciler",
    description: "Reconcile transactions and flag anomalies.",
    inputSchema: { ledger: "string", period: "string" },
    previewSnippet: "Daily reconciliation",
    tags: ["finance", "reconciliation"],
  },
  {
    id: "tpl-health-coach",
    domain: "health",
    name: "Health coach",
    description: "Wellness check-ins and habit tracking.",
    inputSchema: { userId: "string" },
    previewSnippet: "Weekly check-in",
    tags: ["health", "wellness"],
  },
];

const MOCK_ALERTS: MasterAlert[] = [
  {
    id: "a1",
    severity: "info",
    message: "PR triage completed successfully",
    sourceModule: "cronjobs",
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    acknowledged: false,
    digestible: true,
  },
  {
    id: "a2",
    severity: "warning",
    message: "Monthly close pending approval",
    sourceModule: "finance",
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    acknowledged: false,
    digestible: true,
  },
];

const MOCK_APPROVALS: MasterApproval[] = [
  {
    id: "ap1",
    itemType: "cronjob",
    itemId: "3",
    requester: "system",
    status: "pending",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export async function mockGetCronjobs(): Promise<MasterCronjob[]> {
  return Promise.resolve([...MOCK_CRONJOBS]);
}

export async function mockCreateCronjob(
  payload: Partial<MasterCronjob>
): Promise<MasterCronjob> {
  const newJob: MasterCronjob = {
    id: `mock-${Date.now()}`,
    name: payload.name ?? "Unnamed",
    enabled: payload.enabled ?? true,
    schedule: payload.schedule ?? "0 * * * *",
    timezone: payload.timezone ?? "UTC",
    triggerType: payload.triggerType ?? "time",
    targetId: payload.targetId ?? "",
    inputPayload: payload.inputPayload ?? {},
    permissions: payload.permissions ?? { automationLevel: "approval-required" },
    nextRun: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    lastRunResult: "pending",
  };
  MOCK_CRONJOBS.push(newJob);
  return newJob;
}

export async function mockUpdateCronjob(
  id: string,
  payload: Partial<Pick<MasterCronjob, "enabled" | "schedule" | "name">>
): Promise<MasterCronjob> {
  const idx = MOCK_CRONJOBS.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error("Cronjob not found");
  MOCK_CRONJOBS[idx] = { ...MOCK_CRONJOBS[idx], ...payload };
  return MOCK_CRONJOBS[idx];
}

export async function mockGetAlerts(): Promise<MasterAlert[]> {
  return Promise.resolve([...MOCK_ALERTS]);
}

export async function mockDigestAlert(id: string): Promise<MasterAlert> {
  const a = MOCK_ALERTS.find((x) => x.id === id);
  if (!a) throw new Error("Alert not found");
  a.acknowledged = true;
  return a;
}

export async function mockSnoozeAlert(id: string, until: string): Promise<MasterAlert> {
  const a = MOCK_ALERTS.find((x) => x.id === id);
  if (!a) throw new Error("Alert not found");
  a.snoozedUntil = until;
  return a;
}

export async function mockGetTemplates(): Promise<MasterTemplate[]> {
  return Promise.resolve([...MOCK_TEMPLATES]);
}

export async function mockGetApprovals(): Promise<MasterApproval[]> {
  return Promise.resolve([...MOCK_APPROVALS]);
}

export async function mockApprove(id: string): Promise<MasterApproval> {
  const a = MOCK_APPROVALS.find((x) => x.id === id);
  if (!a) throw new Error("Approval not found");
  a.status = "approved";
  return a;
}

export async function mockReject(id: string): Promise<MasterApproval> {
  const a = MOCK_APPROVALS.find((x) => x.id === id);
  if (!a) throw new Error("Approval not found");
  a.status = "rejected";
  return a;
}

export async function mockGetProjectsSummary(): Promise<ProjectsSummary> {
  return { total: 12, active: 8, lastUpdated: new Date().toISOString() };
}

export async function mockGetFinanceSnapshot(): Promise<FinanceSnapshot> {
  return {
    pendingCount: 3,
    reconciledCount: 45,
    lastUpdated: new Date().toISOString(),
  };
}

export async function mockGetHealthWorkload(): Promise<HealthWorkload> {
  return {
    activeTasks: 5,
    completedToday: 12,
    lastUpdated: new Date().toISOString(),
  };
}

export async function mockGetPublishingQueue(): Promise<PublishingQueueSummary> {
  return {
    queued: 4,
    inProgress: 2,
    published: 28,
    lastUpdated: new Date().toISOString(),
  };
}

function fuzzyMatch(query: string, text: string): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return true;
  return text.toLowerCase().includes(q);
}

export async function mockSearch(q: string): Promise<GlobalSearchResult[]> {
  const results: GlobalSearchResult[] = [];
  const term = q.toLowerCase().trim();
  if (!term) return results;

  (MOCK_CRONJOBS ?? []).forEach((c) => {
    if (fuzzyMatch(q, c.name))
      results.push({
        id: c.id,
        type: "cronjobs",
        module: "cronjobs",
        title: c.name,
        subtitle: c.lastRunResult,
        url: `/dashboard/cronjobs/${c.id}`,
      });
  });
  (MOCK_TEMPLATES ?? []).forEach((t) => {
    if (fuzzyMatch(q, t.name) || fuzzyMatch(q, t.domain))
      results.push({
        id: t.id,
        type: "templates",
        module: "templates",
        title: t.name,
        subtitle: t.domain,
        url: `/dashboard?template=${t.id}`,
      });
  });
  (MOCK_ALERTS ?? []).forEach((a) => {
    if (fuzzyMatch(q, a.message) || fuzzyMatch(q, a.sourceModule))
      results.push({
        id: a.id,
        type: "alerts",
        module: "alerts",
        title: a.message,
        subtitle: a.sourceModule,
        url: `/dashboard?alert=${a.id}`,
      });
  });
  (MOCK_APPROVALS ?? []).forEach((ap) => {
    if (fuzzyMatch(q, ap.itemType) || fuzzyMatch(q, ap.requester))
      results.push({
        id: ap.id,
        type: "approvals",
        module: "approvals",
        title: `${ap.itemType} #${ap.itemId}`,
        subtitle: ap.requester,
        url: "/dashboard/approvals",
      });
  });
  return results.slice(0, 20);
}
