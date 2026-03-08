/**
 * KPIWidget — Compact metric tile with delta, trend, tooltip.
 * Gradient background, icon, title, value, trend indicator; hover lift.
 */

import { type ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface KPIWidgetProps {
  title: string;
  value: string | number;
  delta?: number;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  tooltip?: string;
  icon?: ReactNode;
  className?: string;
}

export function KPIWidget({
  title,
  value,
  delta,
  trend,
  trendLabel,
  tooltip,
  icon,
  className,
}: KPIWidgetProps) {
  return (
    <Card
      className={cn(
        "card-health transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover",
        className
      )}
      title={tooltip}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        {icon != null && (
          <span className="text-muted-foreground" aria-hidden>
            {icon}
          </span>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-foreground">{value}</div>
        {(trend != null || trendLabel != null || delta != null) && (
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            {delta != null && (
              <span
                className={cn(
                  "font-medium",
                  trend === "up" && "text-teal",
                  trend === "down" && "text-destructive",
                  trend === "neutral" && "text-muted-foreground"
                )}
              >
                {trend === "up" && "↑"}
                {trend === "down" && "↓"}
                {delta >= 0 ? `+${delta}%` : `${delta}%`}
              </span>
            )}
            {trendLabel != null && <span>{trendLabel}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
