/**
 * AuditTrailPane — Global or per-item run history with logs, diffs, traces, artifacts.
 * Uses AuditTrailEntry from finance types when entries are from API.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuditTrailEntry } from "@/types/finance";

interface AuditTrailPaneProps {
  runId?: string | null;
  entries?: AuditTrailEntry[];
  isLoading?: boolean;
  className?: string;
}

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function AuditTrailPane({
  runId,
  entries = [],
  isLoading,
  className,
}: AuditTrailPaneProps) {
  const data = Array.isArray(entries) ? entries : [];

  return (
    <Card className={cn("border-white/[0.03] bg-card transition-shadow duration-200 hover:shadow-card", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <History className="h-5 w-5 text-muted-foreground" />
          Audit Trail
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {runId ? `Run: ${runId}` : "Recent activity"}
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-secondary" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="py-8 text-center">
            <History className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">No audit entries</p>
            <p className="text-xs text-muted-foreground mt-1">Actions will appear here</p>
          </div>
        ) : (
          <ScrollArea className="h-[200px]">
            <div className="space-y-2 pr-4">
              {data.map((e) => (
                <div
                  key={e.id}
                  className="rounded-lg border border-white/[0.03] p-2 text-sm"
                >
                  <p className="font-medium">{e.action ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatTimestamp(e.timestamp ?? "")}
                    {e.actor ? ` · ${e.actor}` : ""}
                    {(e.entityType ?? e.entityId) && (
                      <span> · {[e.entityType, e.entityId].filter(Boolean).join(" ")}</span>
                    )}
                  </p>
                  {e.details && (
                    <p className="mt-1 text-xs text-muted-foreground truncate">{e.details}</p>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
