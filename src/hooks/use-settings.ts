/**
 * React Query hooks for Settings & Preferences.
 * Uses mock API when VITE_API_URL is not set. All arrays guarded.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { settingsApi } from "@/api/settings";
import { settingsMockApi } from "@/api/settings-mock";
import { safeArray } from "@/lib/api";
import type {
  SettingsGlobal,
  IntegrationAdapter,
  AuditRun,
  ExportHistoryItem,
} from "@/types/settings";

const USE_MOCK = !import.meta.env.VITE_API_URL;

const settingsKeys = {
  all: ["settings"] as const,
  global: () => ["settings", "global"] as const,
  integrations: () => ["settings", "integrations"] as const,
  exportHistory: () => ["settings", "exportHistory"] as const,
  auditLogs: (limit?: number) => ["settings", "auditLogs", limit] as const,
  auditRun: (id: string) => ["settings", "auditRun", id] as const,
};

export function useSettingsGlobal() {
  const query = useQuery({
    queryKey: settingsKeys.global(),
    queryFn: async () => {
      if (USE_MOCK) return settingsMockApi.getGlobal();
      return settingsApi.getGlobal();
    },
  });
  const data = query.data ?? null;
  return { ...query, data };
}

export function useUpdateSettingsGlobal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<SettingsGlobal>) => {
      if (USE_MOCK) return settingsMockApi.patchGlobal(patch);
      return settingsApi.patchGlobal(patch);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.global(), data);
      toast.success("Settings saved");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to save settings");
    },
  });
}

export function useSettingsIntegrations() {
  const query = useQuery({
    queryKey: settingsKeys.integrations(),
    queryFn: async () => {
      if (USE_MOCK) return settingsMockApi.getIntegrations();
      return settingsApi.getIntegrations();
    },
  });
  const items = safeArray<IntegrationAdapter>(query.data);
  return { ...query, items };
}

export function useConnectIntegration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      credentials,
    }: {
      id: string;
      credentials: Record<string, string>;
    }) => {
      if (USE_MOCK) return settingsMockApi.connectIntegration(id, credentials);
      return settingsApi.connectIntegration(id, credentials);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.integrations() });
      toast.success("Integration connected");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to connect");
    },
  });
}

export function useTestIntegration() {
  return useMutation({
    mutationFn: async (id: string) => {
      if (USE_MOCK) return settingsMockApi.testIntegration(id);
      return settingsApi.testIntegration(id);
    },
    onSuccess: (result) => {
      if (result?.ok) {
        toast.success("Connection successful");
      } else {
        toast.error(result?.message ?? "Connection failed");
      }
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Test failed");
    },
  });
}

export function useExportHistory() {
  const query = useQuery({
    queryKey: settingsKeys.exportHistory(),
    queryFn: async () => {
      if (USE_MOCK) return settingsMockApi.getExportHistory();
      return settingsApi.getExportHistory();
    },
  });
  const items = safeArray<ExportHistoryItem>(query.data);
  return { ...query, items };
}

export function useRequestExport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (USE_MOCK) return settingsMockApi.requestExport();
      return settingsApi.requestExport();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.exportHistory() });
      toast.success("Export requested. You will be notified when ready.");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Export request failed");
    },
  });
}

export function useScheduleExport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      frequency: "weekly" | "monthly";
      timezone: string;
    }) => {
      if (USE_MOCK) return settingsMockApi.scheduleExport(payload);
      return settingsApi.scheduleExport(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.global() });
      queryClient.invalidateQueries({ queryKey: settingsKeys.exportHistory() });
      toast.success("Export schedule updated");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to schedule");
    },
  });
}

export function useAuditLogs(limit = 20) {
  const query = useQuery({
    queryKey: settingsKeys.auditLogs(limit),
    queryFn: async () => {
      if (USE_MOCK) return settingsMockApi.getAuditLogs(limit);
      return settingsApi.getAuditLogs(limit);
    },
  });
  const items = safeArray<AuditRun>(query.data);
  return { ...query, items };
}

export function useAuditRun(id: string | null) {
  const query = useQuery({
    queryKey: settingsKeys.auditRun(id ?? ""),
    queryFn: async () => {
      if (!id) return null;
      if (USE_MOCK) return settingsMockApi.getAuditRun(id);
      return settingsApi.getAuditRun(id);
    },
    enabled: !!id,
  });
  const data = query.data ?? null;
  return { ...query, data };
}
