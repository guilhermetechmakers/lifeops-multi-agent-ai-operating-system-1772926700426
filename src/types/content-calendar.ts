/**
 * Content Calendar data models — channels, items, conflicts, audit.
 */

export type ContentType =
  | "idea"
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

export interface CalendarContentItem {
  id: string;
  title: string;
  type: ContentType;
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

export type ConflictReason = "overlap" | "capacity" | "channel";

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

export interface CalendarItemsQuery {
  start: string;
  end: string;
  channels?: string[];
}

export interface CalendarItemsResponse {
  data: CalendarContentItem[];
  meta: { total: number };
}

export interface ChannelCapacityResponse {
  [channelId: string]: number;
}
