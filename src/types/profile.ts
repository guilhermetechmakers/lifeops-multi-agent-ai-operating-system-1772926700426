/**
 * LifeOps Profile types: user profile, integrations, API keys, billing, sessions, preferences.
 */

export interface UserProfile {
  id: string;
  user_id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

export type IntegrationStatus = "connected" | "disconnected" | "error";

export interface Integration {
  id: string;
  user_id: string;
  provider: string;
  status: IntegrationStatus;
  lastSyncedAt: string | null;
  credentialsRef: string | null;
  displayName?: string;
  icon?: string;
}

export interface ApiKey {
  id: string;
  user_id: string;
  keyHash: string;
  keyPreview?: string;
  fingerprint?: string;
  scopes: string[];
  name: string;
  createdAt: string;
  lastUsedAt: string | null;
  revocable: boolean;
  /** Only present when key is first created; never stored. */
  plainKey?: string;
}

export interface ApiKeyCreateResult {
  id: string;
  key: string;
  name: string;
  scopes: string[];
  createdAt: string;
}

export interface BillingInvoice {
  id: string;
  amount: number;
  currency: string;
  date: string;
  url: string | null;
  status?: string;
}

export interface Billing {
  id: string;
  user_id: string;
  planId: string;
  planName: string;
  seats: number;
  renewalDate: string | null;
  invoices: BillingInvoice[];
}

export interface Session {
  id: string;
  user_id: string;
  device: string;
  ip: string | null;
  startedAt: string;
  lastActiveAt: string;
  expiresAt: string;
  revoked: boolean;
  current?: boolean;
}

export type TwoFactorMethod = "totp" | "fido2" | "sms";

export interface TwoFactorConfig {
  id: string;
  user_id: string;
  method: TwoFactorMethod;
  enabled: boolean;
  details?: Record<string, unknown>;
}

export interface TwoFactorSetupResult {
  qrCodeDataUrl?: string;
  secret?: string;
  backupCodes?: string[];
}

export interface TwoFactorVerifyInput {
  token: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  targetType: string;
  targetId?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationPrefs {
  email: boolean;
  sms: boolean;
  push: boolean;
}

export interface UserPreference {
  user_id: string;
  preferences: {
    autopilotEnabled: boolean;
    defaultAgent: string;
    notificationPrefs: NotificationPrefs;
    dataExportConsent: boolean;
    modulePreferences?: ModulePreferencesMap;
    [key: string]: unknown;
  };
  updatedAt: string;
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phone?: string | null;
  avatarUrl?: string | null;
}

/** Alias for API layer compatibility */
export type ProfileUpdateInput = UpdateProfileInput;

export interface CreateApiKeyInput {
  name: string;
  scopes: string[];
}

/** Alias for API layer compatibility */
export type ApiKeyCreateInput = CreateApiKeyInput;

export interface UpdatePreferencesInput {
  preferences: Partial<UserPreference["preferences"]>;
}

/** Per-module preference for feature flags and defaults */
export interface ModulePreference {
  moduleName: string;
  enabled: boolean;
  settings?: Record<string, unknown>;
}

/** Extended preferences including module-level toggles */
export interface ModulePreferencesMap {
  [moduleName: string]: { enabled: boolean; settings?: Record<string, unknown> };
}
