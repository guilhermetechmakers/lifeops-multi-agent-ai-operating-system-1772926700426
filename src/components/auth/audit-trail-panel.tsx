/**
 * AuditTrailPanel — Shared component for auth events, admin actions, and run artifacts.
 * Used in profile Security panel and admin user management.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Shield } from "lucide-react";
import { useAuthEvents, type AuthEvent } from "@/hooks/use-auth-events";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export interface AuditTrailPanelProps {
  /** Scope to current user only when true */
  currentUserOnly?: boolean;
  /** Max items to show */
  limit?: number;
  className?: string;
}

export function AuditTrailPanel({
  currentUserOnly = true,
  limit = 10,
  className,
}: AuditTrailPanelProps) {
  const { events = [], isLoading } = useAuthEvents({
    currentUserOnly,
    limit,
  });

  const eventList: AuthEvent[] = Array.isArray(events) ? events : [];

  return (
    <Card
      className={cn(
        "border-white/[0.03] bg-card transition-shadow duration-200 hover:shadow-card-hover",
        className
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base text-foreground">
          <Shield className="h-4 w-4 text-muted-foreground" aria-hidden />
          Recent auth events
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Login, logout, password changes, 2FA, and session activity
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {(Array.from({ length: 3 }) ?? []).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : eventList.length === 0 ? (
          <div
            className="rounded-lg border border-white/[0.03] bg-secondary/20 px-4 py-6 text-center text-sm text-muted-foreground"
            role="status"
          >
            No auth events yet
          </div>
        ) : (
          <div className="space-y-2 max-h-[240px] overflow-y-auto">
            {(eventList ?? []).map((entry) => (
              <div
                key={entry?.id ?? ""}
                className="flex items-center justify-between rounded-lg border border-white/[0.03] bg-secondary/30 px-3 py-2 text-sm transition-colors hover:bg-secondary/50"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  <span className="font-medium truncate">{entry?.action ?? "—"}</span>
                  {entry?.resource && (
                    <span className="text-muted-foreground truncate">· {entry.resource}</span>
                  )}
                </div>
                <span className="text-micro text-muted-foreground shrink-0 ml-2">
                  {entry?.timestamp
                    ? formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })
                    : "—"}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
