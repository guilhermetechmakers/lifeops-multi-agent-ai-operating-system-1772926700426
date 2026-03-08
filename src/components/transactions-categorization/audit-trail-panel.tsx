/**
 * AuditTrailPanel — Activity feed with actions, user, timestamp, rationale, revert option.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuditTrailEntry } from "@/types/finance";

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export interface AuditTrailPanelProps {
  logs: AuditTrailEntry[];
  onRevert?: (log: AuditTrailEntry) => void;
  entityType?: string;
  entityId?: string;
  className?: string;
}

export function AuditTrailPanel({
  logs,
  onRevert,
  className,
}: AuditTrailPanelProps) {
  const list = Array.isArray(logs) ? logs : [];
  const revertible = ["categorized", "bulk_categorized", "exception_added"];

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <History className="h-5 w-5 shrink-0" />
          Audit Trail
        </CardTitle>
      </CardHeader>
      <CardContent>
        {list.length === 0 ? (
          <div className="py-8 px-4 text-center">
            <History className="mx-auto h-10 w-10 text-muted-foreground mb-3" aria-hidden />
            <p className="text-sm font-medium text-foreground mb-1">No activity yet</p>
            <p className="text-sm text-muted-foreground">
              Categorization changes, rule edits, and exception actions will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {(list ?? []).map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-2 rounded-lg border border-white/[0.03] p-3 text-sm transition-colors hover:bg-secondary/30"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium">
                    {log.action.replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {log.details}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {log.actor} · {formatTimestamp(log.timestamp)}
                  </p>
                </div>
                {onRevert &&
                  revertible.includes(log.action) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs shrink-0"
                      onClick={() => onRevert(log)}
                    >
                      Revert
                    </Button>
                  )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
