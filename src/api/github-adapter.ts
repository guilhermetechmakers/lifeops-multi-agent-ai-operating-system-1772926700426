/**
 * GitHub/GitLab Adapter API client.
 * Repository operations: issues, PRs, webhooks, CI status.
 * All responses use safe arrays: (data ?? []) and Array.isArray checks.
 */

import { api } from "@/lib/api";
import { safeArray } from "@/lib/api";
import type {
  AdapterIssue,
  AdapterPR,
  AdapterCIStatus,
  AdapterRepo,
  AdapterWebhookEvent,
} from "@/types/github-adapter";

const ADAPTER_BASE = "adapter";

export type AdapterProvider = "github" | "gitlab";

export interface ListIssuesParams {
  owner: string;
  repo: string;
  state?: "open" | "closed" | "all";
  labels?: string[];
}

export interface ListPRsParams {
  owner: string;
  repo: string;
  state?: "open" | "closed" | "all";
}

export interface CreateIssuePayload {
  title: string;
  body?: string;
  labels?: string[];
  assignees?: string[];
}

export interface UpdateIssuePayload {
  title?: string;
  body?: string;
  state?: "open" | "closed";
  labels?: string[];
  assignees?: string[];
}

function safeList<T>(data: unknown): T[] {
  const raw = data ?? [];
  return Array.isArray(raw) ? (raw as T[]) : [];
}

export const githubAdapterApi = {
  /** List issues for a repository */
  listIssues: (params: ListIssuesParams) => {
    const q = new URLSearchParams();
    q.set("state", params.state ?? "open");
    if (params.labels?.length) q.set("labels", params.labels.join(","));
    const query = q.toString();
    const path = `${ADAPTER_BASE}/repos/${encodeURIComponent(params.owner)}/${encodeURIComponent(params.repo)}/issues${query ? `?${query}` : ""}`;
    return api
      .get<AdapterIssue[]>(path)
      .then((r) => safeList<AdapterIssue>(Array.isArray(r) ? r : (r as { data?: unknown })?.data ?? []));
  },

  /** Get single issue */
  getIssue: (owner: string, repo: string, issueNumber: number) =>
    api.get<AdapterIssue>(`${ADAPTER_BASE}/repos/${owner}/${repo}/issues/${issueNumber}`),

  /** Create issue */
  createIssue: (owner: string, repo: string, payload: CreateIssuePayload) =>
    api.post<AdapterIssue>(`${ADAPTER_BASE}/repos/${owner}/${repo}/issues`, payload),

  /** Update issue */
  updateIssue: (
    owner: string,
    repo: string,
    issueNumber: number,
    payload: UpdateIssuePayload
  ) =>
    api.patch<AdapterIssue>(
      `${ADAPTER_BASE}/repos/${owner}/${repo}/issues/${issueNumber}`,
      payload
    ),

  /** List PRs for a repository */
  listPRs: (params: ListPRsParams) => {
    const query = new URLSearchParams({ state: params.state ?? "open" }).toString();
    const path = `${ADAPTER_BASE}/repos/${encodeURIComponent(params.owner)}/${encodeURIComponent(params.repo)}/pulls${query ? `?${query}` : ""}`;
    return api
      .get<AdapterPR[]>(path)
      .then((r) => safeList<AdapterPR>(Array.isArray(r) ? r : (r as { data?: unknown })?.data ?? []));
  },

  /** Get single PR */
  getPR: (owner: string, repo: string, pullNumber: number) =>
    api.get<AdapterPR>(`${ADAPTER_BASE}/repos/${owner}/${repo}/pulls/${pullNumber}`),

  /** Get CI status for a commit (e.g. branch/sha) */
  getCIStatus: (owner: string, repo: string, sha: string) =>
    api
      .get<AdapterCIStatus | AdapterCIStatus[]>(
        `${ADAPTER_BASE}/repos/${owner}/${repo}/pipelines/${encodeURIComponent(sha)}/status`
      )
      .then((r) => {
        if (Array.isArray(r)) return safeArray<AdapterCIStatus>(r);
        return r ? [r as AdapterCIStatus] : [];
      }),

  /** List webhooks for a repository */
  listWebhooks: (owner: string, repo: string) =>
    api
      .get<AdapterWebhookEvent[]>(`${ADAPTER_BASE}/repos/${owner}/${repo}/webhooks`)
      .then((r) => safeList<AdapterWebhookEvent>(Array.isArray(r) ? r : (r as { data?: unknown })?.data ?? [])),

  /** List repositories (connected repos for the adapter) */
  listRepos: (provider?: AdapterProvider) => {
    const q = provider ? `?provider=${provider}` : "";
    return api
      .get<AdapterRepo[]>(`${ADAPTER_BASE}/repos${q}`)
      .then((r) => safeList<AdapterRepo>(Array.isArray(r) ? r : (r as { data?: unknown })?.data ?? []));
  },
};
