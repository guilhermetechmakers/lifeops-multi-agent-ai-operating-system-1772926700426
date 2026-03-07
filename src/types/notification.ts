/**
 * LifeOps Notifications & Alerts types.
 * All arrays and optional fields guarded for runtime safety.
 */

export type NotificationChannel = "in_app" | "email" | "push";
export type NotificationStatus = "pending" | "delivered" | "failed" | "snoozed" | "read";
export type DigestFrequency = "immediate" | "daily" | "weekly" | "monthly";
export type ApprovalStatus = "pending" | "approved" | "rejected" | "conditional";
export type NotificationSeverity = "info" | "warning" | "error" | "success";

export interface NotificationPreferences {
  in_app: boolean;
  email: boolean;
  push: boolean;
  digest_enabled: boolean;
  digest_frequency: DigestFrequency;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  locale?: string;
  timezone?: string;
}

export interface NotificationPayload {
  title: string;
  body?: string;
  summary?: string;
  agent?: string;
  cronjob_name?: string;
  run_id?: string;
  severity?: NotificationSeverity;
  action_url?: string;
  variables?: Record<string, string>;
}

export interface Notification {
  id: string;
  user_id: string;
  channel: NotificationChannel;
  template_id?: string;
  payload: NotificationPayload;
  status: NotificationStatus;
  digest_id?: string;
  created_at: string;
  persisted_at?: string;
  read_at?: string;
  snoozed_until?: string;
  retry_count?: number;
  last_error?: string;
}

export interface Digest {
  id: string;
  user_id: string;
  window_start: string;
  window_end: string;
  delivered_at?: string;
  status: "pending" | "sent" | "failed";
  notifications?: Notification[];
}

export interface ApprovalItem {
  id: string;
  cronjob_id: string;
  cronjob_name?: string;
  requestor_id: string;
  rationale: string;
  status: ApprovalStatus;
  comments?: string;
  created_at: string;
  updated_at: string;
  diff_blob?: Record<string, unknown>;
  next_run?: string;
  urgency?: "low" | "medium" | "high" | "critical";
  agent?: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  locale: string;
  subject?: string;
  body: string;
  variables?: string[];
  last_modified: string;
}

export interface CreateNotificationEventInput {
  eventType: string;
  data: Record<string, unknown>;
  userIds: string[];
  channels?: NotificationChannel[];
}

export interface SnoozeInput {
  notificationId: string;
  durationMinutes: number;
}
