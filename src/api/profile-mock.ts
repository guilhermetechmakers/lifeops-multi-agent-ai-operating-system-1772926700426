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
  UserPreference,
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

  getPreferences: async (): Promise<UserPreference> => {
    await new Promise((r) => setTimeout(r, 150));
    return { ...mockPreferences };
  },

  updatePreferences: async (prefs: Partial<UserPreference["preferences"]>): Promise<UserPreference> => {
    await new Promise((r) => setTimeout(r, 200));
    return {
      ...mockPreferences,
      preferences: { ...mockPreferences.preferences, ...prefs },
      updatedAt: new Date().toISOString(),
    };
  },

  updatePassword: async (_payload: { currentPassword: string; newPassword: string }): Promise<void> => {
    await new Promise((r) => setTimeout(r, 300));
  },
};
