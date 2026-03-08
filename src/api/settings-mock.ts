/**
 * Mock Settings API for LifeOps.
 * Used when VITE_API_URL is not set. All arrays guarded.
 */

import type {
  SettingsGlobal,
  NotificationPreferences,
  PrivacySettings,
  TeamRBACSettings,
  AutopilotSettings,
  DataExportSettings,
  IntegrationAdapter,
  AuditRun,
  ExportHistoryItem,
} from "@/types/settings";

const mockNotificationPrefs: NotificationPreferences = {
  email: true,
  push: false,
  in_app: true,
  digest_enabled: true,
  digest_frequency: "daily",
  quiet_hours_start: "22:00",
  quiet_hours_end: "08:00",
};

const mockPrivacy: PrivacySettings = {
  data_retention_days: 365,
  export_consent: true,
  delete_request_pending: false,
};

const mockTeamRBAC: TeamRBACSettings = {
  members: [
    {
      id: "tm-1",
      user_id: "user-1",
      email: "alex@example.com",
      name: "Alex Chen",
      role_id: "role-admin",
      role_name: "Admin",
      invited_at: "2024-01-15T00:00:00Z",
      status: "active",
    },
    {
      id: "tm-2",
      user_id: "user-2",
      email: "jordan@example.com",
      name: "Jordan Lee",
      role_id: "role-member",
      role_name: "Member",
      invited_at: "2024-02-20T00:00:00Z",
      status: "pending",
    },
  ],
  roles: [
    { id: "role-admin", name: "Admin", permissions: ["*"] },
    { id: "role-member", name: "Member", permissions: ["read", "write"] },
    { id: "role-viewer", name: "Viewer", permissions: ["read"] },
  ],
  sso_enabled: false,
};

const mockAutopilot: AutopilotSettings = {
  mode: "suggest_only",
  confidence_threshold: 0.85,
  safety_rails_enabled: true,
  max_auto_actions_per_day: 10,
};

const mockDataExport: DataExportSettings = {
  last_export_at: "2024-03-01T12:00:00Z",
  schedule_enabled: false,
  schedule_frequency: "weekly",
  timezone: "America/New_York",
};

const mockAdapters: IntegrationAdapter[] = [
  {
    id: "llm",
    name: "LLM Provider",
    type: "llm",
    status: "connected",
    credentials_ref: "creds-llm",
    capabilities: ["chat", "embeddings", "completions"],
    last_connected: "2024-03-07T12:00:00Z",
    description: "OpenAI, Anthropic, or custom LLM endpoints",
  },
  {
    id: "github",
    name: "GitHub",
    type: "github",
    status: "disconnected",
    credentials_ref: null,
    capabilities: ["repos", "issues", "workflows"],
    last_connected: null,
    description: "Connect repositories and CI/CD",
  },
  {
    id: "plaid",
    name: "Plaid",
    type: "plaid",
    status: "disconnected",
    credentials_ref: null,
    capabilities: ["accounts", "transactions"],
    last_connected: null,
    description: "Bank and financial data",
  },
  {
    id: "stripe",
    name: "Stripe",
    type: "stripe",
    status: "disconnected",
    credentials_ref: null,
    capabilities: ["payments", "subscriptions", "invoices"],
    last_connected: null,
    description: "Payments and billing",
  },
  {
    id: "quickbooks",
    name: "QuickBooks",
    type: "quickbooks",
    status: "disconnected",
    credentials_ref: null,
    capabilities: ["invoices", "expenses", "reports"],
    last_connected: null,
    description: "Accounting and bookkeeping",
  },
  {
    id: "health",
    name: "Health APIs",
    type: "health",
    status: "disconnected",
    credentials_ref: null,
    capabilities: ["fitness", "sleep", "nutrition"],
    last_connected: null,
    description: "Health and wellness data",
  },
];

const mockExportHistory: ExportHistoryItem[] = [
  {
    id: "exp-1",
    created_at: "2024-03-01T12:00:00Z",
    status: "completed",
    format: "json",
    size_bytes: 1024000,
    download_url: "#",
  },
  {
    id: "exp-2",
    created_at: "2024-02-15T10:00:00Z",
    status: "completed",
    format: "csv",
    size_bytes: 512000,
  },
];

const mockAuditLogs: AuditRun[] = [
  {
    id: "audit-1",
    actor_id: "user-1",
    action: "settings.updated",
    target: "notification_preferences",
    timestamp: "2024-03-08T10:00:00Z",
    artifacts: { changes: ["email", "digest_frequency"] },
  },
  {
    id: "audit-2",
    actor_id: "user-1",
    action: "integration.connected",
    target: "llm",
    timestamp: "2024-03-07T12:00:00Z",
  },
];

export const settingsMockApi = {
  getGlobal: async (): Promise<SettingsGlobal> => {
    await new Promise((r) => setTimeout(r, 300));
    return {
      id: "settings-1",
      notification_preferences: { ...mockNotificationPrefs },
      privacy: { ...mockPrivacy },
      team_rbac: { ...mockTeamRBAC },
      autopilot: { ...mockAutopilot },
      data_export: { ...mockDataExport },
    };
  },

  patchGlobal: async (patch: Partial<SettingsGlobal>): Promise<SettingsGlobal> => {
    await new Promise((r) => setTimeout(r, 250));
    const current = await settingsMockApi.getGlobal();
    return {
      ...current,
      ...patch,
    };
  },

  getIntegrations: async (): Promise<IntegrationAdapter[]> => {
    await new Promise((r) => setTimeout(r, 250));
    return [...mockAdapters];
  },

  connectIntegration: async (
    id: string,
    _credentials: Record<string, string>
  ): Promise<IntegrationAdapter> => {
    await new Promise((r) => setTimeout(r, 400));
    const adapter = mockAdapters.find((a) => a.id === id) ?? mockAdapters[0];
    return {
      ...adapter,
      id,
      status: "connected",
      credentials_ref: `creds-${id}`,
      last_connected: new Date().toISOString(),
    };
  },

  testIntegration: async (id: string): Promise<{ ok: boolean; message?: string }> => {
    await new Promise((r) => setTimeout(r, 500));
    const adapter = mockAdapters.find((a) => a.id === id);
    if (adapter?.status === "connected") {
      return { ok: true, message: "Connection successful" };
    }
    return { ok: false, message: "Not connected" };
  },

  getExportHistory: async (): Promise<ExportHistoryItem[]> => {
    await new Promise((r) => setTimeout(r, 200));
    return [...mockExportHistory];
  },

  scheduleExport: async (_payload: {
    frequency: "weekly" | "monthly";
    timezone: string;
  }): Promise<void> => {
    await new Promise((r) => setTimeout(r, 200));
  },

  requestExport: async (): Promise<{ id: string; status: string }> => {
    await new Promise((r) => setTimeout(r, 300));
    return { id: `exp-${Date.now()}`, status: "pending" };
  },

  getAuditRun: async (id: string): Promise<AuditRun | null> => {
    await new Promise((r) => setTimeout(r, 150));
    return mockAuditLogs.find((a) => a.id === id) ?? null;
  },

  getAuditLogs: async (limit = 20): Promise<AuditRun[]> => {
    await new Promise((r) => setTimeout(r, 200));
    return mockAuditLogs.slice(0, limit);
  },
};
