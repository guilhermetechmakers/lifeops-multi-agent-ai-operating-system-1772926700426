/**
 * Single approval item card row: id, name, priority, SLA, status badge, nextRun, requester.
 * Dense rows (8–12px vertical spacing) per design spec.
 */

import { formatDistanceToNow } from "date-fns";
import { Clock, User, ChevronRight, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ApprovalQueueItem, ApprovalQueueStatus, ApprovalSeverity } from "@/types/approvals";

export interface ItemCardRowProps {
  item: ApprovalQueueItem;
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}

const SEVERITY_VARIANTS: Record<ApprovalSeverity, "secondary" | "default" | "warning" | "destructive"> = {
  low: "secondary",
  medium: "default",
  high: "warning",
  critical: "destructive",
};

const STATUS_VARIANTS: Record<
  ApprovalQueueStatus,
  "secondary" | "default" | "success" | "destructive" | "outline" | "warning"
> = {
  queued: "secondary",
  pending: "default",
  approved: "success",
  rejected: "destructive",
  conditional: "outline",
  escalated: "warning",
};

function SlaCountdown({ item }: { item: ApprovalQueueItem }) {
  if (!item.slaMinutes || !item.createdAt) return null;
  const created = new Date(item.createdAt).getTime();
  const expiry = created + item.slaMinutes * 60 * 1000;
  const now = Date.now();
  const remainingMs = expiry - now;
  const remainingMins = Math.floor(remainingMs / 60 / 1000);
  if (remainingMins < 0) {
    return (
      <span className="flex items-center gap-1 text-xs text-destructive">
        <AlertTriangle className="h-3.5 w-3" />
        Overdue
      </span>
    );
  }
  if (remainingMins < 60) {
    return (
      <span className="flex items-center gap-1 text-xs text-amber-500">
        <AlertTriangle className="h-3.5 w-3" />
        {remainingMins}m left
      </span>
    );
  }
  return (
    <span className="text-xs text-muted-foreground">
      SLA {Math.floor(remainingMins / 60)}h left
    </span>
  );
}

export function ItemCardRow({ item, isSelected, onClick, className }: ItemCardRowProps) {
  const displayName = item.cronName ?? item.cronjob_name ?? "Approval";
  const ownerName = item.ownerName ?? item.agent ?? item.ownerId ?? "—";
  const priorityLevel = (item as { priorityLevel?: string }).priorityLevel ?? item.severity;
  const priorityVariant = SEVERITY_VARIANTS[priorityLevel as ApprovalSeverity] ?? "secondary";
  const statusVariant = STATUS_VARIANTS[item.status] ?? "secondary";
  const nextRun = (item as { nextRun?: string }).nextRun ?? item.scheduledTime ?? item.eta;

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "cursor-pointer transition-all duration-200 border-white/[0.03] bg-card hover:bg-secondary/30 hover:shadow-card-hover",
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        className
      )}
      aria-pressed={isSelected}
      aria-label={`View approval: ${displayName}`}
    >
      <CardContent className="py-2 px-3 flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">{item.id}</span>
            <span className="font-medium text-foreground truncate">{displayName}</span>
            <Badge variant={priorityVariant} className="text-xs">
              {priorityLevel}
            </Badge>
            <Badge variant={statusVariant} className="text-xs">
              {item.status}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-0.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3" />
              {ownerName}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3" />
              {nextRun
                ? `Next: ${formatDistanceToNow(new Date(nextRun), { addSuffix: true })}`
                : "—"}
            </span>
            <SlaCountdown item={item} />
          </div>
          {item.rationale && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              {item.rationale}
            </p>
          )}
        </div>
        <ChevronRight
          className={cn(
            "h-5 w-5 text-muted-foreground shrink-0 transition-transform",
            isSelected && "translate-x-0.5"
          )}
          aria-hidden
        />
      </CardContent>
    </Card>
  );
}
