/**
 * NotificationsTray — Agent coaching interventions and important health prompts.
 * Acknowledge, snooze.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Clock } from "lucide-react";
import type { Intervention } from "@/types/health";
import { cn } from "@/lib/utils";

export interface NotificationsTrayProps {
  interventions: Intervention[];
  alerts?: Intervention[];
  onAcknowledge?: (id: string) => void;
  onSnooze?: (id: string) => void;
  isLoading?: boolean;
  className?: string;
}

export function NotificationsTray({
  interventions = [],
  alerts = [],
  onAcknowledge,
  onSnooze,
  isLoading,
  className,
}: NotificationsTrayProps) {
  const items = [
    ...(Array.isArray(interventions) ? interventions : []),
    ...(Array.isArray(alerts) ? alerts : []),
  ].filter((i) => !i?.acknowledged);

  if (isLoading) {
    return (
      <Card className={cn("card-health border-white/[0.03]", className)}>
        <CardHeader className="pb-2">
          <div className="h-4 w-32 animate-pulse rounded bg-secondary/50" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-secondary/30" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className={cn("card-health border-white/[0.03]", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No new interventions or alerts.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("card-health border-white/[0.03]", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div
            key={item?.id ?? ""}
            className="flex items-start justify-between gap-2 rounded-md border border-white/[0.03] bg-secondary/30 p-3"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm text-foreground">{item?.message ?? ""}</p>
              <span
                className={cn(
                  "mt-1 inline-block text-xs",
                  item?.type === "coaching" && "text-teal",
                  item?.type === "alert" && "text-amber",
                  item?.type === "reminder" && "text-purple"
                )}
              >
                {item?.type ?? "notification"}
              </span>
            </div>
            <div className="flex shrink-0 gap-1">
              {onAcknowledge && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onAcknowledge(item?.id ?? "")}
                  aria-label="Acknowledge"
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
              {onSnooze && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onSnooze(item?.id ?? "")}
                  aria-label="Snooze"
                >
                  <Clock className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
