/**
 * LifeOps Notifications API.
 * Uses native fetch via api client. All responses guarded for null/undefined.
 */

import { api, safeArray } from "@/lib/api";
import type {
  Notification,
  NotificationPreferences,
  Digest,
  ApprovalItem,
  NotificationTemplate,
  CreateNotificationEventInput,
  SnoozeInput,
} from "@/types/notification";

const NOTIFICATIONS_BASE = "/notifications";
const APPROVALS_BASE = "/approvals";
const SETTINGS_BASE = "/settings";
const TEMPLATES_BASE = "/templates";

/** Extract items from API response; always returns array. */
function extractItems<T>(response: unknown): T[] {
  if (response && typeof response === "object" && "items" in response) {
    return safeArray<T>((response as { items: unknown }).items);
  }
  return safeArray<T>(response);
}

export const notificationsApi = {
  /** Create a notification event. */
  createEvent: (input: CreateNotificationEventInput) =>
    api.post<{ id: string }>(`${NOTIFICATIONS_BASE}/events`, input),

  /** Get user notification preferences. */
  getPreferences: (userId: string) =>
    api.get<NotificationPreferences>(`${NOTIFICATIONS_BASE}/users/${userId}/preferences`),

  /** Update user notification preferences. */
  putPreferences: (userId: string, prefs: NotificationPreferences) =>
    api.put<NotificationPreferences>(`${NOTIFICATIONS_BASE}/users/${userId}/preferences`, prefs),

  /** Schedule a digest. */
  scheduleDigest: (userId: string, notificationBundle: unknown) =>
    api.post<{ digestId: string }>(`${NOTIFICATIONS_BASE}/digests/schedule`, { userId, notificationBundle }),

  /** Get digest by ID. */
  getDigest: (digestId: string) =>
    api.get<Digest>(`${NOTIFICATIONS_BASE}/digests/${digestId}`),

  /** Send digest. */
  sendDigest: (digestId: string) =>
    api.post<void>(`${NOTIFICATIONS_BASE}/digests/${digestId}/send`, {}),

  /** Snooze a notification. */
  snooze: (input: SnoozeInput) =>
    api.post<Notification>(`${NOTIFICATIONS_BASE}/snooze`, input),

  /** Resend a failed notification. */
  resend: (notificationId: string) =>
    api.post<Notification>(`${NOTIFICATIONS_BASE}/resend/${notificationId}`, {}),

  /** Get notifications for current user (list). */
  list: (params?: { channel?: string; status?: string; limit?: number; offset?: number }) => {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return api.get<{ items: Notification[]; count: number }>(
      `${NOTIFICATIONS_BASE}/list${q ? `?${q}` : ""}`
    );
  },

  /** Mark notification as read. */
  markRead: (notificationId: string) =>
    api.patch<Notification>(`${NOTIFICATIONS_BASE}/${notificationId}/read`, {}),
};

export const approvalsApi = {
  /** Get approvals queue. */
  getQueue: () =>
    api.get<ApprovalItem[]>(`${APPROVALS_BASE}/queue`).then((r) => extractItems<ApprovalItem>(r ?? {})),

  /** Approve an item. */
  approve: (id: string, comments?: string) =>
    api.post<ApprovalItem>(`${APPROVALS_BASE}/queue/${id}/approve`, { comments }),

  /** Reject an item. */
  reject: (id: string, comments?: string) =>
    api.post<ApprovalItem>(`${APPROVALS_BASE}/queue/${id}/reject`, { comments }),

  /** Conditional approve. */
  conditionalApprove: (id: string, conditions: Record<string, unknown>, comments?: string) =>
    api.post<ApprovalItem>(`${APPROVALS_BASE}/queue/${id}/conditional-approve`, {
      conditions,
      comments,
    }),
};

export const settingsApi = {
  /** Get notification settings. */
  getNotifications: () =>
    api.get<NotificationPreferences>(`${SETTINGS_BASE}/notifications`),

  /** Update notification settings. */
  putNotifications: (prefs: NotificationPreferences) =>
    api.put<NotificationPreferences>(`${SETTINGS_BASE}/notifications`, prefs),
};

export const templatesApi = {
  /** List templates. */
  list: () =>
    api.get<NotificationTemplate[]>(`${TEMPLATES_BASE}`).then((r) => extractItems<NotificationTemplate>(r ?? {})),

  /** Get template by ID. */
  get: (id: string) =>
    api.get<NotificationTemplate>(`${TEMPLATES_BASE}/${id}`),

  /** Create template. */
  create: (template: Omit<NotificationTemplate, "id" | "last_modified">) =>
    api.post<NotificationTemplate>(`${TEMPLATES_BASE}`, template),

  /** Update template. */
  update: (id: string, template: Partial<NotificationTemplate>) =>
    api.put<NotificationTemplate>(`${TEMPLATES_BASE}/${id}`, template),

  /** Preview template with sample data. */
  preview: (templateId: string, data: Record<string, string>, locale?: string) =>
    api.post<{ subject?: string; body: string }>(`${SETTINGS_BASE}/templates/preview`, {
      templateId,
      data,
      locale,
    }),
};
