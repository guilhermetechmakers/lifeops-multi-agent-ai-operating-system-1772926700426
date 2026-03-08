/**
 * AnomaliesPanel — Real-time anomaly alerts with severity.
 * Agent-provided rationale, suggested remediation, acknowledgement actions.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Anomaly } from "@/types/finance";

function getSeverityBadge(severity: string) {
  switch (severity) {
    case "high":
      return { variant: "destructive" as const, label: "High" };
    case "medium":
      return { variant: "warning" as const, label: "Medium" };
    default:
      return { variant: "secondary" as const, label: "Low" };
  }
}

interface AnomaliesPanelProps {
  anomalies: Anomaly[];
  isLoading?: boolean;
  onAcknowledge?: (id: string) => void;
  className?: string;
}

export function AnomaliesPanel({
  anomalies,
  isLoading,
  onAcknowledge,
  className,
}: AnomaliesPanelProps) {
  const items = Array.isArray(anomalies) ? anomalies : [];
  const openItems = items.filter((a) => a.status === "open");

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <AlertTriangle className="h-5 w-5 text-amber" />
          Anomaly Alerts
          {openItems.length > 0 && (
            <Badge variant="destructive" className="text-xs">
              {openItems.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-secondary" />
            ))}
          </div>
        ) : openItems.length === 0 ? (
          <div className="py-8 text-center">
            <CheckCircle className="mx-auto h-10 w-10 text-teal mb-4" />
            <p className="text-sm text-muted-foreground">No anomalies detected</p>
          </div>
        ) : (
          <div className="space-y-3">
            {openItems.map((a) => {
              const badge = getSeverityBadge(a.severity ?? "low");
              return (
                <div
                  key={a.id}
                  className="rounded-lg border border-white/[0.03] bg-secondary/30 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant={badge.variant} className="text-[10px] shrink-0">
                      {badge.label}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => onAcknowledge?.(a.id)}
                    >
                      Acknowledge
                    </Button>
                  </div>
                  <p className="mt-2 text-sm text-foreground">{a.rationale ?? "—"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Detected by: {a.detectedBy ?? "—"}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
