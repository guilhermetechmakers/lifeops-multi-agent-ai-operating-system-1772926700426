/**
 * ConflictDetector — detects overlaps, capacity, and channel conflicts.
 * One conflict per (channelId, slot) with all overlapping itemIds.
 */

import type { ContentItem, Channel, Conflict } from "@/types/content-calendar";

export function detectConflicts(
  items: ContentItem[],
  channels: Channel[],
  capacityMap: Record<string, number>
): Conflict[] {
  const channelCapacity = new Map<string, number>();
  for (const ch of channels ?? []) {
    channelCapacity.set(ch.id, capacityMap[ch.id] ?? ch.capacityPerSlot ?? 2);
  }

  const byChannel = new Map<string, ContentItem[]>();
  for (const item of items ?? []) {
    if (!item?.publishAt) continue;
    const list = byChannel.get(item.channelId) ?? [];
    list.push(item);
    byChannel.set(item.channelId, list);
  }

  const seenSlots = new Set<string>();
  const conflicts: Conflict[] = [];

  for (const [channelId, channelItems] of byChannel) {
    const cap = channelCapacity.get(channelId) ?? 2;
    const sorted = [...channelItems].sort(
      (a, b) => new Date(a.publishAt).getTime() - new Date(b.publishAt).getTime()
    );

    for (let i = 0; i < sorted.length; i++) {
      const a = sorted[i];
      const aStart = new Date(a.publishAt).getTime();
      const aEnd = aStart + (a.durationMinutes ?? 60) * 60 * 1000;

      const overlapping: ContentItem[] = [a];
      for (let j = i + 1; j < sorted.length; j++) {
        const b = sorted[j];
        const bStart = new Date(b.publishAt).getTime();
        const bEnd = bStart + (b.durationMinutes ?? 60) * 60 * 1000;
        if (bStart < aEnd && bEnd > aStart) {
          overlapping.push(b);
        } else if (bStart >= aEnd) break;
      }

      if (overlapping.length <= cap) continue;

      const slotKey = `${channelId}-${aStart}`;
      if (seenSlots.has(slotKey)) continue;
      seenSlots.add(slotKey);

      const severity: Conflict["severity"] =
        overlapping.length > cap + 2 ? "high" : overlapping.length > cap ? "medium" : "low";
      const reason: Conflict["reason"] =
        overlapping.length > cap + 1 ? "capacity" : "overlap";

      conflicts.push({
        id: `conflict-${slotKey}`,
        channelId,
        slotStart: a.publishAt,
        slotEnd: new Date(
          Math.max(...overlapping.map((o) => new Date(o.publishAt).getTime() + (o.durationMinutes ?? 60) * 60 * 1000))
        ).toISOString(),
        reason,
        severity,
        itemIds: overlapping.map((o) => o.id),
      });
    }
  }

  return conflicts;
}
