/**
 * Mock data for Content Calendar when API is not configured.
 */

import type {
  CalendarContentItem,
  Channel,
  Conflict,
  AuditLog,
  CalendarItemsQuery,
  CalendarItemsResponse,
  ChannelCapacityResponse,
} from "@/types/content-calendar";

const MOCK_CHANNELS: Channel[] = [
  { id: "ch-blog", name: "Blog", capacityPerSlot: 3, color: "#00C2A8" },
  { id: "ch-newsletter", name: "Newsletter", capacityPerSlot: 2, color: "#8B5CF6" },
  { id: "ch-social", name: "Social", capacityPerSlot: 5, color: "#FFB020" },
  { id: "proj-1", name: "Project 1", capacityPerSlot: 4, color: "#00C2A8" },
  { id: "proj-2", name: "Project 2", capacityPerSlot: 3, color: "#8B5CF6" },
];

const MOCK_CALENDAR_ITEMS: CalendarContentItem[] = [
  {
    id: "ci-1",
    title: "Getting Started with LifeOps",
    type: "draft",
    channelId: "proj-1",
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
    id: "ci-2",
    title: "Content Pipeline Best Practices",
    type: "edit",
    channelId: "proj-1",
    publishAt: "2025-03-18T14:00:00Z",
    durationMinutes: 45,
    status: "in-progress",
    assignees: ["u2", "u3"],
    version: 3,
    metadata: {},
    createdAt: "2025-02-20T00:00:00Z",
    updatedAt: "2025-03-06T09:00:00Z",
  },
  {
    id: "ci-3",
    title: "AI-Assisted Writing Workflow",
    type: "idea",
    channelId: "proj-1",
    publishAt: "2025-03-20T09:00:00Z",
    durationMinutes: 90,
    status: "planned",
    assignees: [],
    version: 1,
    metadata: {},
    createdAt: "2025-03-05T00:00:00Z",
    updatedAt: "2025-03-05T00:00:00Z",
  },
  {
    id: "ci-4",
    title: "SEO Optimization Guide",
    type: "publish",
    channelId: "proj-2",
    publishAt: "2025-03-10T09:00:00Z",
    durationMinutes: 30,
    status: "published",
    assignees: ["u3"],
    version: 4,
    metadata: {},
    createdAt: "2025-02-01T00:00:00Z",
    updatedAt: "2025-03-08T11:00:00Z",
  },
  {
    id: "ci-5",
    title: "Multi-Agent Orchestration",
    type: "research",
    channelId: "proj-1",
    publishAt: "2025-03-22T11:00:00Z",
    durationMinutes: 60,
    status: "planned",
    assignees: ["u2"],
    version: 1,
    metadata: {},
    createdAt: "2025-03-04T00:00:00Z",
    updatedAt: "2025-03-07T16:00:00Z",
  },
  {
    id: "ci-6",
    title: "Release Notes Automation",
    type: "publish",
    channelId: "ch-blog",
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
    id: "ci-7",
    title: "Weekly Newsletter Q1",
    type: "schedule",
    channelId: "ch-newsletter",
    publishAt: "2025-03-14T08:00:00Z",
    durationMinutes: 120,
    status: "planned",
    assignees: ["u1", "u3"],
    version: 1,
    metadata: {},
    createdAt: "2025-03-01T00:00:00Z",
    updatedAt: "2025-03-07T10:00:00Z",
  },
];

const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: "al-1",
    action: "reschedule",
    actorId: "u1",
    targetItemId: "ci-1",
    details: "Moved from 2025-03-14 to 2025-03-15",
    createdAt: "2025-03-07T14:00:00Z",
  },
  {
    id: "al-2",
    action: "create",
    actorId: "u2",
    targetItemId: "ci-2",
    details: "Created content item",
    createdAt: "2025-02-20T00:00:00Z",
  },
];

function filterItemsByRange(
  items: CalendarContentItem[],
  start: string,
  end: string
): CalendarContentItem[] {
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  return items.filter((i) => {
    const ms = new Date(i.publishAt).getTime();
    return ms >= startMs && ms <= endMs;
  });
}

export async function mockFetchCalendarItems(
  query: CalendarItemsQuery
): Promise<CalendarItemsResponse> {
  let items = filterItemsByRange(MOCK_CALENDAR_ITEMS, query.start, query.end);
  if (query.channels?.length) {
    const set = new Set(query.channels);
    items = items.filter((i) => set.has(i.channelId));
  }
  return {
    data: items,
    meta: { total: items.length },
  };
}

export async function mockCreateCalendarItem(payload: {
  title: string;
  type: string;
  channelId: string;
  publishAt: string;
  durationMinutes: number;
  assignees?: string[];
  metadata?: Record<string, unknown>;
}): Promise<CalendarContentItem> {
  const item: CalendarContentItem = {
    id: `ci-mock-${Date.now()}`,
    title: payload.title,
    type: payload.type as CalendarContentItem["type"],
    channelId: payload.channelId,
    publishAt: payload.publishAt,
    durationMinutes: payload.durationMinutes ?? 60,
    status: "planned",
    assignees: payload.assignees ?? [],
    version: 1,
    metadata: payload.metadata ?? {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  MOCK_CALENDAR_ITEMS.push(item);
  return item;
}

export async function mockUpdateCalendarItem(
  id: string,
  payload: Partial<Pick<CalendarContentItem, "publishAt" | "channelId" | "title" | "status" | "assignees">>
): Promise<CalendarContentItem> {
  const idx = MOCK_CALENDAR_ITEMS.findIndex((i) => i.id === id);
  if (idx < 0) throw new Error("Item not found");
  MOCK_CALENDAR_ITEMS[idx] = {
    ...MOCK_CALENDAR_ITEMS[idx],
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  return MOCK_CALENDAR_ITEMS[idx];
}

export async function mockBulkReschedule(payload: {
  itemIds: string[];
  newPublishAt: string;
  newChannelId?: string;
}): Promise<{ updated: number }> {
  let updated = 0;
  for (const id of payload.itemIds ?? []) {
    const idx = MOCK_CALENDAR_ITEMS.findIndex((i) => i.id === id);
    if (idx >= 0) {
      MOCK_CALENDAR_ITEMS[idx] = {
        ...MOCK_CALENDAR_ITEMS[idx],
        publishAt: payload.newPublishAt,
        ...(payload.newChannelId && { channelId: payload.newChannelId }),
        updatedAt: new Date().toISOString(),
      };
      updated++;
    }
  }
  return { updated };
}

export async function mockFetchChannels(): Promise<Channel[]> {
  return [...MOCK_CHANNELS];
}

export async function mockFetchChannelCapacity(): Promise<ChannelCapacityResponse> {
  const cap: ChannelCapacityResponse = {};
  for (const ch of MOCK_CHANNELS) {
    cap[ch.id] = ch.capacityPerSlot;
  }
  return cap;
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
  MOCK_AUDIT_LOGS.unshift(log);
  return log;
}

export async function mockFetchAuditLogs(params?: {
  targetItemId?: string;
  limit?: number;
}): Promise<AuditLog[]> {
  let logs = [...MOCK_AUDIT_LOGS];
  if (params?.targetItemId) {
    logs = logs.filter((l) => l.targetItemId === params.targetItemId);
  }
  if (params?.limit != null) {
    logs = logs.slice(0, params.limit);
  }
  return logs;
}
