/**
 * ChannelLane — vertical lane per channel with slot grid and drop targets.
 */

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { DraggableContentCard } from "./content-card";
import type { ContentItem } from "@/types/content-calendar";
import type { Channel } from "@/types/content-calendar";

export interface ChannelLaneProps {
  channel: Channel;
  items: ContentItem[];
  slotId: string;
  slotLabel: string;
  isOver?: boolean;
  hasConflict?: boolean;
  onItemClick?: (item: ContentItem) => void;
}

export function ChannelLane({
  channel,
  items,
  slotId,
  slotLabel,
  isOver = false,
  hasConflict = false,
  onItemClick,
}: ChannelLaneProps) {
  const { setNodeRef, isOver: isDroppableOver } = useDroppable({
    id: slotId,
    data: { channelId: channel.id, slotLabel },
  });

  const over = isOver || isDroppableOver;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[120px] rounded-lg border border-[rgb(255_255_255/0.03)] p-4 transition-all duration-200",
        "bg-card/50",
        over && "ring-2 ring-primary/40 ring-offset-2 ring-offset-background bg-primary/5",
        hasConflict && "ring-1 ring-destructive/50"
      )}
      role="region"
      aria-label={`${channel.name} - ${slotLabel}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="h-2 w-2 rounded-full shrink-0"
          style={{ backgroundColor: channel.color }}
        />
        <p className="text-xs font-medium text-muted-foreground truncate">
          {slotLabel}
        </p>
      </div>
      <div className="space-y-2">
        {(items ?? []).map((item) => (
          <DraggableContentCard
            key={item.id}
            item={item}
            channel={channel}
            onClick={() => onItemClick?.(item)}
          />
        ))}
      </div>
    </div>
  );
}
