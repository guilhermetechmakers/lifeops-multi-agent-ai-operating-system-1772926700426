/**
 * Content Calendar API — calendar items, channels, conflicts, audit.
 */

import { api, safeArray } from "@/lib/api";
import type {
  ContentItem,
  Channel,
  AuditLog,
  CreateCalendarItemPayload,
  BulkReschedulePayload,
  ChannelCapacityMap,
} from "@/types/content-calendar";

const BASE = "/calendar";
const CHANNELS = "/channels";
const AUDIT = "/audit";

export interface CalendarItemsQuery {
  start?: string;
  end?: string;
  channels?: string[];
}

export interface CalendarItemsResponse {
  data: ContentItem[];
  meta: { total: number };
}

export async function fetchCalendarItems(
  query?: CalendarItemsQuery
): Promise<CalendarItemsResponse> {
  const params = new URLSearchParams();
  if (query?.start) params.set("start", query.start);
  if (query?.end) params.set("end", query.end);
  if (query?.channels?.length)
    params.set("channels", query.channels.join(","));

  const qs = params.toString();
  const endpoint = qs ? `${BASE}/items?${qs}` : `${BASE}/items`;
  const raw = await api.get<CalendarItemsResponse | { data?: ContentItem[]; meta?: { total?: number } }>(endpoint);

  const data = safeArray<ContentItem>(
    (raw as { data?: ContentItem[] })?.data ?? (raw as CalendarItemsResponse)?.data ?? []
  );
  const meta = (raw as { meta?: { total?: number } })?.meta ?? { total: data.length };

  return { data, meta: { total: meta.total ?? data.length } };
}

export async function createCalendarItem(
  payload: CreateCalendarItemPayload
): Promise<ContentItem> {
  const raw = await api.post<ContentItem | { data?: ContentItem }>(
    `${BASE}/items`,
    payload
  );
  if (raw && typeof raw === "object" && "data" in raw)
    return (raw as { data?: ContentItem }).data!;
  return raw as ContentItem;
}

export async function updateCalendarItem(
  id: string,
  payload: Partial<ContentItem>
): Promise<ContentItem> {
  const raw = await api.patch<ContentItem | { data?: ContentItem }>(
    `${BASE}/items/${id}`,
    payload
  );
  if (raw && typeof raw === "object" && "data" in raw)
    return (raw as { data?: ContentItem }).data!;
  return raw as ContentItem;
}

export async function bulkReschedule(
  payload: BulkReschedulePayload
): Promise<ContentItem[]> {
  const raw = await api.post<ContentItem[] | { data?: ContentItem[] }>(
    `${BASE}/items/bulk-reschedule`,
    payload
  );
  const arr = Array.isArray(raw) ? raw : (raw as { data?: ContentItem[] })?.data;
  return safeArray<ContentItem>(arr ?? []);
}

export async function fetchChannels(): Promise<Channel[]> {
  const raw = await api.get<Channel[] | { data?: Channel[] }>(CHANNELS);
  const arr = Array.isArray(raw) ? raw : (raw as { data?: Channel[] })?.data;
  return safeArray<Channel>(arr ?? []);
}

export async function fetchChannelCapacity(): Promise<ChannelCapacityMap> {
  const raw = await api.get<ChannelCapacityMap | { data?: ChannelCapacityMap }>(
    `${CHANNELS}/capacity`
  );
  const data =
    (raw as { data?: ChannelCapacityMap })?.data ?? (raw as ChannelCapacityMap);
  return data ?? {};
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
}

export async function logAudit(payload: {
  action: string;
  actorId: string;
  targetItemId: string;
  details: string;
}): Promise<AuditLog> {
  const raw = await api.post<AuditLog | { data?: AuditLog }>(AUDIT, payload);
  if (raw && typeof raw === "object" && "data" in raw)
    return (raw as { data?: AuditLog }).data!;
  return raw as AuditLog;
}
