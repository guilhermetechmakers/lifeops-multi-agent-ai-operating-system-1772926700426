/**
 * Content Calendar API — calendar items, channels, conflicts, audit.
 */

import { api, safeArray } from "@/lib/api";
import type {
  CalendarContentItem,
  Channel,
  Conflict,
  AuditLog,
  CalendarItemsQuery,
  CalendarItemsResponse,
  ChannelCapacityResponse,
} from "@/types/content-calendar";

const BASE = "/calendar";
const CHANNELS = "/channels";
const AUDIT = "/audit";

export async function fetchCalendarItems(
  query: CalendarItemsQuery
): Promise<CalendarItemsResponse> {
  const params = new URLSearchParams();
  params.set("start", query.start);
  params.set("end", query.end);
  if (query.channels?.length) {
    params.set("channels", query.channels.join(","));
  }
  const raw = await api.get<CalendarItemsResponse | { data?: CalendarContentItem[]; meta?: { total: number } }>(
    `${BASE}/items?${params.toString()}`
  );
  const data = (raw as { data?: CalendarContentItem[] })?.data ?? (raw as CalendarItemsResponse)?.data;
  const meta = (raw as { meta?: { total: number } })?.meta ?? (raw as CalendarItemsResponse)?.meta;
  const items = safeArray<CalendarContentItem>(data ?? []);
  return {
    data: items,
    meta: { total: meta?.total ?? items.length },
  };
}

export async function createCalendarItem(payload: {
  title: string;
  type: string;
  channelId: string;
  publishAt: string;
  durationMinutes: number;
  assignees?: string[];
  metadata?: Record<string, unknown>;
}): Promise<CalendarContentItem> {
  const raw = await api.post<CalendarContentItem | { data?: CalendarContentItem }>(
    `${BASE}/items`,
    payload
  );
  return (raw as { data?: CalendarContentItem })?.data ?? (raw as CalendarContentItem);
}

export async function updateCalendarItem(
  id: string,
  payload: Partial<Pick<CalendarContentItem, "publishAt" | "channelId" | "title" | "status" | "assignees">>
): Promise<CalendarContentItem> {
  const raw = await api.patch<CalendarContentItem | { data?: CalendarContentItem }>(
    `${BASE}/items/${id}`,
    payload
  );
  return (raw as { data?: CalendarContentItem })?.data ?? (raw as CalendarContentItem);
}

export async function bulkReschedule(payload: {
  itemIds: string[];
  newPublishAt: string;
  newChannelId?: string;
}): Promise<{ updated: number }> {
  const raw = await api.post<{ updated: number } | { data?: { updated: number } }>(
    `${BASE}/items/bulk-reschedule`,
    payload
  );
  const result = (raw as { data?: { updated: number } })?.data ?? (raw as { updated: number });
  return { updated: result?.updated ?? 0 };
}

export async function fetchChannels(): Promise<Channel[]> {
  const raw = await api.get<Channel[] | { data?: Channel[] }>(CHANNELS);
  const arr = Array.isArray(raw) ? raw : (raw as { data?: Channel[] })?.data;
  return safeArray<Channel>(arr ?? []);
}

export async function fetchChannelCapacity(): Promise<ChannelCapacityResponse> {
  const raw = await api.get<ChannelCapacityResponse | { data?: ChannelCapacityResponse }>(
    `${CHANNELS}/capacity`
  );
  const data = (raw as { data?: ChannelCapacityResponse })?.data ?? (raw as ChannelCapacityResponse);
  return data ?? {};
}

export async function logAudit(payload: {
  action: string;
  actorId: string;
  targetItemId: string;
  details: string;
}): Promise<AuditLog> {
  const raw = await api.post<AuditLog | { data?: AuditLog }>(AUDIT, payload);
  return (raw as { data?: AuditLog })?.data ?? (raw as AuditLog);
}

export async function fetchAuditLogs(params?: {
  targetItemId?: string;
  limit?: number;
}): Promise<AuditLog[]> {
  const searchParams = new URLSearchParams();
  if (params?.targetItemId) searchParams.set("targetItemId", params.targetItemId);
  if (params?.limit != null) searchParams.set("limit", String(params.limit));
  const qs = searchParams.toString();
  const endpoint = qs ? `${AUDIT}?${qs}` : AUDIT;
  const raw = await api.get<AuditLog[] | { data?: AuditLog[] }>(endpoint);
  const arr = Array.isArray(raw) ? raw : (raw as { data?: AuditLog[] })?.data;
  return safeArray<AuditLog>(arr ?? []);
