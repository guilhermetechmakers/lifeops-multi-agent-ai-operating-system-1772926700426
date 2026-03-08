/**
 * Mock data for Ticket Board when API is not configured.
 */

import type { Ticket, TicketStatus } from "@/types/projects";
import type { Column, Sprint, Rule, Run, Artifact } from "@/types/ticket-board";

const columns: Column[] = [
  { id: "backlog", projectId: "proj-1", name: "Backlog", order: 0 },
  { id: "in_progress", projectId: "proj-1", name: "In Progress", order: 1 },
  { id: "in_review", projectId: "proj-1", name: "In Review", order: 2 },
  { id: "done", projectId: "proj-1", name: "Done", order: 3 },
];

const sprints: Sprint[] = [
  {
    id: "sprint-1",
    projectId: "proj-1",
    name: "Sprint 1",
    startDate: "2025-03-01",
    endDate: "2025-03-14",
    capacity: 40,
    state: "active",
  },
  {
    id: "sprint-2",
    projectId: "proj-1",
    name: "Sprint 2",
    startDate: "2025-03-15",
    endDate: "2025-03-28",
    capacity: 40,
    state: "planned",
  },
];

const tickets: Ticket[] = [
  {
    id: "t1",
    projectId: "proj-1",
    title: "Implement OAuth flow",
    status: "in_progress",
    priority: "high",
    assigneeName: "Alex",
    labels: ["auth", "security"],
    sprintId: "sprint-1",
    storyPoints: 5,
    createdAt: "2025-02-01T00:00:00Z",
    updatedAt: "2025-03-05T00:00:00Z",
    estimate: "3d",
  },
  {
    id: "t2",
    projectId: "proj-1",
    title: "Add RBAC policies",
    status: "backlog",
    priority: "medium",
    labels: ["auth"],
    sprintId: "sprint-1",
    storyPoints: 3,
    createdAt: "2025-02-10T00:00:00Z",
    updatedAt: "2025-02-10T00:00:00Z",
    estimate: "2d",
  },
  {
    id: "t3",
    projectId: "proj-1",
    title: "Kanban drag-and-drop",
    status: "in_review",
    priority: "high",
    assigneeName: "Sam",
    labels: ["ui", "ux"],
    sprintId: "sprint-1",
    storyPoints: 8,
    createdAt: "2025-02-15T00:00:00Z",
    updatedAt: "2025-03-06T00:00:00Z",
    estimate: "5d",
  },
  {
    id: "t4",
    projectId: "proj-1",
    title: "Roadmap timeline component",
    status: "done",
    priority: "medium",
    assigneeName: "Jordan",
    labels: ["ui"],
    sprintId: "sprint-1",
    storyPoints: 5,
    createdAt: "2025-02-01T00:00:00Z",
    updatedAt: "2025-03-01T00:00:00Z",
    estimate: "4d",
  },
  {
    id: "t5",
    projectId: "proj-1",
    title: "PR summarization automation",
    status: "backlog",
    priority: "high",
    labels: ["automation"],
    sprintId: "sprint-2",
    storyPoints: 5,
    createdAt: "2025-03-01T00:00:00Z",
    updatedAt: "2025-03-06T00:00:00Z",
    estimate: "3d",
  },
];

const rules: Rule[] = [
  {
    id: "rule-1",
    projectId: "proj-1",
    name: "Auto-assign high priority",
    conditions: [{ field: "priority", operator: "eq", value: "high" }],
    actions: [{ type: "assign", payload: { assigneeId: "bot-api" } }],
    enabled: true,
    createdAt: "2025-03-01T00:00:00Z",
  },
  {
    id: "rule-2",
    projectId: "proj-1",
    name: "Add label on triage",
    conditions: [{ field: "status", operator: "eq", value: "backlog" }],
    actions: [{ type: "addLabel", payload: { label: "needs-triage" } }],
    enabled: false,
    createdAt: "2025-03-05T00:00:00Z",
  },
];

const runs: Run[] = [
  {
    id: "run-1",
    ruleOrAgentId: "rule-1",
    status: "succeeded",
    logs: ["Matched 2 tickets", "Assigned 2 tickets"],
    startedAt: "2025-03-06T09:00:00Z",
    finishedAt: "2025-03-06T09:02:00Z",
  },
  {
    id: "run-2",
    ruleOrAgentId: "ar1",
    status: "succeeded",
    logs: ["PR summary generated"],
    startedAt: "2025-03-06T09:00:00Z",
    finishedAt: "2025-03-06T09:01:30Z",
  },
];

const artifacts: Artifact[] = [
  { id: "art-1", runId: "run-2", type: "pr-summary", contentRef: "/artifacts/pr-summary-1" },
];

export function mockGetTickets(projectId: string, filters?: Record<string, string>): Promise<Ticket[]> {
  let list = tickets.filter((t) => t.projectId === projectId) ?? [];
  if (filters) {
    if (filters.status) list = list.filter((t) => t.status === filters!.status);
    if (filters.priority) list = list.filter((t) => t.priority === filters!.priority);
    if (filters.sprintId) list = list.filter((t) => t.sprintId === filters!.sprintId);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description ?? "").toLowerCase().includes(q)
      );
    }
  }
  return Promise.resolve(list);
}

export function mockGetColumns(projectId: string): Promise<Column[]> {
  const list = columns.filter((c) => c.projectId === projectId) ?? [];
  return Promise.resolve(list);
}

export function mockGetSprints(projectId: string): Promise<Sprint[]> {
  const list = sprints.filter((s) => s.projectId === projectId) ?? [];
  return Promise.resolve(list);
}

export function mockGetRules(projectId: string): Promise<Rule[]> {
  const list = rules.filter((r) => r.projectId === projectId) ?? [];
  return Promise.resolve(list);
}

export function mockCreateRule(projectId: string, data: Partial<Rule>): Promise<Rule> {
  const rule: Rule = {
    id: `rule-${Date.now()}`,
    projectId,
    name: data.name ?? "New Rule",
    conditions: data.conditions ?? [],
    actions: data.actions ?? [],
    enabled: data.enabled ?? true,
    createdAt: new Date().toISOString(),
  };
  rules.push(rule);
  return Promise.resolve(rule);
}

export function mockUpdateRule(
  _projectId: string,
  ruleId: string,
  data: Partial<Rule>
): Promise<Rule> {
  const rule = rules.find((r) => r.id === ruleId);
  if (rule) {
    Object.assign(rule, data);
    return Promise.resolve(rule);
  }
  return Promise.reject(new Error("Rule not found"));
}

export function mockPatchTicket(ticketId: string, data: Partial<Ticket>): Promise<Ticket> {
  const t = tickets.find((x) => x.id === ticketId);
  if (t) {
    Object.assign(t, data);
    t.updatedAt = new Date().toISOString();
    return Promise.resolve(t);
  }
  return Promise.reject(new Error("Ticket not found"));
}

export function mockBulkUpdateTickets(
  projectId: string,
  ids: string[],
  updates: Partial<Ticket> & { labels?: string[] }
): Promise<{ ok: boolean }> {
  ids.forEach((id) => {
    const item = tickets.find((t) => t.id === id && t.projectId === projectId);
    if (item) {
      if (updates.status) item.status = updates.status as TicketStatus;
      if (updates.assigneeId) item.assigneeId = updates.assigneeId;
      if (updates.priority) item.priority = updates.priority as Ticket["priority"];
      if (updates.sprintId !== undefined) item.sprintId = updates.sprintId;
      if (updates.labels) item.labels = updates.labels;
      item.updatedAt = new Date().toISOString();
    }
  });
  return Promise.resolve({ ok: true });
}

export function mockRunAutomation(_projectId: string, ruleId?: string): Promise<Run> {
  const run: Run = {
    id: `run-${Date.now()}`,
    ruleOrAgentId: ruleId ?? "agent-triage",
    status: "running",
    startedAt: new Date().toISOString(),
  };
  runs.unshift(run);
  setTimeout(() => {
    run.status = "succeeded";
    run.finishedAt = new Date().toISOString();
    run.logs = ["Automation completed"];
  }, 1500);
  return Promise.resolve(run);
}

export function mockGetRuns(_limit?: number): Promise<Run[]> {
  return Promise.resolve(runs);
}

export function mockGetArtifact(artifactId: string): Promise<Artifact | null> {
  const a = artifacts.find((x) => x.id === artifactId) ?? null;
  return Promise.resolve(a);
}

export function mockMoveTicket(ticketId: string, status: string): Promise<{ ok: boolean }> {
  const t = tickets.find((x) => x.id === ticketId);
  if (t) {
    t.status = status as TicketStatus;
    t.updatedAt = new Date().toISOString();
    return Promise.resolve({ ok: true });
  }
  return Promise.resolve({ ok: true });
}
