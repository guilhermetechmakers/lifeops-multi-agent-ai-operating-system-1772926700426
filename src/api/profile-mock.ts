/**
 * Mock Profile API for LifeOps.
 * Used when VITE_API_URL is not set. All arrays guarded.
 */

import type {
  UserProfile,
  Integration,
  ApiKey,
  ApiKeyCreateResult,
  Billing,
  Session,
  TwoFactorConfig,
  TwoFactorSetupResult,
  UserPreference,
  ModulePreferencesMap,
  AuditLogEntry,
} from "@/types/profile";

const MOCK_USER_ID = "user-1";

const mockProfile: UserProfile = {
  id: "profile-1",
  user_id: MOCK_USER_ID,
  firstName: "Alex",
  lastName: "Chen",
  displayName: "Alex Chen",
  email: "alex@example.com",
  avatarUrl: null,
  phone: "+1 555 123 4567",
  createdAt: "2024-01-15T00:00:00Z",
  updatedAt: "2024-03-01T00:00:00Z",
};

const mockIntegrations: Integration[] = [
  {
    id: "int-1",
    user_id: MOCK_USER_ID,
    provider: "openai",
    status: "connected",
    lastSyncedAt: "2024-03-07T12:00:00Z",
    credentialsRef: "creds-1",
    displayName: "OpenAI",
  },
  {
    id: "int-2",
    user_id: MOCK_USER_ID,
    provider: "github",
    status: "disconnected",
    lastSyncedAt: null,
    credentialsRef: null,
    displayName: "GitHub",
  },
  {
    id: "int-3",
    user_id: MOCK_USER_ID,
    provider: "stripe",
    status: "disconnected",
    lastSyncedAt: null,
    credentialsRef: null,
    displayName: "Stripe",
  },
];

const mockApiKeys: ApiKey[] = [
  {
    id: "key-1",
    user_id: MOCK_USER_ID,
    keyHash: "sk_••••••••••••••••••••••••••••••••",
    keyPreview: "sk_life_...",
    fingerprint: "a1b2c3d4",
    scopes: ["read", "write"],
    name: "Development",
    createdAt: "2024-02-01T00:00:00Z",
    lastUsedAt: "2024-03-07T10:00:00Z",
    revocable: true,
  },
];

const mockBilling: Billing = {
  id: "bill-1",
  user_id: MOCK_USER_ID,
  planId: "pro",
  planName: "Pro",
  seats: 5,
  renewalDate: "2024-04-01",
  invoices: [
    {
      id: "inv-1",
      amount: 99,
      currency: "USD",
      date: "2024-03-01",
      url: null,
      status: "paid",
    },
    {
      id: "inv-2",
      amount: 99,
      currency: "USD",
      date: "2024-02-01",
      url: null,
      status: "paid",
    },
  ],
};

const mockSessions: Session[] = [
  {
    id: "sess-1",
    user_id: MOCK_USER_ID,
    device: "Chrome on macOS",
    ip: "192.168.1.1",
    startedAt: "2024-03-07T08:00:00Z",
    lastActiveAt: "2024-03-08T14:00:00Z",
    expiresAt: "2024-03-14T08:00:00Z",
    revoked: false,
    current: true,
  },
  {
    id: "sess-2",
    user_id: MOCK_USER_ID,
    device: "Safari on iPhone",
    ip: "192.168.1.2",
    startedAt: "2024-03-06T12:00:00Z",
    lastActiveAt: "2024-03-06T14:00:00Z",
    expiresAt: "2024-03-13T12:00:00Z",
    revoked: false,
  },
];

const mockTwoFactor: TwoFactorConfig = {
  id: "2fa-1",
  user_id: MOCK_USER_ID,
  method: "totp",
  enabled: false,
};

const mockPreferences: UserPreference = {
  user_id: MOCK_USER_ID,
  preferences: {
    autopilotEnabled: true,
    defaultAgent: "assistant",
    notificationPrefs: {
      email: true,
      sms: false,
      push: true,
    },
    dataExportConsent: false,
    modulePreferences: {
      cronjobs: { enabled: true },
      content: { enabled: true },
      finance: { enabled: true },
      health: { enabled: true },
      analytics: { enabled: true },
    } as ModulePreferencesMap,
  },
  updatedAt: "2024-03-01T00:00:00Z",
};

export const profileMockApi = {
  getProfile: async (): Promise<UserProfile> => {
    await new Promise((r) => setTimeout(r, 300));
    return { ...mockProfile };
  },

  updateProfile: async (input: Partial<UserProfile>): Promise<UserProfile> => {
    await new Promise((r) => setTimeout(r, 200));
    return { ...mockProfile, ...input, updatedAt: new Date().toISOString() };
  },

  getIntegrations: async (): Promise<Integration[]> => {
    await new Promise((r) => setTimeout(r, 250));
    return [...mockIntegrations];
  },

  reconnectIntegration: async (provider: string): Promise<Integration> => {
    await new Promise((r) => setTimeout(r, 400));
    const existing = mockIntegrations.find((i) => i.provider === provider);
    return {
      ...(existing ?? {
        id: `int-${provider}`,
        user_id: MOCK_USER_ID,
        provider,
        status: "disconnected",
        lastSyncedAt: null,
        credentialsRef: null,
      }),
      status: "connected",
      lastSyncedAt: new Date().toISOString(),
      credentialsRef: `creds-${provider}`,
    };
  },

  connectIntegration: async (provider: string): Promise<Integration> => {
    await new Promise((r) => setTimeout(r, 400));
    const existing = mockIntegrations.find((i) => i.provider === provider);
    const updated: Integration = {
      ...(existing ?? {
        id: `int-${provider}`,
        user_id: MOCK_USER_ID,
        provider,
        status: "disconnected",
        lastSyncedAt: null,
        credentialsRef: null,
      }),
      status: "connected",
      lastSyncedAt: new Date().toISOString(),
      credentialsRef: `creds-${provider}`,
    };
    return updated;
  },

  disconnectIntegration: async (provider: string): Promise<Integration> => {
    await new Promise((r) => setTimeout(r, 200));
    const existing = mockIntegrations.find((i) => i.provider === provider);
    return {
      ...(existing ?? { id: "", user_id: MOCK_USER_ID, provider, status: "disconnected", lastSyncedAt: null, credentialsRef: null }),
      status: "disconnected",
      lastSyncedAt: null,
      credentialsRef: null,
    };
  },

  getApiKeys: async (): Promise<ApiKey[]> => {
    await new Promise((r) => setTimeout(r, 200));
    return [...mockApiKeys];
  },

  createApiKey: async (input: { name: string; scopes: string[] }): Promise<ApiKeyCreateResult> => {
    await new Promise((r) => setTimeout(r, 300));
    const key = `sk_life_${Math.random().toString(36).slice(2, 20)}_${Date.now()}`;
    return {
      id: `key-${Date.now()}`,
      key,
      name: input.name,
      scopes: input.scopes ?? [],
      createdAt: new Date().toISOString(),
    };
  },

  revokeApiKey: async (_id: string): Promise<void> => {
    await new Promise((r) => setTimeout(r, 200));
  },

  rotateApiKey: async (id: string): Promise<ApiKeyCreateResult> => {
    await new Promise((r) => setTimeout(r, 300));
    const existing = mockApiKeys.find((k) => k.id === id);
    const key = `sk_life_${Math.random().toString(36).slice(2, 20)}_${Date.now()}`;
    return {
      id: existing?.id ?? id,
      key,
      name: existing?.name ?? "Rotated",
      scopes: existing?.scopes ?? ["read"],
      createdAt: new Date().toISOString(),
    };
  },

  revokeAllSessions: async (): Promise<void> => {
    await new Promise((r) => setTimeout(r, 250));
  },

  uploadAvatar: async (_formData: FormData): Promise<{ avatarUrl: string }> => {
    await new Promise((r) => setTimeout(r, 400));
    return { avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=avatar" };
  },

  getBilling: async (): Promise<Billing> => {
    await new Promise((r) => setTimeout(r, 250));
    return { ...mockBilling };
  },

  getSessions: async (): Promise<Session[]> => {
    await new Promise((r) => setTimeout(r, 200));
    return [...mockSessions];
  },

  revokeSession: async (_sessionId: string): Promise<void> => {
    await new Promise((r) => setTimeout(r, 200));
  },

  getTwoFactor: async (): Promise<TwoFactorConfig> => {
    await new Promise((r) => setTimeout(r, 150));
    return { ...mockTwoFactor };
  },

  updateTwoFactor: async (enabled: boolean): Promise<TwoFactorConfig> => {
    await new Promise((r) => setTimeout(r, 300));
    return { ...mockTwoFactor, enabled };
  },

  get2FASetup: async (): Promise<TwoFactorSetupResult> => {
    await new Promise((r) => setTimeout(r, 400));
    const secret = "JBSWY3DPEHPK3PXP";
    const backupCodes = Array.from({ length: 10 }, (_, i) =>
      `${String(i + 1).padStart(2, "0")}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`
    );
    return {
      secret,
      qrCodeDataUrl: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`,
      backupCodes,
    };
  },

  verify2FA: async (_input: { token: string }): Promise<TwoFactorConfig> => {
    await new Promise((r) => setTimeout(r, 300));
    return { ...mockTwoFactor, enabled: true };
  },

  disable2FA: async (_payload: { password: string }): Promise<TwoFactorConfig> => {
    await new Promise((r) => setTimeout(r, 300));
    return { ...mockTwoFactor, enabled: false };
  },

  getAudit: async (limit = 20): Promise<AuditLogEntry[]> => {
    await new Promise((r) => setTimeout(r, 200));
    const entries: AuditLogEntry[] = [
      { id: "1", userId: MOCK_USER_ID, action: "profile_updated", targetType: "profile", timestamp: new Date().toISOString() },
      { id: "2", userId: MOCK_USER_ID, action: "2fa_enabled", targetType: "security", timestamp: new Date(Date.now() - 86400000).toISOString() },
      { id: "3", userId: MOCK_USER_ID, action: "session_revoked", targetType: "session", targetId: "sess-2", timestamp: new Date(Date.now() - 172800000).toISOString() },
    ];
    return (entries ?? []).slice(0, limit);
  },

  getPreferences: async (): Promise<UserPreference> => {
    await new Promise((r) => setTimeout(r, 150));
    return { ...mockPreferences };
  },

  updatePreferences: async (prefs: Partial<UserPreference["preferences"]>): Promise<UserPreference> => {
    await new Promise((r) => setTimeout(r, 200));
    const merged = { ...mockPreferences.preferences, ...prefs };
    if (prefs.modulePreferences !== undefined) {
      merged.modulePreferences = prefs.modulePreferences;
    }
    return {
      ...mockPreferences,
      preferences: merged,
      updatedAt: new Date().toISOString(),
    };
  },

  updatePassword: async (_payload: { currentPassword: string; newPassword: string }): Promise<void> => {
    await new Promise((r) => setTimeout(r, 300));
  },
};
