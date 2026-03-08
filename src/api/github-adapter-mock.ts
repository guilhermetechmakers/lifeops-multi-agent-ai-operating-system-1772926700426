/**
 * Mock GitHub/GitLab Adapter API for development.
 * Normalized shapes; all arrays returned as arrays (never null).
 */

import type {
  AdapterIssue,
  AdapterPR,
  AdapterCIStatus,
  AdapterRepo,
  AdapterWebhookEvent,
} from "@/types/github-adapter";
import type { ListIssuesParams, ListPRsParams, CreateIssuePayload } from "./github-adapter";

const mockIssues: AdapterIssue[] = [
  {
    id: "issue-1",
    number: 101,
    title: "OAuth integration for GitHub",
    body: "Add OAuth 2.0 flow with Google and GitHub providers.",
    state: "open",
    labels: ["enhancement", "auth"],
    assignees: ["user-1"],
    author: "Alex",
    createdAt: "2025-03-01T10:00:00Z",
    updatedAt: "2025-03-05T14:00:00Z",
    repoId: "repo-1",
    repoName: "lifeops-app",
  },
  {
    id: "issue-2",
    number: 102,
    title: "Fix CI pipeline timeout",
    body: "Increase timeout for e2e suite.",
    state: "closed",
    labels: ["bug", "ci"],
    assignees: [],
    author: "Sam",
    createdAt: "2025-03-03T09:00:00Z",
    repoId: "repo-1",
    repoName: "lifeops-app",
  },
];

const mockPRs: AdapterPR[] = [
  {
    id: "pr-1",
    number: 42,
    title: "feat: Add conflict resolution engine",
    body: "Implements CRE with DSL and audit trail.",
    state: "open",
    headRef: "feature/cre",
    baseRef: "main",
    author: "Jordan",
    reviewers: ["Alex", "Sam"],
    labels: ["feature"],
    createdAt: "2025-03-05T00:00:00Z",
    updatedAt: "2025-03-06T00:00:00Z",
    repoId: "repo-1",
    repoName: "lifeops-app",
  },
  {
    id: "pr-2",
    number: 41,
    title: "fix: Guard array access in projects API",
    state: "merged",
    mergedAt: "2025-03-04T12:00:00Z",
    author: "Alex",
    createdAt: "2025-03-02T00:00:00Z",
    updatedAt: "2025-03-04T12:00:00Z",
    repoId: "repo-1",
    repoName: "lifeops-app",
  },
];

const mockRepos: AdapterRepo[] = [
  { id: "repo-1", name: "lifeops-app", fullName: "org/lifeops-app", defaultBranch: "main", private: false },
  { id: "repo-2", name: "docs-site", fullName: "org/docs-site", defaultBranch: "main", private: false },
];

export async function mockListIssues(params: ListIssuesParams): Promise<AdapterIssue[]> {
  const list = (mockIssues ?? []).filter((i) => {
    if (params.state && params.state !== "all" && i.state !== params.state) return false;
    if (params.labels?.length) {
      const hasLabel = params.labels.some((l) => i.labels?.includes(l));
      if (!hasLabel) return false;
    }
    return true;
  });
  return [...list];
}

export async function mockGetIssue(
  _owner: string,
  _repo: string,
  issueNumber: number
): Promise<AdapterIssue | null> {
  const found = (mockIssues ?? []).find((i) => i.number === issueNumber) ?? null;
  return found;
}

export async function mockCreateIssue(
  _owner: string,
  _repo: string,
  payload: CreateIssuePayload
): Promise<AdapterIssue> {
  const newId = `issue-${Date.now()}`;
  const newNum = Math.max(...mockIssues.map((i) => i.number), 0) + 1;
  const issue: AdapterIssue = {
    id: newId,
    number: newNum,
    title: payload.title,
    body: payload.body,
    state: "open",
    labels: payload.labels ?? [],
    assignees: payload.assignees ?? [],
    author: "current-user",
    createdAt: new Date().toISOString(),
    repoId: "repo-1",
    repoName: "lifeops-app",
  };
  mockIssues.push(issue);
  return issue;
}

export async function mockListPRs(params: ListPRsParams): Promise<AdapterPR[]> {
  const list = (mockPRs ?? []).filter((p) => {
    if (params.state && params.state !== "all" && p.state !== params.state) return false;
    return true;
  });
  return [...list];
}

export async function mockGetPR(
  _owner: string,
  _repo: string,
  pullNumber: number
): Promise<AdapterPR | null> {
  const found = (mockPRs ?? []).find((p) => p.number === pullNumber) ?? null;
  return found;
}

export async function mockGetCIStatus(
  _owner: string,
  _repo: string,
  sha: string
): Promise<AdapterCIStatus[]> {
  return [
    {
      sha,
      state: sha.length % 2 === 0 ? "success" : "pending",
      context: "ci/build",
      targetUrl: "https://ci.example.com/build/123",
      description: "Build completed",
      createdAt: new Date().toISOString(),
    },
  ];
}

export async function mockListWebhooks(
  _owner: string,
  _repo: string
): Promise<AdapterWebhookEvent[]> {
  return [
    {
      type: "push",
      payload: {},
      timestamp: new Date().toISOString(),
    },
    {
      type: "pull_request",
      payload: {},
      timestamp: new Date().toISOString(),
    },
  ];
}

export async function mockListRepos(): Promise<AdapterRepo[]> {
  return [...(mockRepos ?? [])];
}
