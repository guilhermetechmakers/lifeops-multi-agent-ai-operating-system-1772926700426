/**
 * Single approval item card row: priority, requester, cron name, ETA, status pill, quick actions.
 */

import { formatDistanceToNow } from "date-fns";
import { Clock, User, ChevronRight } from "lucide-react";
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

const STATUS_VARIANTS: Record<ApprovalQueueStatus, "secondary" | "default" | "success" | "destructive" | "outline"> = {
  queued: "secondary",
  pending: "default",
  approved: "success",
  rejected: "destructive",
  conditional: "outline",
};

export function ItemCardRow({ item, isSelected, onClick, className }: ItemCardRowProps) {
  const displayName = item.cronName ?? item.cronjob_name ?? "Approval";
  const ownerName = item.ownerName ?? item.agent ?? item.ownerId ?? "—";
  const severityVariant = SEVERITY_VARIANTS[item.severity] ?? "secondary";
  const statusVariant = STATUS_VARIANTS[item.status] ?? "secondary";

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
      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-foreground truncate">{displayName}</span>
            <Badge variant={severityVariant} className="text-xs">
              {item.severity}
            </Badge>
            <Badge variant={statusVariant} className="text-xs">
              {item.status}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3" />
              {ownerName}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3" />
              ETA {item.eta ? formatDistanceToNow(new Date(item.eta), { addSuffix: true }) : "—"}
            </span>
          </div>
          {item.rationale && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
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
