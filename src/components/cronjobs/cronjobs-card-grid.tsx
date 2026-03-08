/**
 * CronjobsCardGrid: responsive card list for mobile with null-safe data guards.
 */

import { Link } from "react-router-dom";
import {
  Play,
  Pencil,
  Copy,
  Trash2,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  SkipForward,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { humanizeCron } from "@/lib/cron-utils";
import { formatDistanceToNow } from "date-fns";
import type { Cronjob } from "@/types/cronjob";
import { cn } from "@/lib/utils";

function LastRunBadge({ status }: { status?: string }) {
  if (!status) return <span className="text-muted-foreground text-xs">—</span>;
  switch (status) {
    case "success":
      return (
        <span className="inline-flex items-center gap-1 text-teal text-xs">
          <CheckCircle2 className="h-3 w-3" />
          Success
        </span>
      );
    case "failure":
      return (
        <span className="inline-flex items-center gap-1 text-destructive text-xs">
          <XCircle className="h-3 w-3" />
          Failure
        </span>
      );
    case "skipped":
      return (
        <span className="inline-flex items-center gap-1 text-amber text-xs">
          <SkipForward className="h-3 w-3" />
          Skipped
        </span>
      );
    default:
      return <span className="text-muted-foreground text-xs">{status}</span>;
  }
}

export interface CronjobsCardGridProps {
  items: Cronjob[];
  selectedIds: Set<string>;
  onSelect: (id: string) => void;
  onRunNow: (id: string) => void;
  onEdit: (id: string) => void;
  onClone: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleEnabled: (id: string, enabled: boolean) => void;
  onViewDetails?: (id: string) => void;
}

export function CronjobsCardGrid({
  items,
  selectedIds,
  onSelect,
  onRunNow,
  onEdit,
  onClone,
  onDelete,
  onToggleEnabled,
  onViewDetails,
}: CronjobsCardGridProps) {
  const list = items ?? [];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
      {(list ?? []).map((job) => (
        <Card
          key={job.id}
          className={cn(
            "border-white/[0.03] bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover",
            selectedIds.has(job.id) && "ring-1 ring-primary/30"
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <Checkbox
                  checked={selectedIds.has(job.id)}
                  onCheckedChange={() => onSelect(job.id)}
                  aria-label={`Select ${job.name}`}
                  className="mt-0.5 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/dashboard/cronjobs/${job.id}`}
                    className="font-medium text-foreground hover:underline line-clamp-1"
                  >
                    {job.name}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground font-mono">
                    {job.scheduleExpression ?? "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {humanizeCron(job.scheduleExpression ?? "")}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant={job.enabled ? "success" : "secondary"} className="text-xs">
                      {job.enabled ? "Enabled" : "Paused"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Next:{" "}
                      {job.nextRun
                        ? formatDistanceToNow(new Date(job.nextRun), { addSuffix: true })
                        : "—"}
                    </span>
                    <LastRunBadge status={job.lastRun?.status} />
                    <span className="text-xs text-muted-foreground">
                      {job.module ?? "—"} · {job.targetType}
                    </span>
                  </div>
                  {(job.tags ?? []).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {(job.tags ?? []).slice(0, 4).map((t) => (
                        <Badge key={t} variant="outline" className="text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onRunNow(job.id)}
                  aria-label="Run now"
                >
                  <Play className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="More">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {onViewDetails && (
                      <DropdownMenuItem onClick={() => onViewDetails(job.id)}>
                        View details
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onToggleEnabled(job.id, !job.enabled)}>
                      {job.enabled ? "Pause" : "Enable"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(job.id)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onClone(job.id)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Clone
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(job.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
