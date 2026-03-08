/**
 * KPICard — Compact metric tile with optional trend.
 * Gradient background, icon, title, value, trend indicator; hover lift.
 */

import { type ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  className?: string;
}

export function KPICard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendLabel,
  className,
}: KPICardProps) {
  return (
    <Card
      className={cn(
        "card-health transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover",
        className
      )}
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
        {(subtitle != null || trend != null) && (
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            {subtitle != null && <span>{subtitle}</span>}
            {trend != null && (
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
                {trendLabel != null ? ` ${trendLabel}` : ""}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
