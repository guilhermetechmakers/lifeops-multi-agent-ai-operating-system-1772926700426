/**
 * HabitCard — Shows habit name, icon, next reminder, streak, last check-in, status chips.
 * Quick actions: check-in, snooze, edit.
 */

import { Pencil, Check, MoreVertical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StreakBadge } from "./streak-badge";
import { ReminderBell } from "./reminder-bell";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Habit } from "@/types/health";

const HABIT_ICONS: Record<string, string> = {
  meditation: "🧘",
  journal: "📝",
  exercise: "💪",
  read: "📖",
  sleep: "😴",
  water: "💧",
  default: "✓",
};

function getHabitIcon(habit: Habit): string {
  const name = (habit?.name ?? "").toLowerCase();
  if (name.includes("meditation")) return HABIT_ICONS.meditation;
  if (name.includes("journal")) return HABIT_ICONS.journal;
  if (name.includes("exercise") || name.includes("workout")) return HABIT_ICONS.exercise;
  if (name.includes("read")) return HABIT_ICONS.read;
  if (name.includes("sleep")) return HABIT_ICONS.sleep;
  if (name.includes("water")) return HABIT_ICONS.water;
  return habit?.icon ?? HABIT_ICONS.default;
}

export interface HabitCardProps {
  habit: Habit;
  onCheckIn?: (habitId: string) => void;
  onEdit?: (habit: Habit) => void;
  onDelete?: (habitId: string) => void;
  onToggleReminder?: (habitId: string, enabled: boolean) => void;
  onSnooze?: (habitId: string) => void;
  isCheckedToday?: boolean;
  className?: string;
}

export function HabitCard({
  habit,
  onCheckIn,
  onEdit,
  onDelete,
  onToggleReminder,
  onSnooze,
  isCheckedToday = false,
  className,
}: HabitCardProps) {
  const id = habit?.id ?? "";
  const name = habit?.name ?? "";
  const streak = habit?.streak ?? 0;
  const nextReminder = habit?.nextReminder;
  const coachInterventions = habit?.coachInterventions ?? [];
  const lastCheckIn = habit?.lastCheckInDate;

  return (
    <Card
      className={cn(
        "card-health border-white/[0.03] transition-all duration-200",
        "hover:shadow-card-hover",
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/50 text-lg"
                aria-hidden
              >
                {getHabitIcon(habit)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground truncate">{name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <StreakBadge streak={streak} />
                  <ReminderBell
                    nextReminder={nextReminder}
                    enabled={true}
                    onToggle={onToggleReminder ? () => onToggleReminder(id, false) : undefined}
                    onSnooze={onSnooze ? () => onSnooze(id) : undefined}
                  />
                </div>
                {lastCheckIn && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Last: {format(new Date(lastCheckIn), "MMM d")}
                  </p>
                )}
                {coachInterventions.length > 0 && (
                  <p className="mt-2 text-xs text-teal">
                    {coachInterventions[0]}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {onCheckIn && (
              <Button
                variant={isCheckedToday ? "secondary" : "default"}
                size="sm"
                className="h-8"
                onClick={() => onCheckIn(id)}
                aria-label={isCheckedToday ? "Already checked in" : "Check in"}
                disabled={isCheckedToday}
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="More actions">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(habit)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(id)}
                    className="text-destructive focus:text-destructive"
                  >
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
