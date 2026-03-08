/**
 * Mock data for Projects Dashboard when API is not configured.
 */

import type {
  Project,
  Roadmap,
  Epic,
  Ticket,
  PR,
  Release,
  CIJob,
  AgentSuggestion,
  ProjectApproval,
  ProjectCronjobOverview,
  RunArtifact,
} from "@/types/projects";

const projects: Project[] = [
  {
    id: "proj-1",
    name: "lifeops-app",
    description: "Core LifeOps application",
    owner: "team-platform",
    team: "Platform",
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2025-03-01T12:00:00Z",
  },
  {
    id: "proj-2",
    name: "docs-site",
    description: "Documentation site",
    owner: "team-docs",
    team: "Docs",
    createdAt: "2024-02-01T00:00:00Z",
    updatedAt: "2025-02-28T10:00:00Z",
  },
];

const epics: Epic[] = [
  {
    id: "epic-1",
    roadmapId: "road-1",
    title: "Auth & RBAC",
    status: "in_progress",
    startDate: "2025-01-01",
    endDate: "2025-03-31",
    dependencies: [],
  },
  {
    id: "epic-2",
    roadmapId: "road-1",
    title: "Projects Dashboard",
    status: "planned",
    startDate: "2025-02-01",
    endDate: "2025-04-30",
    dependencies: ["epic-1"],
  },
];

const roadmaps: Roadmap[] = [
  {
    id: "road-1",
    projectId: "proj-1",
    title: "Q1 2025",
    status: "active",
    startDate: "2025-01-01",
    endDate: "2025-03-31",
    epics,
    milestones: [
      { id: "m1", title: "Auth MVP", dueDate: "2025-02-15", status: "done", epicIds: ["epic-1"] },
      { id: "m2", title: "Projects Hub", dueDate: "2025-03-15", status: "in_progress", epicIds: ["epic-2"] },
    ],
  },
];

const tickets: Ticket[] = [
  { id: "t1", projectId: "proj-1", title: "Implement OAuth flow", status: "in_progress", priority: "high", assigneeName: "Alex", createdAt: "2025-02-01T00:00:00Z", updatedAt: "2025-03-05T00:00:00Z", estimate: "3d" },
  { id: "t2", projectId: "proj-1", title: "Add RBAC policies", status: "backlog", priority: "medium", createdAt: "2025-02-10T00:00:00Z", updatedAt: "2025-02-10T00:00:00Z", estimate: "2d" },
  { id: "t3", projectId: "proj-1", title: "Kanban drag-and-drop", status: "in_review", priority: "high", assigneeName: "Sam", createdAt: "2025-02-15T00:00:00Z", updatedAt: "2025-03-06T00:00:00Z", estimate: "5d" },
  { id: "t4", projectId: "proj-1", title: "Roadmap timeline component", status: "done", priority: "medium", assigneeName: "Jordan", createdAt: "2025-02-01T00:00:00Z", updatedAt: "2025-03-01T00:00:00Z", estimate: "4d" },
];

const prs: PR[] = [
  { id: "pr1", projectId: "proj-1", title: "feat: OAuth integration", status: "open", authorName: "Alex", summary: "Adds OAuth 2.0 flow with Google and GitHub providers.", reviewers: ["Sam", "Jordan"], createdAt: "2025-03-05T00:00:00Z", updatedAt: "2025-03-06T00:00:00Z" },
  { id: "pr2", projectId: "proj-1", title: "fix: Kanban column overflow", status: "open", authorName: "Sam", summary: "Fixes horizontal scroll for long ticket titles.", reviewers: ["Alex"], createdAt: "2025-03-04T00:00:00Z", updatedAt: "2025-03-04T00:00:00Z" },
];

const releases: Release[] = [
  { id: "r1", projectId: "proj-1", version: "v0.2.0", status: "planned", plannedDate: "2025-03-15", notes: "Projects Dashboard, OAuth" },
  { id: "r2", projectId: "proj-1", version: "v0.1.0", status: "released", releasedDate: "2025-02-01", notes: "Initial release" },
];

const ciJobs: CIJob[] = [
  { id: "ci1", projectId: "proj-1", name: "build", status: "success", startedAt: "2025-03-06T10:00:00Z", finishedAt: "2025-03-06T10:05:00Z" },
  { id: "ci2", projectId: "proj-1", name: "test", status: "success", startedAt: "2025-03-06T10:05:00Z", finishedAt: "2025-03-06T10:08:00Z" },
  { id: "ci3", projectId: "proj-1", name: "deploy-staging", status: "failure", startedAt: "2025-03-06T10:08:00Z", finishedAt: "2025-03-06T10:12:00Z" },
];

const agentSuggestions: AgentSuggestion[] = [
  { id: "as1", projectId: "proj-1", type: "next_step", content: "Prioritize OAuth PR for merge — blocks RBAC work", createdAt: "2025-03-06T09:00:00Z", relatedItemId: "pr1", status: "pending" },
  { id: "as2", projectId: "proj-1", type: "automation_recipe", content: "Create cronjob: auto-summarize PRs daily at 9am", createdAt: "2025-03-05T14:00:00Z", status: "pending" },
  { id: "as3", projectId: "proj-1", type: "tactical_action", content: "Re-run deploy-staging pipeline after fixing env var", createdAt: "2025-03-06T10:15:00Z", relatedItemId: "ci3", status: "pending" },
];

const approvals: ProjectApproval[] = [
  { id: "ap1", cronjobId: "cj1", status: "pending", createdAt: "2025-03-06T08:00:00Z" },
];

const cronjobs: ProjectCronjobOverview[] = [
  { id: "cj1", name: "PR Summary Daily", enabled: true, nextRun: "2025-03-07T09:00:00Z", lastRun: { status: "success", startedAt: "2025-03-06T09:00:00Z", finishedAt: "2025-03-06T09:02:00Z", durationMs: 120000 } },
];

const runs: RunArtifact[] = [
  { id: "ra1", runId: "run-1", type: "log", payload: { message: "PR summary generated" }, timestamp: "2025-03-06T09:02:00Z" },
];

export function mockGetProjects(): Promise<Project[]> {
  return Promise.resolve(projects);
}

export function mockGetProject(id: string): Promise<Project | null> {
  const p = projects.find((x) => x.id === id) ?? null;
  return Promise.resolve(p);
}

export function mockGetRoadmaps(projectId: string): Promise<Roadmap[]> {
  const list = roadmaps.filter((r) => r.projectId === projectId) ?? [];
  return Promise.resolve(list);
}

export function mockGetTickets(projectId: string): Promise<Ticket[]> {
  const list = tickets.filter((t) => t.projectId === projectId) ?? [];
  return Promise.resolve(list);
}

export function mockGetPRs(projectId: string): Promise<PR[]> {
  const list = prs.filter((p) => p.projectId === projectId) ?? [];
  return Promise.resolve(list);
}

export function mockGetReleases(projectId: string): Promise<Release[]> {
  const list = releases.filter((r) => r.projectId === projectId) ?? [];
  return Promise.resolve(list);
}

export function mockGetCI(projectId: string): Promise<CIJob[]> {
  const list = ciJobs.filter((c) => c.projectId === projectId) ?? [];
  return Promise.resolve(list);
}

export function mockGetAgentSuggestions(projectId: string): Promise<AgentSuggestion[]> {
  const list = agentSuggestions.filter((a) => a.projectId === projectId) ?? [];
  return Promise.resolve(list);
}

export function mockGetApprovals(_projectId?: string): Promise<ProjectApproval[]> {
  return Promise.resolve(approvals);
}

export function mockGetCronjobs(_projectId?: string): Promise<ProjectCronjobOverview[]> {
  return Promise.resolve(cronjobs);
}

export function mockGetRuns(projectId: string): Promise<RunArtifact[]> {
  return Promise.resolve(projectId === "proj-1" ? runs : []);
}

export function mockMoveTicket(ticketId: string, status: string): Promise<{ ok: boolean }> {
  const t = tickets.find((x) => x.id === ticketId);
  if (t) t.status = status as Ticket["status"];
  return Promise.resolve({ ok: true });
}

export function mockAcceptSuggestion(suggestionId: string): Promise<{ ok: boolean }> {
  const s = agentSuggestions.find((x) => x.id === suggestionId);
  if (s) s.status = "accepted";
  return Promise.resolve({ ok: true });
}

export function mockDismissSuggestion(suggestionId: string): Promise<{ ok: boolean }> {
  const s = agentSuggestions.find((x) => x.id === suggestionId);
  if (s) s.status = "dismissed";
  return Promise.resolve({ ok: true });
}
