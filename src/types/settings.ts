/**
 * LifeOps Settings & Preferences types.
 * Global settings, integrations, audit, RBAC.
 */

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  in_app: boolean;
  digest_enabled?: boolean;
  digest_frequency?: "immediate" | "daily" | "weekly" | "monthly";
  quiet_hours_start?: string;
  quiet_hours_end?: string;
}

export interface PrivacySettings {
  data_retention_days: number;
  export_consent: boolean;
  delete_request_pending: boolean;
}

export interface TeamMember {
  id: string;
  user_id: string;
  email: string;
  name: string;
  role_id: string;
  role_name: string;
  invited_at: string;
  status: "active" | "pending" | "suspended";
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export interface TeamRBACSettings {
  members: TeamMember[];
  roles: Role[];
  sso_enabled: boolean;
  sso_provider?: string;
}

export interface AutopilotSettings {
  mode: "suggest_only" | "autopilot";
  confidence_threshold: number;
  safety_rails_enabled: boolean;
  max_auto_actions_per_day?: number;
}

export interface SettingsGlobal {
  id: string;
  notification_preferences: NotificationPreferences;
  privacy: PrivacySettings;
  team_rbac: TeamRBACSettings;
  autopilot: AutopilotSettings;
  data_export: DataExportSettings;
}

export interface DataExportSettings {
  last_export_at?: string | null;
  schedule_enabled?: boolean;
  schedule_frequency?: "weekly" | "monthly";
  timezone?: string;
}

export interface IntegrationAdapter {
  id: string;
  name: string;
  type: string;
  status: "connected" | "disconnected" | "error";
  credentials_ref: string | null;
  capabilities: string[];
  last_connected: string | null;
  description?: string;
}

export type AdapterType =
  | "llm"
  | "github"
  | "plaid"
  | "stripe"
  | "quickbooks"
  | "health";

export interface AuditRun {
  id: string;
  actor_id: string;
  action: string;
  target: string;
  timestamp: string;
  artifacts?: Record<string, unknown>;
}

export interface ExportHistoryItem {
  id: string;
  created_at: string;
  status: "pending" | "completed" | "failed";
  format: string;
  size_bytes?: number;
  download_url?: string;
}

export type UserRole = "admin" | "member" | "viewer" | "billing";
