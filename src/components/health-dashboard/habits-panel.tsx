/**
 * HabitsPanel — Active habits, streaks, upcoming reminders, coaching interventions.
 * Start/stop reminders, manual update, view coach note.
 */

import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Bell, MessageSquare, ArrowRight } from "lucide-react";
import type { Habit } from "@/types/health";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export interface HabitsPanelProps {
  habits: Habit[];
  onToggleReminder?: (habitId: string, enabled: boolean) => void;
  isLoading?: boolean;
  className?: string;
}

function formatReminder(iso: string): string {
  try {
    const d = new Date(iso);
    return format(d, "HH:mm");
  } catch {
    return "";
  }
}

export function HabitsPanel({
  habits = [],
  onToggleReminder,
  isLoading,
  className,
}: HabitsPanelProps) {
  const items = Array.isArray(habits) ? habits : [];

  if (isLoading) {
    return (
      <Card className={cn("card-health border-white/[0.03]", className)}>
        <CardHeader className="pb-2">
          <div className="h-4 w-24 animate-pulse rounded bg-secondary/50" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded bg-secondary/30" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className={cn("card-health border-white/[0.03]", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Habits
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Track habits, streaks, and receive coaching interventions
          </p>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" asChild>
            <Link to="/dashboard/health/habits">
              Add first habit
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("card-health border-white/[0.03]", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Habits
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Streaks and reminders
          </p>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/dashboard/health/habits">
            View all
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((habit) => (
          <div
            key={habit?.id ?? ""}
            className="flex items-center justify-between gap-3 rounded-md border border-white/[0.03] bg-secondary/20 p-3 transition-colors hover:bg-secondary/30"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground truncate">{habit?.name ?? ""}</p>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {habit?.streak ?? 0} day streak
                </Badge>
                {habit?.nextReminder && (
                  <span className="text-xs text-muted-foreground">
                    Next: {formatReminder(habit.nextReminder)}
                  </span>
                )}
              </div>
              {(habit?.coachInterventions ?? []).length > 0 && (
                <div className="mt-2 flex items-center gap-1 text-xs text-teal">
                  <MessageSquare className="h-3 w-3" />
                  {(habit.coachInterventions ?? [])[0]}
                </div>
              )}
            </div>
            {onToggleReminder && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => onToggleReminder(habit?.id ?? "", false)}
                aria-label="Toggle reminder"
              >
                <Bell className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
