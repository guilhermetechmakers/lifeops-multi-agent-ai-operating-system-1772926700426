/**
 * HabitHistoryView — Calendar heatmap or streak timeline for a habit.
 * Props: habitId, range, data. Visual: calendar with hover tooltips; range selectors.
 * All array operations guarded.
 */

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useHabitHistory } from "@/hooks/use-habits-tracker";
import { cn } from "@/lib/utils";
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  parseISO,
} from "date-fns";

export interface HabitHistoryViewProps {
  habitId: string;
  habitName?: string;
  /** Optional list of habits for habit selector. */
  habits?: Array<{ id: string; name: string }>;
  /** Date range for history: from (inclusive) and to (inclusive). */
  range?: { from: string; to: string };
  /** Optional pre-loaded data; if not provided, uses useHabitHistory(habitId, range). */
  data?: Array<{ date: string; completed: boolean; notes?: string }>;
  onRangeChange?: (range: { from: string; to: string }) => void;
  onHabitChange?: (habitId: string) => void;
  isLoading?: boolean;
  className?: string;
}

const DEFAULT_DAYS = 30;

function getDefaultRange(): { from: string; to: string } {
  const to = new Date();
  const from = subDays(to, DEFAULT_DAYS - 1);
  return {
    from: format(from, "yyyy-MM-dd"),
    to: format(to, "yyyy-MM-dd"),
  };
}

export function HabitHistoryView({
  habitId,
  habitName: _habitName,
  habits,
  range: rangeProp,
  data: dataProp,
  onRangeChange: _onRangeChange,
  onHabitChange,
  isLoading: isLoadingProp,
  className,
}: HabitHistoryViewProps) {
  const range = useMemo(() => {
    if (rangeProp?.from && rangeProp?.to) return rangeProp;
    return getDefaultRange();
  }, [rangeProp?.from, rangeProp?.to]);

  const { history, isLoading } = useHabitHistory(habitId, range);
  const data = Array.isArray(dataProp) ? dataProp : (history ?? []);
  const isLoadingResolved = isLoadingProp ?? isLoading;
  const safeData = data ?? [];

  const completionMap = useMemo(() => {
    const map = new Map<string, boolean>();
    (safeData as Array<{ date: string; completed: boolean }>).forEach((d) => {
      if (d?.date != null) map.set(d.date, !!d.completed);
    });
    return map;
  }, [safeData]);

  const monthStart = startOfMonth(parseISO(range.from));
  const monthEnd = endOfMonth(parseISO(range.to));
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  if (!habitId) {
    return (
      <Card className={cn("border-white/[0.03] bg-card", className)}>
        <CardContent className="flex min-h-[200px] items-center justify-center p-6">
          <p className="text-sm text-muted-foreground">Select a habit to view history.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="h-4 w-4" />
          History &amp; streaks
        </CardTitle>
        <div className="flex items-center gap-2">
          {Array.isArray(habits) && habits.length > 1 && onHabitChange && (
            <Select value={habitId} onValueChange={onHabitChange}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Select habit" />
              </SelectTrigger>
              <SelectContent>
                {habits.map((h) => (
                  <SelectItem key={h?.id ?? ""} value={h?.id ?? ""}>
                    {h?.name ?? ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Previous period" disabled>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[120px] text-center text-sm text-muted-foreground">
            {format(monthStart, "MMM yyyy")}
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Next period" disabled>
            <ChevronRight className="h-4 w-4" />
          </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoadingResolved ? (
          <div className="grid grid-cols-7 gap-1" aria-busy="true">
            {Array.from({ length: 35 }, (_, i) => (
              <div key={i} className="h-8 animate-pulse rounded bg-secondary/30" />
            ))}
          </div>
        ) : (
          <div
            className="grid grid-cols-7 gap-1"
            role="grid"
            aria-label="Habit completion calendar"
          >
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div
                key={d}
                className="text-center text-xs text-muted-foreground"
                role="columnheader"
              >
                {d}
              </div>
            ))}
            {days.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const completed = completionMap.get(dateStr) ?? false;
              const inRange =
                dateStr >= range.from && dateStr <= range.to;
              if (!inRange && !isSameMonth(day, monthStart)) return null;
              return (
                <div
                  key={dateStr}
                  className={cn(
                    "flex h-8 w-full items-center justify-center rounded text-xs",
                    completed ? "bg-teal/30 text-teal" : "bg-secondary/20 text-muted-foreground",
                    isToday(day) && "ring-1 ring-teal"
                  )}
                  title={`${dateStr}: ${completed ? "Done" : "Not done"}`}
                  role="gridcell"
                >
                  {format(day, "d")}
                </div>
              );
            })}
          </div>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          Green = completed. Hover for date details.
        </p>
      </CardContent>
    </Card>
  );
}
