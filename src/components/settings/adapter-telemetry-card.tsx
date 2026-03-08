/**
 * Adapter telemetry card: recent runs/tests with latency and success.
 * Uses useAdaptersTelemetry; guards all arrays.
 */

import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdaptersTelemetry } from "@/hooks/use-adapters";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

export function AdapterTelemetryCard() {
  const { items: events, isLoading } = useAdaptersTelemetry();
  const list = events ?? [];
  const recent = list.slice(0, 8);

  if (isLoading) {
    return (
      <Card className="border-white/[0.03] bg-card">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/[0.03] bg-card transition-all duration-200 hover:shadow-card-hover">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Adapter activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity</p>
        ) : (
          <ul className="space-y-2">
            {recent.map((ev) => (
              <li
                key={ev.id}
                className="flex items-center justify-between text-sm rounded-md px-2 py-1.5 bg-secondary/50"
              >
                <span className="text-foreground truncate">
                  {ev.eventType} · {ev.adapterId}
                </span>
                <span className="shrink-0 flex items-center gap-2">
                  <span
                    className={
                      ev.success
                        ? "text-teal"
                        : "text-destructive"
                    }
                  >
                    {ev.success ? "OK" : "Fail"}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {ev.latencyMs}ms
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {formatDistanceToNow(new Date(ev.timestamp), { addSuffix: true })}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
