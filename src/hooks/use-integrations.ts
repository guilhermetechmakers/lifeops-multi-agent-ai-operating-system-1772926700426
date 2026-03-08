/**
 * React Query hooks for CI & Integrations.
 * All array data uses safeArray / (data ?? []); responses validated before use.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { integrationsApi } from "@/api/integrations";
import * as mock from "@/api/integrations-mock";
import { safeArray } from "@/lib/api";
import type {
  Integration,
  RunRecord,
  LogEntry,
  AdapterConfig,
  DeploymentTarget,
  Connector,
  RepoLink,
  IntegrationAuditEntry,
} from "@/types/integrations";

const USE_MOCK =
  !import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_USE_MOCK_PROJECTS === "true";

const keys = {
  list: (projectId: string) => ["integrations", "list", projectId] as const,
  runs: (integrationId: string) => ["integrations", "runs", integrationId] as const,
  logs: (integrationId: string, runId?: string) =>
    ["integrations", "logs", integrationId, runId ?? "all"] as const,
  adapters: (integrationId: string) => ["integrations", "adapters", integrationId] as const,
  deploymentTargets: (projectId: string) =>
    ["integrations", "deploymentTargets", projectId] as const,
  health: (projectId: string, integrationId: string) =>
    ["integrations", "health", projectId, integrationId] as const,
  connectors: (integrationId: string) =>
    ["integrations", "connectors", integrationId] as const,
  repoLinks: (projectId: string) => ["integrations", "repoLinks", projectId] as const,
  audit: (projectId: string, integrationId?: string) =>
    ["integrations", "audit", projectId, integrationId ?? "all"] as const,
};

export function useIntegrationsList(projectId: string | undefined | null) {
  const query = useQuery({
    queryKey: keys.list(projectId ?? ""),
    queryFn: () =>
      USE_MOCK
        ? mock.mockGetIntegrations(projectId!)
        : integrationsApi.getList(projectId!),
    enabled: Boolean(projectId),
    staleTime: 30 * 1000,
  });
  const items = safeArray<Integration>(query.data);
  return { ...query, items };
}

export function useCreateIntegration(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Integration>) =>
      USE_MOCK
        ? mock.mockCreateIntegration(projectId, data)
        : integrationsApi.create(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.list(projectId) });
      toast.success("Integration created");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to create integration"),
  });
}

export function useUpdateIntegration(projectId: string, integrationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Integration>) =>
      USE_MOCK
        ? mock.mockUpdateIntegration(projectId, integrationId, data)
        : integrationsApi.update(projectId, integrationId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.list(projectId) });
      qc.invalidateQueries({ queryKey: keys.health(projectId, integrationId) });
      toast.success("Integration updated");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to update integration"),
  });
}

export function useTriggerRun(integrationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      USE_MOCK
        ? mock.mockTriggerRun(integrationId)
        : integrationsApi.triggerRun(integrationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.runs(integrationId) });
      qc.invalidateQueries({ queryKey: keys.logs(integrationId) });
      toast.success("Run triggered");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to trigger run"),
  });
}

export function useIntegrationRuns(integrationId: string | undefined | null, enabled = true) {
  const query = useQuery({
    queryKey: keys.runs(integrationId ?? ""),
    queryFn: () =>
      USE_MOCK
        ? mock.mockGetRuns(integrationId!)
        : integrationsApi.getRuns(integrationId!),
    enabled: Boolean(integrationId) && enabled,
    staleTime: 15 * 1000,
  });
  const { items = [], count = 0 } =
    query.data && typeof query.data === "object" && "items" in query.data
      ? (query.data as { items: RunRecord[]; count: number })
      : { items: safeArray<RunRecord>(query.data), count: 0 };
  return { ...query, items, count };
}

export function useIntegrationLogs(
  integrationId: string | undefined | null,
  params?: { runId?: string; level?: string },
  enabled = true
) {
  const query = useQuery({
    queryKey: keys.logs(integrationId ?? "", params?.runId),
    queryFn: () =>
      USE_MOCK
        ? mock.mockGetLogs(integrationId!, params)
        : integrationsApi.getLogs(integrationId!, params),
    enabled: Boolean(integrationId) && enabled,
    staleTime: 10 * 1000,
  });
  const items = safeArray<LogEntry>(query.data);
  return { ...query, items };
}

export function useAdapters(integrationId: string | undefined | null, enabled = true) {
  const query = useQuery({
    queryKey: keys.adapters(integrationId ?? ""),
    queryFn: () =>
      USE_MOCK
        ? mock.mockGetAdapters(integrationId!)
        : integrationsApi.getAdapters(integrationId!),
    enabled: Boolean(integrationId) && enabled,
    staleTime: 60 * 1000,
  });
  const items = safeArray<AdapterConfig>(query.data);
  return { ...query, items };
}

export function useSaveAdapters(integrationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (adapters: Partial<AdapterConfig>[]) =>
      USE_MOCK
        ? mock.mockSaveAdapters(integrationId, adapters)
        : integrationsApi.saveAdapters(integrationId, adapters),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.adapters(integrationId) });
      toast.success("Adapters saved");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to save adapters"),
  });
}

export function useDeploymentTargets(projectId: string | undefined | null) {
  const query = useQuery({
    queryKey: keys.deploymentTargets(projectId ?? ""),
    queryFn: () =>
      USE_MOCK
        ? mock.mockGetDeploymentTargets(projectId!)
        : integrationsApi.getDeploymentTargets(projectId!),
    enabled: Boolean(projectId),
    staleTime: 60 * 1000,
  });
  const items = safeArray<DeploymentTarget>(query.data);
  return { ...query, items };
}

export function useConnectors(integrationId: string | undefined | null, enabled = true) {
  const query = useQuery({
    queryKey: keys.connectors(integrationId ?? ""),
    queryFn: () =>
      USE_MOCK
        ? mock.mockGetConnectors(integrationId!)
        : integrationsApi.getConnectors(integrationId!),
    enabled: Boolean(integrationId) && enabled,
    staleTime: 30 * 1000,
  });
  const items = safeArray<Connector>(query.data);
  return { ...query, items };
}

export function useRepoLinks(projectId: string | undefined | null) {
  const query = useQuery({
    queryKey: keys.repoLinks(projectId ?? ""),
    queryFn: () =>
      USE_MOCK
        ? mock.mockGetRepoLinks(projectId!)
        : integrationsApi.getRepoLinks(projectId!),
    enabled: Boolean(projectId),
    staleTime: 60 * 1000,
  });
  const items = safeArray<RepoLink>(query.data);
  return { ...query, items };
}

export function useIntegrationAudit(
  projectId: string | undefined | null,
  integrationId?: string | null
) {
  const query = useQuery({
    queryKey: keys.audit(projectId ?? "", integrationId ?? undefined),
    queryFn: () =>
      USE_MOCK
        ? mock.mockGetAuditTrail(projectId!, integrationId ?? undefined)
        : integrationsApi.getAuditTrail(projectId!, integrationId ?? undefined),
    enabled: Boolean(projectId),
    staleTime: 60 * 1000,
  });
  const items = safeArray<IntegrationAuditEntry>(query.data);
  return { ...query, items };
}
