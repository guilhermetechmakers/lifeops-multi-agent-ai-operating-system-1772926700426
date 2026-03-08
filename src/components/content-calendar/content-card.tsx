/**
 * ContentCard — draggable content card with icon, title, channel badge, status pill.
 */

import { useDraggable } from "@dnd-kit/core";
import { GripVertical, FileText, ExternalLink } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { ContentItem } from "@/types/content-calendar";
import type { Channel } from "@/types/content-calendar";

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  idea: FileText,
  ideation: FileText,
  research: FileText,
  draft: FileText,
  edit: FileText,
  schedule: FileText,
  publish: FileText,
};

const STATUS_COLORS: Record<string, string> = {
  planned: "bg-muted text-muted-foreground",
  "in-progress": "text-teal",
  published: "text-teal",
  blocked: "text-destructive",
};

export interface ContentCardProps {
  item: ContentItem;
  channel?: Channel;
  isDragging?: boolean;
  onClick?: () => void;
}

export function ContentCard({
  item,
  channel,
  isDragging = false,
  onClick,
}: ContentCardProps) {
  const Icon = TYPE_ICONS[item.type] ?? FileText;
  const statusColor = STATUS_COLORS[item.status] ?? "text-muted-foreground";
  const publishTime = item.publishAt
    ? format(parseISO(item.publishAt), "MMM d, HH:mm")
    : "—";
  const assigneeCount = (item.assignees ?? []).length;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={cn(
        "group rounded-lg border border-white/[0.03] bg-secondary/80 p-3 transition-all duration-200",
        "hover:shadow-card-hover hover:-translate-y-0.5 cursor-grab active:cursor-grabbing",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isDragging && "opacity-90 shadow-lg scale-[1.02] ring-2 ring-primary/40"
      )}
      aria-label={`${item.title}, scheduled ${publishTime}`}
    >
      <div className="flex items-start gap-2">
        <GripVertical
          className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5"
          aria-hidden
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
            <p className="text-sm font-medium text-foreground line-clamp-2">
              {item.title}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {channel && (
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: `${channel.color}20`,
                  color: channel.color,
                }}
              >
                {channel.name}
              </span>
            )}
            <span className="text-xs text-muted-foreground">{publishTime}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={cn("text-xs font-medium", statusColor)}>
              {item.status}
            </span>
            {assigneeCount > 0 && (
              <span className="text-xs text-muted-foreground">
                {assigneeCount} assignee{assigneeCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
        <Link
          to={`/dashboard/content/editor?itemId=${item.id}`}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-secondary"
          onClick={(e) => e.stopPropagation()}
          aria-label="Open in editor"
        >
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
}

export interface DraggableContentCardProps extends ContentCardProps {
  disabled?: boolean;
}

export function DraggableContentCard({
  item,
  channel,
  isDragging = false,
  onClick,
  disabled = false,
}: DraggableContentCardProps) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: item.id,
    data: { item },
    disabled,
  });

  return (
    <div ref={setNodeRef} {...attributes} {...listeners}>
      <ContentCard
        item={item}
        channel={channel}
        isDragging={isDragging}
        onClick={onClick}
      />
    </div>
  );
}
