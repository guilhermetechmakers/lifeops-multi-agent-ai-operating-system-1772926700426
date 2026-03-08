/**
 * PerformanceHealthIndicators — throughput, latency, retries, safety warnings.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Clock, RefreshCw, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PerformanceHealthIndicatorsProps {
  messageCount?: number;
  durationMs?: number;
  retryCount?: number;
  safetyWarnings?: string[];
  className?: string;
}

export function PerformanceHealthIndicators({
  messageCount = 0,
  durationMs = 0,
  retryCount = 0,
  safetyWarnings = [],
  className,
}: PerformanceHealthIndicatorsProps) {
  const safeWarnings = Array.isArray(safetyWarnings) ? safetyWarnings : [];
  const throughput = durationMs > 0 && messageCount > 0
    ? (messageCount / (durationMs / 1000)).toFixed(1)
    : "—";
  const avgLatency = messageCount > 0 && durationMs > 0
    ? `${(durationMs / messageCount).toFixed(0)}ms`
    : "—";

  return (
    <Card className={cn("rounded-lg border-white/[0.03] bg-card", className)}>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-medium">Performance & Health</CardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">
          Throughput, latency, retries, and safety
        </p>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 rounded-md border border-white/[0.03] bg-secondary/30 px-3 py-2">
            <Activity className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Throughput</p>
              <p className="text-sm font-medium">{throughput} msg/s</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-white/[0.03] bg-secondary/30 px-3 py-2">
            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Avg latency</p>
              <p className="text-sm font-medium">{avgLatency}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-white/[0.03] bg-secondary/30 px-3 py-2">
            <RefreshCw className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Retries</p>
              <p className={cn(
                "text-sm font-medium",
                retryCount > 0 ? "text-amber" : "text-foreground"
              )}>
                {retryCount}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-white/[0.03] bg-secondary/30 px-3 py-2">
            <ShieldAlert className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Safety</p>
              <p className={cn(
                "text-sm font-medium",
                safeWarnings.length > 0 ? "text-amber" : "text-teal"
              )}>
                {safeWarnings.length > 0 ? safeWarnings.length : "OK"}
              </p>
            </div>
          </div>
        </div>
        {safeWarnings.length > 0 && (
          <ul className="space-y-1">
            {safeWarnings.slice(0, 3).map((w, i) => (
              <li key={i} className="text-xs text-amber flex items-start gap-1">
                <ShieldAlert className="h-3 w-3 shrink-0 mt-0.5" />
                {w}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
