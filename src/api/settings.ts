/**
 * Settings API client.
 * Uses api from @/lib/api. All responses validated.
 */

import { api, safeArray } from "@/lib/api";
import type {
  SettingsGlobal,
  IntegrationAdapter,
  AuditRun,
  ExportHistoryItem,
} from "@/types/settings";

const BASE = "/settings";

export const settingsApi = {
  getGlobal: async (): Promise<SettingsGlobal> => {
    const r = await api.get<SettingsGlobal>(`${BASE}/global`);
    return r ?? ({} as SettingsGlobal);
  },

  patchGlobal: async (patch: Partial<SettingsGlobal>): Promise<SettingsGlobal> => {
    const r = await api.patch<SettingsGlobal>(`${BASE}/global`, patch);
    return r ?? ({} as SettingsGlobal);
  },

  getIntegrations: async (): Promise<IntegrationAdapter[]> => {
    const r = await api.get<IntegrationAdapter[] | { data?: IntegrationAdapter[] }>(
      "/integrations"
    );
    const raw = Array.isArray(r) ? r : (r as { data?: IntegrationAdapter[] })?.data;
    return safeArray<IntegrationAdapter>(raw);
  },

  connectIntegration: async (
    id: string,
    credentials: Record<string, string>
  ): Promise<IntegrationAdapter> => {
    const r = await api.post<IntegrationAdapter>(`/integrations/${id}/connect`, {
      credentials,
    });
    return r ?? ({} as IntegrationAdapter);
  },

  testIntegration: async (id: string): Promise<{ ok: boolean; message?: string }> => {
    const r = await api.post<{ ok: boolean; message?: string }>(
      `/integrations/${id}/test`,
      {}
    );
    return r ?? { ok: false };
  },

  getExportHistory: async (): Promise<ExportHistoryItem[]> => {
    const r = await api.get<ExportHistoryItem[] | { data?: ExportHistoryItem[] }>(
      "/export/history"
    );
    const raw = Array.isArray(r) ? r : (r as { data?: ExportHistoryItem[] })?.data;
    return safeArray<ExportHistoryItem>(raw);
  },

  scheduleExport: async (payload: {
    frequency: "weekly" | "monthly";
    timezone: string;
  }): Promise<void> => {
    await api.post("/export/schedule", payload);
  },

  requestExport: async (): Promise<{ id: string; status: string }> => {
    const r = await api.post<{ id: string; status: string }>("/export/request", {});
    return r ?? { id: "", status: "pending" };
  },

  getAuditRun: async (id: string): Promise<AuditRun | null> => {
    const r = await api.get<AuditRun>(`/audit/run/${id}`);
    return r ?? null;
  },

  getAuditLogs: async (limit?: number): Promise<AuditRun[]> => {
    const r = await api.get<AuditRun[] | { data?: AuditRun[] }>(
      `/audit/logs${limit ? `?limit=${limit}` : ""}`
    );
    const raw = Array.isArray(r) ? r : (r as { data?: AuditRun[] })?.data;
    return safeArray<AuditRun>(raw);
  },
};
