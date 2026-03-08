/**
 * CronjobsListTable: sortable table with null-safe data guards.
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
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
  if (!status) return <span className="text-muted-foreground">—</span>;
  switch (status) {
    case "success":
      return (
        <span className="inline-flex items-center gap-1 text-teal">
          <CheckCircle2 className="h-3 w-3" />
          Success
        </span>
      );
    case "failure":
      return (
        <span className="inline-flex items-center gap-1 text-destructive">
          <XCircle className="h-3 w-3" />
          Failure
        </span>
      );
    case "skipped":
      return (
        <span className="inline-flex items-center gap-1 text-amber">
          <SkipForward className="h-3 w-3" />
          Skipped
        </span>
      );
    default:
      return <span className="text-muted-foreground">{status}</span>;
  }
}

export interface CronjobsListTableProps {
  items: Cronjob[];
  selectedIds: Set<string>;
  onSelect: (id: string) => void;
  onSelectAll: () => void;
  onRunNow: (id: string) => void;
  onEdit: (id: string) => void;
  onClone: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleEnabled: (id: string, enabled: boolean) => void;
  /** Open detail drawer for run history, logs, traces */
  onViewDetails?: (id: string) => void;
}

export function CronjobsListTable({
  items,
  selectedIds,
  onSelect,
  onSelectAll,
  onRunNow,
  onEdit,
  onClone,
  onDelete,
  onToggleEnabled,
  onViewDetails,
}: CronjobsListTableProps) {
  const list = items ?? [];
  const allSelected = list.length > 0 && selectedIds.size === list.length;

  return (
    <div className="overflow-x-auto rounded-lg border border-white/[0.03]">
      <table className="w-full text-sm" role="grid">
        <thead>
          <tr className="border-b border-white/[0.03] bg-secondary/50">
            <th className="sticky top-0 z-10 w-10 px-4 py-3 text-left">
              <Checkbox
                checked={allSelected}
                onCheckedChange={onSelectAll}
                aria-label="Select all"
              />
            </th>
            <th className="sticky top-0 z-10 px-4 py-3 text-left font-medium text-muted-foreground">
              Name
            </th>
            <th className="sticky top-0 z-10 w-16 px-4 py-3 text-left font-medium text-muted-foreground">
              Enabled
            </th>
            <th className="sticky top-0 z-10 px-4 py-3 text-left font-medium text-muted-foreground">
              Trigger
            </th>
            <th className="sticky top-0 z-10 px-4 py-3 text-left font-medium text-muted-foreground">
              Schedule
            </th>
            <th className="sticky top-0 z-10 px-4 py-3 text-left font-medium text-muted-foreground">
              Next Run
            </th>
            <th className="sticky top-0 z-10 px-4 py-3 text-left font-medium text-muted-foreground">
              Last Run
            </th>
            <th className="sticky top-0 z-10 px-4 py-3 text-left font-medium text-muted-foreground">
              Target
            </th>
            <th className="sticky top-0 z-10 px-4 py-3 text-left font-medium text-muted-foreground">
              Module
            </th>
            <th className="sticky top-0 z-10 px-4 py-3 text-left font-medium text-muted-foreground">
              Tags
            </th>
            <th className="sticky top-0 z-10 w-12 px-4 py-3" aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {(list ?? []).map((job) => (
            <tr
              key={job.id}
              className={cn(
                "border-b border-white/[0.03] transition-colors hover:bg-secondary/30",
                selectedIds.has(job.id) && "bg-primary/5"
              )}
            >
              <td className="px-4 py-3">
                <Checkbox
                  checked={selectedIds.has(job.id)}
                  onCheckedChange={() => onSelect(job.id)}
                  aria-label={`Select ${job.name}`}
                />
              </td>
              <td className="px-4 py-3">
                <Link
                  to={`/dashboard/cronjobs/${job.id}`}
                  className="font-medium text-foreground hover:underline"
                >
                  {job.name}
                </Link>
              </td>
              <td className="px-4 py-3">
                <Switch
                  checked={job.enabled}
                  onCheckedChange={() => onToggleEnabled(job.id, !job.enabled)}
                  aria-label={job.enabled ? "Disable" : "Enable"}
                />
              </td>
              <td className="px-4 py-3 text-muted-foreground capitalize">
                {job.triggerType ?? "—"}
              </td>
              <td className="px-4 py-3">
                <span className="font-mono text-xs text-muted-foreground">
                  {job.scheduleExpression ?? "—"}
                </span>
                <p className="text-xs text-muted-foreground">
                  {humanizeCron(job.scheduleExpression ?? "")}
                </p>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {job.nextRun
                  ? formatDistanceToNow(new Date(job.nextRun), { addSuffix: true })
                  : "—"}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <LastRunBadge status={job.lastRun?.status} />
                  {job.lastRun?.runId && (
                    <Link
                      to={
                        job.id
                          ? `/dashboard/cronjobs/${job.id}/runs/${job.lastRun!.runId}`
                          : `/dashboard/runs/${job.lastRun!.runId}`
                      }
                      className="text-xs text-primary hover:underline"
                    >
                      View
                    </Link>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {job.targetType}/{job.targetId || "—"}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{job.module ?? "—"}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {(job.tags ?? []).slice(0, 3).map((t) => (
                    <Badge key={t} variant="outline" className="text-xs">
                      {t}
                    </Badge>
                  ))}
                  {(job.tags ?? []).length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{(job.tags ?? []).length - 3}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
