/**
 * Projects Dashboard data models.
 * Use (data ?? []) and Array.isArray when consuming API responses.
 */

export interface Project {
  id: string;
  name: string;
  description?: string;
  owner?: string;
  team?: string;
  createdAt: string;
  updatedAt: string;
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

export type TicketStatus = "backlog" | "in_progress" | "in_review" | "done";
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
  source?: string;
  estimate?: string;
}

export type PRStatus = "open" | "merged" | "closed";

export interface PR {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: PRStatus;
  authorId?: string;
  authorName?: string;
  reviewers?: string[];
  summary?: string;
  createdAt: string;
  updatedAt: string;
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
