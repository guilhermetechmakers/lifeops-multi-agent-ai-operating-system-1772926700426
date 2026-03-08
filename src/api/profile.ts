/**
 * LifeOps Profile API.
 * Uses native fetch via api client. All responses guarded for null/undefined.
 */

import { api, safeArray } from "@/lib/api";
import type {
  UserProfile,
  ProfileUpdateInput,
  Integration,
  ApiKey,
  ApiKeyCreateInput,
  ApiKeyCreateResult,
  Billing,
  Session,
  TwoFactorConfig,
  TwoFactorSetupResult,
  TwoFactorVerifyInput,
  UserPreference,
  AuditLogEntry,
} from "@/types/profile";

const PROFILE_BASE = "/profile";

function extractArray<T>(response: unknown): T[] {
  if (response && typeof response === "object" && "data" in response) {
    return safeArray<T>((response as { data: unknown }).data);
  }
  return safeArray<T>(response);
}

export const profileApi = {
  getProfile: () => api.get<UserProfile>(`${PROFILE_BASE}`),

  updateProfile: (input: ProfileUpdateInput) =>
    api.patch<UserProfile>(`${PROFILE_BASE}`, input),

  uploadAvatar: (formData: FormData, onProgress?: (pct: number) => void) =>
    api.upload<{ avatarUrl: string }>(`${PROFILE_BASE}/avatar`, formData, onProgress),

  getIntegrations: () =>
    api.get<Integration[]>(`${PROFILE_BASE}/integrations`).then((r) => extractArray<Integration>(r ?? {})),

  connectIntegration: (provider: string) =>
    api.post<Integration>(`${PROFILE_BASE}/integrations/${provider}/connect`, {}),

  reconnectIntegration: (provider: string) =>
    api.post<Integration>(`${PROFILE_BASE}/integrations/${provider}/reconnect`, {}),

  disconnectIntegration: (provider: string) =>
    api.post<Integration>(`${PROFILE_BASE}/integrations/${provider}/disconnect`, {}),

  getApiKeys: () =>
    api.get<ApiKey[]>(`${PROFILE_BASE}/apikeys`).then((r) => extractArray<ApiKey>(r ?? {})),

  createApiKey: (input: ApiKeyCreateInput) =>
    api.post<ApiKeyCreateResult>(`${PROFILE_BASE}/apikeys`, input),

  revokeApiKey: (id: string) =>
    api.delete<void>(`${PROFILE_BASE}/apikeys/${id}`),

  rotateApiKey: (id: string) =>
    api.post<ApiKeyCreateResult>(`${PROFILE_BASE}/apikeys/${id}/rotate`, {}),

  getBilling: () => api.get<Billing>(`${PROFILE_BASE}/billing`),

  getSessions: () =>
    api.get<Session[]>(`${PROFILE_BASE}/sessions`).then((r) => extractArray<Session>(r ?? {})),

  revokeSession: (sessionId: string) =>
    api.delete<void>(`${PROFILE_BASE}/sessions/${sessionId}`),

  revokeAllSessions: () =>
    api.delete<void>(`${PROFILE_BASE}/sessions`),

  getTwoFactor: () => api.get<TwoFactorConfig>(`${PROFILE_BASE}/2fa`),

  updateTwoFactor: (enabled: boolean) =>
    api.post<TwoFactorConfig>(`${PROFILE_BASE}/2fa`, { enabled }),

  get2FASetup: () => api.post<TwoFactorSetupResult>(`${PROFILE_BASE}/2fa/setup`, {}),

  verify2FA: (input: TwoFactorVerifyInput) =>
    api.post<TwoFactorConfig>(`${PROFILE_BASE}/2fa/verify`, input),

  disable2FA: (payload: { password: string }) =>
    api.post<TwoFactorConfig>(`${PROFILE_BASE}/2fa/disable`, payload),

  getAudit: (limit = 20) =>
    api
      .get<AuditLogEntry[]>(`/audit?limit=${limit}`)
      .then((r) => (Array.isArray(r) ? r : [])),

  getPreferences: () => api.get<UserPreference>(`${PROFILE_BASE}/preferences`),

  updatePreferences: (prefs: Partial<UserPreference["preferences"]>) =>
    api.patch<UserPreference>(`${PROFILE_BASE}/preferences`, { preferences: prefs }),

  updatePassword: (payload: { currentPassword: string; newPassword: string }) =>
    api.post<void>(`${PROFILE_BASE}/password`, payload),
};
