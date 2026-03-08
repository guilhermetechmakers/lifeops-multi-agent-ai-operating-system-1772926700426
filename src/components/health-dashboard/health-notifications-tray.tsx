/**
 * HealthNotificationsTray — Agent coaching interventions and health prompts.
 * Acknowledge, snooze.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, MessageCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HealthIntervention } from "@/types/health";

export interface HealthNotificationsTrayProps {
  interventions?: HealthIntervention[] | null;
  alerts?: HealthIntervention[] | null;
  isLoading?: boolean;
  onAcknowledge?: (id: string) => void;
  onSnooze?: (id: string) => void;
  className?: string;
}

function getIcon(type: HealthIntervention["type"]) {
  switch (type) {
    case "coaching":
      return MessageCircle;
    case "alert":
      return AlertTriangle;
    default:
      return Bell;
  }
}

export function HealthNotificationsTray({
  interventions = [],
  alerts = [],
  onAcknowledge,
  onSnooze,
  isLoading,
  className,
}: HealthNotificationsTrayProps) {
  const safeInterventions = Array.isArray(interventions) ? interventions : [];
  const safeAlerts = Array.isArray(alerts) ? alerts : [];
  const items = [...safeInterventions, ...safeAlerts].slice(0, 5);

  if (isLoading) {
    return (
      <Card className={cn("border-white/[0.03] bg-card", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Bell className="h-5 w-5 text-muted-foreground" aria-hidden />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-secondary" aria-hidden />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) return null;

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Bell className="h-5 w-5 text-muted-foreground" aria-hidden />
          Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map((n) => {
            const Icon = getIcon(n.type ?? "reminder");
            return (
              <div
                key={n.id}
                className="flex items-start gap-3 rounded-lg border border-white/[0.03] p-3 transition-colors hover:bg-secondary/30"
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 mt-0.5",
                    n.type === "alert" && "text-amber",
                    n.type === "coaching" && "text-teal"
                  )}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{n.title ?? "—"}</p>
                  {n.message && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{n.message}</p>
                  )}
                  <div className="mt-2 flex gap-2">
                    {onAcknowledge && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => onAcknowledge(n.id)}
                      >
                        Acknowledge
                      </Button>
                    )}
                    {onSnooze && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-muted-foreground"
                        onClick={() => onSnooze(n.id)}
                      >
                        Snooze
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
