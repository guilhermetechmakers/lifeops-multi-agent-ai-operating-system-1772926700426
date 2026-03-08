/**
 * StreakBadge — Visual indicator for habit streak count.
 */

import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StreakBadgeProps {
  streak: number;
  className?: string;
}

export function StreakBadge({ streak = 0, className }: StreakBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        streak > 0
          ? "bg-amber/20 text-amber"
          : "bg-muted text-muted-foreground",
        className
      )}
      aria-label={`${streak} day streak`}
    >
      <Flame className="h-3 w-3 shrink-0" aria-hidden />
      {streak}
    </span>
  );
}
