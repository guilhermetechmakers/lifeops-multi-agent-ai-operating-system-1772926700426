/**
 * React Query hooks for Notifications & Alerts.
 * Uses mock API when VITE_USE_MOCK_NOTIFICATIONS is set; otherwise real API.
 * All arrays guarded with safeArray / (data ?? []).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { notificationsApi, approvalsApi, templatesApi } from "@/api/notifications";
import {
  notificationsMockApi,
  approvalsMockApi,
  templatesMockApi,
} from "@/api/notifications-mock";
import { safeArray } from "@/lib/api";
import type {
  Notification,
  NotificationPreferences,
  ApprovalItem,
  NotificationTemplate,
} from "@/types/notification";

const USE_MOCK =
  import.meta.env.VITE_USE_MOCK_NOTIFICATIONS === "true" ||
  !import.meta.env.VITE_API_URL;

const notificationsKeys = {
  all: ["notifications"] as const,
  list: (filters?: Record<string, string>) => ["notifications", "list", filters] as const,
  preferences: (userId: string) => ["notifications", "preferences", userId] as const,
};

const approvalsKeys = {
  all: ["approvals"] as const,
  queue: () => ["approvals", "queue"] as const,
};

const templatesKeys = {
  all: ["templates"] as const,
  list: () => ["templates", "list"] as const,
  detail: (id: string) => ["templates", id] as const,
};

/** Notifications list */
export function useNotificationsList(filters?: { channel?: string; status?: string }) {
  const query = useQuery({
    queryKey: notificationsKeys.list(filters),
    queryFn: async () => {
      if (USE_MOCK) {
        const res = await notificationsMockApi.list();
        return { items: res?.items ?? [], count: res?.count ?? 0 };
      }
      try {
        const res = await notificationsApi.list(filters);
        const items = Array.isArray((res as { items?: unknown })?.items)
          ? ((res as { items: Notification[] }).items ?? [])
          : [];
        const count = (res as { count?: number })?.count ?? items.length;
        return { items, count };
      } catch {
        return { items: [], count: 0 };
      }
    },
  });
  const items = safeArray<Notification>(query.data?.items);
  const count = query.data?.count ?? 0;
  return { ...query, items, count };
}

/** Notification preferences */
export function useNotificationPreferences(userId: string) {
  return useQuery({
    queryKey: notificationsKeys.preferences(userId),
    queryFn: async () => {
      if (USE_MOCK) return notificationsMockApi.getPreferences();
      return notificationsApi.getPreferences(userId);
    },
    enabled: !!userId,
  });
}

/** Update preferences mutation */
export function useUpdateNotificationPreferences(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (prefs: NotificationPreferences) => {
      if (USE_MOCK) return notificationsMockApi.putPreferences(prefs);
      return notificationsApi.putPreferences(userId, prefs);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationsKeys.preferences(userId) });
      toast.success("Notification preferences saved");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to save preferences");
    },
  });
}

/** Snooze notification */
export function useSnoozeNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ notificationId, durationMinutes }: { notificationId: string; durationMinutes: number }) => {
      if (USE_MOCK) return notificationsMockApi.snooze(notificationId, durationMinutes);
      return notificationsApi.snooze({ notificationId, durationMinutes });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationsKeys.all });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to snooze");
    },
  });
}

/** Mark notification read */
export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) => {
      if (USE_MOCK) return notificationsMockApi.markRead(notificationId);
      return notificationsApi.markRead(notificationId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationsKeys.all });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to mark read");
    },
  });
}

/** Approvals queue */
export function useApprovalsQueue() {
  const query = useQuery({
    queryKey: approvalsKeys.queue(),
    queryFn: async () => {
      if (USE_MOCK) return approvalsMockApi.getQueue();
      return approvalsApi.getQueue();
    },
  });
  const items = safeArray<ApprovalItem>(query.data);
  return { ...query, items };
}

/** Approve mutation */
export function useApproveItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, comments }: { id: string; comments?: string }) => {
      if (USE_MOCK) return approvalsMockApi.approve(id, comments);
      return approvalsApi.approve(id, comments);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: approvalsKeys.all });
      toast.success("Approved");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to approve");
    },
  });
}

/** Reject mutation */
export function useRejectItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, comments }: { id: string; comments?: string }) => {
      if (USE_MOCK) return approvalsMockApi.reject(id, comments);
      return approvalsApi.reject(id, comments);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: approvalsKeys.all });
      toast.success("Rejected");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to reject");
    },
  });
}

/** Conditional approve mutation */
export function useConditionalApproveItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      conditions,
      comments,
    }: {
      id: string;
      conditions: Record<string, unknown>;
      comments?: string;
    }) => {
      if (USE_MOCK) return approvalsMockApi.conditionalApprove(id, conditions, comments);
      return approvalsApi.conditionalApprove(id, conditions, comments);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: approvalsKeys.all });
      toast.success("Conditionally approved");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to approve");
    },
  });
}

/** Notification templates list */
export function useTemplatesList() {
  const query = useQuery({
    queryKey: templatesKeys.list(),
    queryFn: async () => {
      if (USE_MOCK) return templatesMockApi.list();
      return templatesApi.list();
    },
  });
  const items = safeArray<NotificationTemplate>(query.data);
  return { ...query, items };
}

/** Template preview */
export function useTemplatePreview() {
  return useMutation({
    mutationFn: async ({
      templateId,
      data,
    }: {
      templateId: string;
      data: Record<string, string>;
    }) => {
      if (USE_MOCK) return templatesMockApi.preview(templateId, data);
      return templatesApi.preview(templateId, data);
    },
  });
}
