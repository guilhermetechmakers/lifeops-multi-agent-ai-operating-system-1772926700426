/**
 * Content Calendar data models — aligned with API schemas.
 */

export type ContentItemType =
  | "idea"
  | "ideation"
  | "research"
  | "draft"
  | "edit"
  | "schedule"
  | "publish";

export type ContentItemStatus =
  | "planned"
  | "in-progress"
  | "published"
  | "blocked";

export interface ContentItem {
  id: string;
  title: string;
  type: ContentItemType;
  channelId: string;
  publishAt: string;
  durationMinutes: number;
  status: ContentItemStatus;
  assignees: string[];
  version: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Channel {
  id: string;
  name: string;
  capacityPerSlot: number;
  color: string;
}

export type ConflictSeverity = "low" | "medium" | "high";

export type ConflictReason =
  | "overlap"
  | "capacity"
  | "channel"
  | "tool-restriction";

export interface Conflict {
  id: string;
  channelId: string;
  slotStart: string;
  slotEnd: string;
  reason: ConflictReason;
  severity: ConflictSeverity;
  itemIds: string[];
}

export interface AuditLog {
  id: string;
  action: string;
  actorId: string;
  targetItemId: string;
  details: string;
  createdAt: string;
}

export interface CalendarItemsResponse {
  data: ContentItem[];
  meta: { total: number };
}

export interface ChannelCapacityMap {
  [channelId: string]: number;
}

export interface CreateCalendarItemPayload {
  title: string;
  type: ContentItemType;
  channelId: string;
  publishAt: string;
  durationMinutes: number;
  assignees?: string[];
  metadata?: Record<string, unknown>;
}

export interface BulkReschedulePayload {
  itemIds: string[];
  newPublishAt: string;
  newChannelId?: string;
}

export interface CalendarItemsQuery {
  start: string;
  end: string;
  channels?: string[];
}
