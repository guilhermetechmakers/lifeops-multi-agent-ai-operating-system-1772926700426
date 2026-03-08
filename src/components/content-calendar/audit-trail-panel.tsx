/**
 * AuditTrailPanel — per-action logs and artifacts for scheduling.
 */

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { AuditLog } from "@/types/content-calendar";
import { format, parseISO } from "date-fns";

export interface AuditTrailPanelProps {
  logs: AuditLog[];
  isLoading?: boolean;
  className?: string;
}

export function AuditTrailPanel({
  logs,
  isLoading = false,
  className,
}: AuditTrailPanelProps) {
  const items = (logs ?? []).slice(0, 20);

  return (
    <div
      className={cn(
        "rounded-lg border border-[rgb(255_255_255/0.03)] bg-card p-4 shadow-card",
        className
      )}
      role="region"
      aria-label="Audit trail"
    >
      <h3 className="font-semibold text-foreground mb-4">Audit Trail</h3>
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-12 rounded bg-secondary/50 animate-pulse"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No audit entries yet. Scheduling actions will appear here.
        </p>
      ) : (
        <ScrollArea className="h-[200px] pr-2">
          <div className="space-y-2">
            {items.map((log) => (
              <div
                key={log.id}
                className="rounded border border-[rgb(255_255_255/0.03)] bg-secondary/30 px-3 py-2 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-foreground capitalize">
                    {log.action}
                  </span>
                  <span className="text-muted-foreground shrink-0">
                    {format(parseISO(log.createdAt), "MMM d, HH:mm")}
                  </span>
                </div>
                <p className="text-muted-foreground mt-0.5 line-clamp-2">
                  {log.details}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
