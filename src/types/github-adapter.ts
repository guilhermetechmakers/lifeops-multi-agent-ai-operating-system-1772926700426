/**
 * GitHub/GitLab Adapter API types.
 * Normalized response structures with safe defaults.
 */

export type AdapterProvider = "github" | "gitlab";

export interface AdapterIssue {
  id: string;
  number: number;
  title: string;
  body?: string;
  state: "open" | "closed";
  labels?: string[];
  assignees?: string[];
  author?: string;
  createdAt: string;
  updatedAt?: string;
  repoId?: string;
  repoName?: string;
}

export interface AdapterPR {
  id: string;
  number: number;
  title: string;
  body?: string;
  state: "open" | "closed" | "merged";
  headRef?: string;
  baseRef?: string;
  author?: string;
  reviewers?: string[];
  labels?: string[];
  createdAt: string;
  updatedAt?: string;
  mergedAt?: string;
  repoId?: string;
  repoName?: string;
}

export interface AdapterCIStatus {
  sha: string;
  state: "pending" | "success" | "failure" | "error";
  context?: string;
  targetUrl?: string;
  description?: string;
  createdAt?: string;
}

export interface AdapterWebhookEvent {
  type: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

export interface AdapterRepo {
  id: string;
  name: string;
  fullName: string;
  defaultBranch?: string;
  private?: boolean;
}
