/**
 * React Query hooks for GitHub/GitLab Adapter API.
 * All array responses use safeArray / (data ?? []).
 */

import { useQuery } from "@tanstack/react-query";
import { githubAdapterApi } from "@/api/github-adapter";
import * as mock from "@/api/github-adapter-mock";
import { safeArray } from "@/lib/api";
import type { AdapterIssue, AdapterPR, AdapterCIStatus, AdapterRepo } from "@/types/github-adapter";
import type { ListIssuesParams, ListPRsParams } from "@/api/github-adapter";

const USE_MOCK =
  !import.meta.env.VITE_API_URL || import.meta.env.VITE_USE_MOCK_ADAPTER === "true";

const keys = {
  issues: (params: ListIssuesParams) => ["adapter", "issues", params] as const,
  issue: (owner: string, repo: string, num: number) =>
    ["adapter", "issue", owner, repo, num] as const,
  prs: (params: ListPRsParams) => ["adapter", "prs", params] as const,
  pr: (owner: string, repo: string, num: number) =>
    ["adapter", "pr", owner, repo, num] as const,
  ciStatus: (owner: string, repo: string, sha: string) =>
    ["adapter", "ci", owner, repo, sha] as const,
  repos: (provider?: string) => ["adapter", "repos", provider] as const,
};

export function useAdapterIssues(params: ListIssuesParams | null, enabled = true) {
  const query = useQuery({
    queryKey: keys.issues(params ?? { owner: "", repo: "" }),
    queryFn: () =>
      USE_MOCK && params
        ? mock.mockListIssues(params)
        : params
          ? githubAdapterApi.listIssues(params)
          : Promise.resolve([]),
    enabled: Boolean(params?.owner && params?.repo) && enabled,
    staleTime: 60 * 1000,
  });
  const items = safeArray<AdapterIssue>(query.data);
  return { ...query, items };
}

export function useAdapterPRs(params: ListPRsParams | null, enabled = true) {
  const query = useQuery({
    queryKey: keys.prs(params ?? { owner: "", repo: "" }),
    queryFn: () =>
      USE_MOCK && params
        ? mock.mockListPRs(params)
        : params
          ? githubAdapterApi.listPRs(params)
          : Promise.resolve([]),
    enabled: Boolean(params?.owner && params?.repo) && enabled,
    staleTime: 60 * 1000,
  });
  const items = safeArray<AdapterPR>(query.data);
  return { ...query, items };
}

export function useAdapterCIStatus(
  owner: string | null,
  repo: string | null,
  sha: string | null,
  enabled = true
) {
  const query = useQuery({
    queryKey: keys.ciStatus(owner ?? "", repo ?? "", sha ?? ""),
    queryFn: () =>
      USE_MOCK && owner && repo && sha
        ? mock.mockGetCIStatus(owner, repo, sha)
        : owner && repo && sha
          ? githubAdapterApi.getCIStatus(owner, repo, sha)
          : Promise.resolve([] as AdapterCIStatus[]),
    enabled: Boolean(owner && repo && sha) && enabled,
    staleTime: 30 * 1000,
  });
  const items = Array.isArray(query.data) ? query.data : (query.data ? [query.data] : []);
  return { ...query, items };
}

export function useAdapterRepos(provider?: string, enabled = true) {
  const query = useQuery({
    queryKey: keys.repos(provider),
    queryFn: () =>
      USE_MOCK ? mock.mockListRepos() : githubAdapterApi.listRepos(provider as "github" | "gitlab"),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
  const items = safeArray<AdapterRepo>(query.data);
  return { ...query, items };
}
