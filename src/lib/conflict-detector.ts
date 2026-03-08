/**
 * Conflict detection for Content Calendar — overlap, capacity, channel.
 */

import type { ContentItem, Channel, Conflict } from "@/types/content-calendar";

function parseDate(iso: string): number {
  return new Date(iso).getTime();
}

function getSlotEnd(item: ContentItem): number {
  const start = parseDate(item.publishAt);
  const durationMs = (item.durationMinutes ?? 60) * 60 * 1000;
  return start + durationMs;
}

function rangesOverlap(
  start1: number,
  end1: number,
  start2: number,
  end2: number
): boolean {
  return start1 < end2 && start2 < end1;
}

export function detectConflicts(
  items: ContentItem[],
  channels: Channel[],
  channelCapacity: Record<string, number>
): Conflict[] {
  const list = items ?? [];
  const chList = channels ?? [];
  const cap = channelCapacity ?? {};
  const conflicts: Conflict[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < list.length; i++) {
    const a = list[i];
    if (!a?.publishAt || !a?.channelId) continue;
    const aStart = parseDate(a.publishAt);
    const aEnd = getSlotEnd(a);

    for (let j = i + 1; j < list.length; j++) {
      const b = list[j];
      if (!b?.publishAt || !b?.channelId) continue;
      if (a.channelId !== b.channelId) continue;

      const bStart = parseDate(b.publishAt);
      const bEnd = getSlotEnd(b);

      if (!rangesOverlap(aStart, aEnd, bStart, bEnd)) continue;

      const conflictId = [a.id, b.id].sort().join("--");
      if (seen.has(conflictId)) continue;
      seen.add(conflictId);

      const channel = chList.find((c) => c.id === a.channelId);
      const maxCap = cap[a.channelId] ?? channel?.capacityPerSlot ?? 2;
      const itemsInSlot = list.filter((x) => {
        if (x.channelId !== a.channelId) return false;
        const xStart = parseDate(x.publishAt);
        const xEnd = getSlotEnd(x);
        return rangesOverlap(aStart, aEnd, xStart, xEnd);
      });

      const severity =
        itemsInSlot.length > maxCap ? "high" : itemsInSlot.length >= maxCap ? "medium" : "low";

      conflicts.push({
        id: conflictId,
        channelId: a.channelId,
        slotStart: new Date(Math.min(aStart, bStart)).toISOString(),
        slotEnd: new Date(Math.max(aEnd, bEnd)).toISOString(),
        reason: itemsInSlot.length > maxCap ? "capacity" : "overlap",
        severity,
        itemIds: [a.id, b.id],
      });
    }
  }

  return conflicts;
}

export function wouldCreateConflict(
  items: ContentItem[],
  channels: Channel[],
  channelCapacity: Record<string, number>,
  candidate: { channelId: string; publishAt: string; durationMinutes: number; excludeId?: string }
): Conflict | null {
  const tempItem: ContentItem = {
    id: "temp",
    title: "",
    type: "draft",
    channelId: candidate.channelId,
    publishAt: candidate.publishAt,
    durationMinutes: candidate.durationMinutes ?? 60,
    status: "planned",
    assignees: [],
    version: 1,
    createdAt: "",
    updatedAt: "",
  };
  const filtered = (items ?? []).filter((i) => i.id !== candidate.excludeId);
  const all = [...filtered, tempItem];
  const conflicts = detectConflicts(all, channels, channelCapacity);
  return conflicts.find((c) => c.itemIds.includes("temp")) ?? null;
}
