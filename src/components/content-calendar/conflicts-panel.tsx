/**
 * ConflictsPanel — side panel listing conflicts with severity badges and actions.
 */

import { AlertTriangle, Calendar, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Conflict } from "@/types/content-calendar";
import { format, parseISO } from "date-fns";

const SEVERITY_STYLES: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-amber/20 text-amber",
  high: "bg-destructive/20 text-destructive",
};

export interface ConflictsPanelProps {
  conflicts: Conflict[];
  channels?: { id: string; name: string }[];
  onReschedule?: (conflict: Conflict) => void;
  onReassign?: (conflict: Conflict) => void;
  onApprove?: (conflict: Conflict) => void;
  className?: string;
}

export function ConflictsPanel({
  conflicts,
  channels = [],
  onReschedule,
  onReassign,
  onApprove,
  className,
}: ConflictsPanelProps) {
  const channelMap = new Map(channels.map((c) => [c.id, c.name]));
  const sorted = [...(conflicts ?? [])].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return (order[a.severity] ?? 2) - (order[b.severity] ?? 2);
  });

  return (
    <div
      className={cn(
        "rounded-lg border border-[rgb(255_255_255/0.03)] bg-card p-4 shadow-card",
        className
      )}
      role="region"
      aria-label="Scheduling conflicts"
    >
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-amber" />
        <h3 className="font-semibold text-foreground">Conflicts</h3>
        {sorted.length > 0 && (
          <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-destructive/20 text-destructive">
            {sorted.length}
          </span>
        )}
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No conflicts detected. All slots are within capacity.
        </p>
      ) : (
        <ScrollArea className="h-[280px] pr-2">
          <div className="space-y-3">
            {sorted.map((conflict) => {
              const channelName = channelMap.get(conflict.channelId) ?? conflict.channelId;
              const slotStr = `${format(parseISO(conflict.slotStart), "MMM d, HH:mm")} – ${format(parseISO(conflict.slotEnd), "HH:mm")}`;
              const severityStyle = SEVERITY_STYLES[conflict.severity] ?? SEVERITY_STYLES.low;

              return (
                <div
                  key={conflict.id}
                  className="rounded-lg border border-[rgb(255_255_255/0.03)] bg-secondary/50 p-3 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "text-[10px] font-medium px-1.5 py-0.5 rounded uppercase",
                        severityStyle
                      )}
                    >
                      {conflict.severity}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {channelName}
                    </span>
                  </div>
                  <p className="text-xs text-foreground">
                    {conflict.itemIds.length} items overlap at {slotStr}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {onReschedule && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => onReschedule(conflict)}
                      >
                        <Calendar className="h-3 w-3 mr-1" />
                        Reschedule
                      </Button>
                    )}
                    {onReassign && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => onReassign(conflict)}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Reassign
                      </Button>
                    )}
                    {onApprove && conflict.severity !== "high" && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => onApprove(conflict)}
                      >
                        Approve
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
