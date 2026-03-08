/**
 * Content Calendar hooks — data fetching with null-safety.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "@/api/content-calendar";
import * as mock from "@/api/content-calendar-mock";
import type { CalendarItemsQuery } from "@/api/content-calendar";
import type {
  ContentItem,
  CreateCalendarItemPayload,
  BulkReschedulePayload,
} from "@/types/content-calendar";

const USE_MOCK =
  !import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_USE_MOCK_CONTENT === "true";

const QUERY_KEYS = {
  calendarItems: (query?: CalendarItemsQuery) =>
    ["content-calendar", "items", query] as const,
  channels: ["content-calendar", "channels"] as const,
  channelCapacity: ["content-calendar", "channel-capacity"] as const,
};

export function useCalendarItems(query?: CalendarItemsQuery) {
  const result = useQuery({
    queryKey: QUERY_KEYS.calendarItems(query),
    queryFn: () =>
      USE_MOCK ? mock.mockFetchCalendarItems(query) : api.fetchCalendarItems(query),
    placeholderData: { data: [], meta: { total: 0 } },
  });

  const data = result.data ?? { data: [], meta: { total: 0 } };
  const items = Array.isArray(data.data) ? data.data : [];
  const total = data.meta?.total ?? items.length;

  return { ...result, items, total };
}

export function useChannels() {
  const result = useQuery({
    queryKey: QUERY_KEYS.channels,
    queryFn: () => (USE_MOCK ? mock.mockFetchChannels() : api.fetchChannels()),
    placeholderData: [],
  });

  const channels = Array.isArray(result.data) ? result.data : [];
  return { ...result, channels };
}

export function useChannelCapacity() {
  const result = useQuery({
    queryKey: QUERY_KEYS.channelCapacity,
    queryFn: () =>
      USE_MOCK ? mock.mockFetchChannelCapacity() : api.fetchChannelCapacity(),
    placeholderData: {},
  });

  const capacity = result.data ?? {};
  return { ...result, capacity };
}

export function useCreateCalendarItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCalendarItemPayload) =>
      USE_MOCK ? mock.mockCreateCalendarItem(payload) : api.createCalendarItem(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-calendar"] });
      toast.success("Content item created");
    },
    onError: () => toast.error("Failed to create content item"),
  });
}

export function useUpdateCalendarItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ContentItem> }) =>
      USE_MOCK
        ? mock.mockUpdateCalendarItem(id, payload)
        : api.updateCalendarItem(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-calendar"] });
      toast.success("Content item updated");
    },
    onError: () => toast.error("Failed to update content item"),
  });
}

export function useBulkReschedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BulkReschedulePayload) =>
      USE_MOCK ? mock.mockBulkReschedule(payload) : api.bulkReschedule(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-calendar"] });
      toast.success("Items rescheduled");
    },
    onError: () => toast.error("Failed to reschedule"),
  });
}

export function useAuditLogs(params?: {
  targetItemId?: string;
  limit?: number;
}) {
  const itemsQuery = useQuery({
    queryKey: ["content-calendar", "audit", params],
    queryFn: () =>
      USE_MOCK
        ? Promise.resolve(mock.mockGetAuditLogs())
        : api.fetchAuditLogs(params),
    placeholderData: [],
  });
  const logs = Array.isArray(itemsQuery.data) ? itemsQuery.data : [];
  return { ...itemsQuery, logs, isLoading: itemsQuery.isLoading };
}

export function useLogAudit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      action: string;
      actorId: string;
      targetItemId: string;
      details: string;
    }) =>
      USE_MOCK ? mock.mockLogAudit(payload) : api.logAudit(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-calendar", "audit"] });
    },
  });
}
