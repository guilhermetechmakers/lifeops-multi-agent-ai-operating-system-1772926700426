/**
 * AuditTrailPanel — Actionable audit trail for subscription changes
 * and billing connector modifications; diffs and run artifacts.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuditTrailSubscription } from "@/types/finance";

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

function formatChanges(changes: Record<string, unknown>): string {
  const entries = Object.entries(changes ?? {});
  if (entries.length === 0) return "";
  return entries
    .map(([k, v]) => {
      if (v && typeof v === "object" && "from" in v && "to" in v) {
        const o = v as { from?: unknown; to?: unknown };
        return `${k}: ${String(o.from)} → ${String(o.to)}`;
      }
      return `${k}: ${String(v)}`;
    })
    .join("; ");
}

export interface AuditTrailPanelProps {
  entries?: AuditTrailSubscription[];
  /** Alias for entries */
  items?: AuditTrailSubscription[];
  isLoading?: boolean;
  maxHeight?: number;
  className?: string;
}

export function AuditTrailPanel({
  entries = [],
  items: itemsProp,
  isLoading,
  maxHeight = 200,
  className,
}: AuditTrailPanelProps) {
  const fromItems = Array.isArray(itemsProp) ? itemsProp : [];
  const fromEntries = Array.isArray(entries) ? entries : [];
  const data = fromItems.length > 0 ? fromItems : fromEntries;

  return (
    <Card
      className={cn(
        "border-white/[0.03] bg-card transition-shadow duration-200 hover:shadow-card",
        className
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <History className="h-5 w-5 text-muted-foreground" aria-hidden />
          Audit trail
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Subscription and connector changes
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded bg-secondary"
                aria-hidden
              />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="py-8 text-center">
            <History
              className="mx-auto h-10 w-10 text-muted-foreground mb-4"
              aria-hidden
            />
            <p className="text-sm text-muted-foreground">No audit entries</p>
            <p className="text-xs text-muted-foreground mt-1">
              Actions will appear here
            </p>
          </div>
        ) : (
          <ScrollArea style={{ height: maxHeight }}>
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
                    {e.entityId ? ` · ${e.entityId}` : ""}
                  </p>
                  {Object.keys(e.changes ?? {}).length > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatChanges(e.changes ?? {})}
                    </p>
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
