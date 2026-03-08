/**
 * Mock data for Content Calendar when API is not configured.
 */

import type {
  ContentItem,
  Channel,
  AuditLog,
  CreateCalendarItemPayload,
  BulkReschedulePayload,
  ChannelCapacityMap,
} from "@/types/content-calendar";
import type { CalendarItemsQuery } from "./content-calendar";

const MOCK_CHANNELS: Channel[] = [
  { id: "ch-blog", name: "Blog", capacityPerSlot: 2, color: "#00C2A8" },
  { id: "ch-newsletter", name: "Newsletter", capacityPerSlot: 1, color: "#8B5CF6" },
  { id: "ch-social", name: "Social", capacityPerSlot: 3, color: "#FFB020" },
];

const MOCK_ITEMS: ContentItem[] = [
  {
    id: "cc-1",
    title: "Getting Started with LifeOps",
    type: "draft",
    channelId: "ch-blog",
    publishAt: "2025-03-15T10:00:00Z",
    durationMinutes: 60,
    status: "in-progress",
    assignees: ["u1"],
    version: 2,
    metadata: {},
    createdAt: "2025-03-01T00:00:00Z",
    updatedAt: "2025-03-07T14:00:00Z",
  },
  {
    id: "cc-2",
    title: "Content Pipeline Best Practices",
    type: "edit",
    channelId: "ch-blog",
    publishAt: "2025-03-18T14:00:00Z",
    durationMinutes: 45,
    status: "planned",
    assignees: ["u2", "u3"],
    version: 3,
    metadata: {},
    createdAt: "2025-02-20T00:00:00Z",
    updatedAt: "2025-03-06T09:00:00Z",
  },
  {
    id: "cc-3",
    title: "AI-Assisted Writing Workflow",
    type: "ideation",
    channelId: "ch-newsletter",
    publishAt: "2025-03-20T09:00:00Z",
    durationMinutes: 30,
    status: "planned",
    assignees: [],
    version: 1,
    metadata: {},
    createdAt: "2025-03-05T00:00:00Z",
    updatedAt: "2025-03-05T00:00:00Z",
  },
  {
    id: "cc-4",
    title: "SEO Optimization Guide",
    type: "schedule",
    channelId: "ch-blog",
    publishAt: "2025-03-10T09:00:00Z",
    durationMinutes: 60,
    status: "planned",
    assignees: ["u3"],
    version: 4,
    metadata: {},
    createdAt: "2025-02-01T00:00:00Z",
    updatedAt: "2025-03-08T11:00:00Z",
  },
  {
    id: "cc-5",
    title: "Multi-Agent Orchestration",
    type: "research",
    channelId: "ch-newsletter",
    publishAt: "2025-03-22T11:00:00Z",
    durationMinutes: 45,
    status: "planned",
    assignees: ["u2"],
    version: 1,
    metadata: {},
    createdAt: "2025-03-04T00:00:00Z",
    updatedAt: "2025-03-07T16:00:00Z",
  },
  {
    id: "cc-6",
    title: "Release Notes Automation",
    type: "publish",
    channelId: "ch-social",
    publishAt: "2025-03-01T12:00:00Z",
    durationMinutes: 15,
    status: "published",
    assignees: [],
    version: 5,
    metadata: {},
    createdAt: "2025-01-15T00:00:00Z",
    updatedAt: "2025-03-01T12:00:00Z",
  },
  {
    id: "cc-7",
    title: "Weekly Product Update",
    type: "draft",
    channelId: "ch-newsletter",
    publishAt: "2025-03-10T09:00:00Z",
    durationMinutes: 30,
    status: "planned",
    assignees: ["u1"],
    version: 1,
    metadata: {},
    createdAt: "2025-03-06T00:00:00Z",
    updatedAt: "2025-03-06T00:00:00Z",
  },
];

const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: "al-1",
    action: "reschedule",
    actorId: "u1",
    targetItemId: "cc-1",
    details: "Moved from 2025-03-14 to 2025-03-15",
    createdAt: "2025-03-07T14:00:00Z",
  },
  {
    id: "al-2",
    action: "create",
    actorId: "u2",
    targetItemId: "cc-7",
    details: "Created Weekly Product Update",
    createdAt: "2025-03-06T00:00:00Z",
  },
];

let itemsStore = [...MOCK_ITEMS];
let auditStore = [...MOCK_AUDIT_LOGS];

function filterByDateRange(
  items: ContentItem[],
  start?: string,
  end?: string
): ContentItem[] {
  if (!start && !end) return items;
  return items.filter((i) => {
    const d = new Date(i.publishAt).getTime();
    if (start && d < new Date(start).getTime()) return false;
    if (end && d > new Date(end).getTime()) return false;
    return true;
  });
}

export async function mockFetchCalendarItems(
  query?: CalendarItemsQuery
): Promise<{ data: ContentItem[]; meta: { total: number } }> {
  let filtered = filterByDateRange(itemsStore, query?.start, query?.end);
  if (query?.channels?.length) {
    filtered = filtered.filter((i) => query.channels!.includes(i.channelId));
  }
  return { data: [...filtered], meta: { total: filtered.length } };
}

export async function mockCreateCalendarItem(
  payload: CreateCalendarItemPayload
): Promise<ContentItem> {
  const now = new Date().toISOString();
  const item: ContentItem = {
    id: `cc-${Date.now()}`,
    title: payload.title,
    type: payload.type,
    channelId: payload.channelId,
    publishAt: payload.publishAt,
    durationMinutes: payload.durationMinutes,
    status: "planned",
    assignees: payload.assignees ?? [],
    version: 1,
    metadata: payload.metadata ?? {},
    createdAt: now,
    updatedAt: now,
  };
  itemsStore = [...itemsStore, item];
  auditStore = [
    ...auditStore,
    {
      id: `al-${Date.now()}`,
      action: "create",
      actorId: "u1",
      targetItemId: item.id,
      details: `Created ${item.title}`,
      createdAt: now,
    },
  ];
  return item;
}

export async function mockUpdateCalendarItem(
  id: string,
  payload: Partial<ContentItem>
): Promise<ContentItem> {
  const idx = itemsStore.findIndex((i) => i.id === id);
  if (idx < 0) throw new Error("Item not found");
  const updated = { ...itemsStore[idx], ...payload, updatedAt: new Date().toISOString() };
  itemsStore = [...itemsStore.slice(0, idx), updated, ...itemsStore.slice(idx + 1)];
  return updated;
}

export async function mockBulkReschedule(
  payload: BulkReschedulePayload
): Promise<ContentItem[]> {
  const updated: ContentItem[] = [];
  for (const id of payload.itemIds) {
    const idx = itemsStore.findIndex((i) => i.id === id);
    if (idx >= 0) {
      const item = {
        ...itemsStore[idx],
        publishAt: payload.newPublishAt,
        channelId: payload.newChannelId ?? itemsStore[idx].channelId,
        updatedAt: new Date().toISOString(),
      };
      itemsStore = [...itemsStore.slice(0, idx), item, ...itemsStore.slice(idx + 1)];
      updated.push(item);
    }
  }
  auditStore = [
    ...auditStore,
    {
      id: `al-${Date.now()}`,
      action: "bulk-reschedule",
      actorId: "u1",
      targetItemId: payload.itemIds[0] ?? "",
      details: `Rescheduled ${payload.itemIds.length} items to ${payload.newPublishAt}`,
      createdAt: new Date().toISOString(),
    },
  ];
  return updated;
}

export async function mockFetchChannels(): Promise<Channel[]> {
  return [...MOCK_CHANNELS];
}

export async function mockFetchChannelCapacity(): Promise<ChannelCapacityMap> {
  return {
    "ch-blog": 2,
    "ch-newsletter": 1,
    "ch-social": 3,
  };
}

export async function mockLogAudit(payload: {
  action: string;
  actorId: string;
  targetItemId: string;
  details: string;
}): Promise<AuditLog> {
  const log: AuditLog = {
    id: `al-${Date.now()}`,
    ...payload,
    createdAt: new Date().toISOString(),
  };
  auditStore = [...auditStore, log];
  return log;
}

export function mockGetAuditLogs(): AuditLog[] {
  return [...auditStore];
}
