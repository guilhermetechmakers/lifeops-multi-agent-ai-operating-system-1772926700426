/**
 * Cross-Module Alerts: aggregated stream with severity, source, snooze/digest, drill-down.
 */

import { Link } from "react-router-dom";
import { AlertCircle, ChevronRight, BellOff, Inbox } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMasterAlerts, useDigestAlert, useSnoozeAlert } from "@/hooks/use-master-dashboard";
import type { MasterAlert, AlertSeverity } from "@/types/master-dashboard";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const SEVERITY_STYLES: Record<AlertSeverity, string> = {
  info: "bg-teal/20 text-teal",
  warning: "bg-amber/20 text-amber",
  critical: "bg-primary/20 text-primary",
  error: "bg-destructive/20 text-destructive",
};

const MODULE_ROUTES: Record<string, string> = {
  cronjobs: "/dashboard/cronjobs",
  finance: "/dashboard/finance",
  content: "/dashboard/content",
  health: "/dashboard/health",
  projects: "/dashboard/projects",
};

function getDrillDownUrl(alert: MasterAlert): string {
  return MODULE_ROUTES[alert.sourceModule] ?? "/dashboard";
}

export function CrossModuleAlertsPanel() {
  const { items: alerts, isLoading } = useMasterAlerts();
  const digestAlert = useDigestAlert();
  const snoozeAlert = useSnoozeAlert();

  const list = alerts ?? [];

  const handleDigest = (id: string) => {
    digestAlert.mutate(id);
  };

  const handleSnooze = (id: string) => {
    const until = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    snoozeAlert.mutate({ id, until });
  };

  if (isLoading) {
    return (
      <Card className="border-white/[0.03] bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Cross-module alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-md" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/[0.03] bg-card transition-all duration-200 hover:shadow-card-hover">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Cross-module alerts
        </CardTitle>
        {list.length > 0 && (
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="text-xs">
              View all
            </Button>
          </Link>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-3">Recent anomalies & outcomes</p>
        {list.length === 0 ? (
          <div className="rounded-md border border-white/[0.03] bg-secondary/30 px-4 py-6 text-center text-sm text-muted-foreground">
            No active alerts.
          </div>
        ) : (
          <ul className="space-y-2" role="list">
            {(list ?? []).map((alert) => (
              <li
                key={alert.id}
                className="rounded-md border border-white/[0.03] bg-secondary/30 px-3 py-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={cn(
                          "inline-block h-2 w-2 rounded-full shrink-0",
                          alert.severity === "info" && "bg-teal",
                          alert.severity === "warning" && "bg-amber",
                          alert.severity === "critical" && "bg-primary",
                          alert.severity === "error" && "bg-destructive"
                        )}
                        aria-hidden
                      />
                      <Badge
                        variant="secondary"
                        className={cn("text-xs", SEVERITY_STYLES[alert.severity])}
                      >
                        {alert.severity}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground mt-1 truncate">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">{alert.sourceModule}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {alert.digestible && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDigest(alert.id)}
                        disabled={digestAlert.isPending}
                        aria-label="Add to digest"
                        title="Add to digest"
                      >
                        <Inbox className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleSnooze(alert.id)}
                      disabled={snoozeAlert.isPending}
                      aria-label="Snooze"
                      title="Snooze 24h"
                    >
                      <BellOff className="h-4 w-4" />
                    </Button>
                    <Link to={getDrillDownUrl(alert)}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ChevronRight className="h-4 w-4" aria-hidden />
                        <span className="sr-only">Drill down</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
