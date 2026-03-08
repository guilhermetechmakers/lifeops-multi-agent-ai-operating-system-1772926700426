/**
 * Projects Dashboard data models.
 * Use (data ?? []) and Array.isArray when consuming API responses.
 */

export type ProjectStatus = "active" | "paused" | "archived";

export interface Project {
  id: string;
  name: string;
  description?: string;
  owner?: string;
  owners?: string[];
  team?: string;
  status?: ProjectStatus;
  integrations?: string[];
  createdAt: string;
  updatedAt: string;
}

export type BacklogStatus = "New" | "In Progress" | "Blocked" | "Done";
export type BacklogPriority = "Low" | "Medium" | "High";

export interface BacklogItem {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: BacklogStatus;
  priority: BacklogPriority;
  assigneeId?: string;
  assigneeName?: string;
  createdAt: string;
  updatedAt?: string;
}

export type RoadmapItemStatus = "Planned" | "In Progress" | "Completed";

export interface RoadmapItem {
  id: string;
  projectId: string;
  title: string;
  status: RoadmapItemStatus;
  ownerId?: string;
  ownerName?: string;
  dueDate?: string;
  progress: number;
  roadmapId?: string;
}

export interface Epic {
  id: string;
  roadmapId: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: string;
  dependencies?: string[];
}

export interface Roadmap {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: string;
  epics?: Epic[];
  milestones?: Milestone[];
}

export interface Milestone {
  id: string;
  title: string;
  dueDate?: string;
  status: string;
  epicIds?: string[];
}

export type TicketStatus = "backlog" | "ready" | "in_progress" | "in_review" | "done";
export type TicketPriority = "low" | "medium" | "high" | "critical";

export interface Ticket {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TicketStatus;
  priority: TicketPriority;
  assigneeId?: string;
  assigneeName?: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  snoozedUntil?: string;
  source?: string;
  estimate?: string;
  labels?: string[];
  sprintId?: string;
  storyPoints?: number;
}

/** Ticket Board column definition */
export interface BoardColumn {
  id: TicketStatus | string;
  projectId: string;
  name: string;
  order: number;
  archived?: boolean;
}

/** Sprint for sprint planning */
export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  startDate?: string;
  endDate?: string;
  capacity?: number;
  state?: string;
}

/** Agent automation rule */
export interface AutomationRule {
  id: string;
  projectId: string;
  name: string;
  conditions?: Record<string, unknown>;
  actions?: Record<string, unknown>;
  enabled?: boolean;
  createdAt?: string;
}

/** Agent/rule run execution */
export interface RuleRun {
  id: string;
  ruleOrAgentId: string;
  status: string;
  logs?: string[];
  artifacts?: string[];
  startedAt?: string;
  finishedAt?: string;
}

/** Run artifact reference */
export interface RunArtifactRef {
  id: string;
  runId: string;
  type: string;
  contentRef: string;
}

/** User for assignee display */
export interface TicketUser {
  id: string;
  name: string;
  avatarUrl?: string;
}

export type PRStatus = "open" | "merged" | "closed";

export interface PR {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: PRStatus;
  checksSummary?: string;
  authorId?: string;
  authorName?: string;
  reviewers?: string[];
  summary?: string;
  linkedTicketIds?: string[];
  createdAt: string;
  updatedAt: string;
  /** Agent-generated summary fields */
  keyChanges?: string[];
  risks?: string[];
  tests?: string[];
  impactedFiles?: string[];
}

export type ReleaseStatus = "planned" | "in_progress" | "released";

export interface Release {
  id: string;
  projectId: string;
  version: string;
  notes?: string;
  plannedDate?: string;
  releasedDate?: string;
  status: ReleaseStatus;
}

export type CIJobStatus = "pending" | "running" | "success" | "failure";

export interface CIJob {
  id: string;
  projectId: string;
  name: string;
  status: CIJobStatus;
  startedAt?: string;
  finishedAt?: string;
  duration?: number;
  runId?: string;
  logs?: string[];
  artifacts?: unknown[];
}

export type AgentSuggestionType = "next_step" | "automation_recipe" | "tactical_action";

export interface AgentSuggestion {
  id: string;
  projectId: string;
  type: AgentSuggestionType;
  content: string;
  createdAt: string;
  relatedItemId?: string;
  status: string;
}

export interface RunArtifact {
  id: string;
  runId: string;
  type: string;
  payload: unknown;
  timestamp: string;
}

export type AgentRunType = "triage" | "summarizePR" | "generateReleaseNotes" | "ciTrigger";
export type AgentRunStatus = "pending" | "running" | "succeeded" | "failed";

export interface AgentRun {
  id: string;
  projectId: string;
  agentName: string;
  type: AgentRunType;
  status: AgentRunStatus;
  startedAt: string;
  endedAt?: string;
  logsUrl?: string;
  artifactsUrl?: string;
}

export interface ProjectApproval {
  id: string;
  cronjobId: string;
  status: string;
  reviewerId?: string;
  comments?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface ProjectCronjobOverview {
  id: string;
  name: string;
  enabled: boolean;
  nextRun?: string;
  lastRun?: {
    status: string;
    startedAt: string;
    finishedAt: string;
    durationMs: number;
  };
}

export interface ProjectsDashboardData {
  project: Project;
  roadmaps: Roadmap[];
  tickets: Ticket[];
  prs: PR[];
  releases: Release[];
  ciJobs: CIJob[];
  agentSuggestions: AgentSuggestion[];
  approvals: ProjectApproval[];
  cronjobs: ProjectCronjobOverview[];
  runs?: RunArtifact[];
}
