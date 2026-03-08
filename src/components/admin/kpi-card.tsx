/**
 * KPICard — Compact metric tile with trend indicator.
 * Gradient background, icon, title, value, optional comparison.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface KPICardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  className?: string;
}

export function KPICard({ title, value, icon: Icon, trend, trendLabel, className }: KPICardProps) {
  return (
    <Card
      className={cn(
        "border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(0,0,0,0.6)]",
        className
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {Icon && <Icon className="h-4 w-4" aria-hidden />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {trendLabel && (
          <p
            className={cn(
              "mt-1 text-xs",
              trend === "up" && "text-teal",
              trend === "down" && "text-[#FF3B30]",
              trend === "neutral" && "text-muted-foreground"
            )}
          >
            {trendLabel}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
