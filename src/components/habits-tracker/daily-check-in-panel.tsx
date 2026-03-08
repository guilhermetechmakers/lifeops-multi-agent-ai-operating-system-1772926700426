/**
 * DailyCheckInPanel — Quick toggle for complete/incomplete and optional notes.
 * Props: habitId, date, onSubmitNote. Guards for null/undefined.
 */

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Check, MessageSquare, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DailyCheckInPanelProps {
  habitId: string;
  habitName?: string;
  date: string;
  onSubmitNote?: (habitId: string, date: string, completed: boolean, notes?: string) => void;
  onClose?: () => void;
  initialCompleted?: boolean;
  initialNotes?: string;
  isPending?: boolean;
  className?: string;
}

export function DailyCheckInPanel({
  habitId,
  habitName,
  date,
  onSubmitNote,
  onClose,
  initialCompleted = false,
  initialNotes = "",
  isPending = false,
  className,
}: DailyCheckInPanelProps) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [notes, setNotes] = useState(initialNotes ?? "");

  const handleSubmit = useCallback(() => {
    if (!habitId || !date) return;
    onSubmitNote?.(habitId, date, completed, notes.trim() || undefined);
  }, [habitId, date, completed, notes, onSubmitNote]);

  const canSubmit = Boolean(habitId && date && onSubmitNote);

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-4 w-4" />
            Daily check-in
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {habitName ? `${habitName} — ` : ""}
            Mark complete and add optional notes for {date}.
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCompleted((c) => !c)}
            className={cn(
              "flex h-10 min-w-[44px] items-center justify-center rounded-md border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
              completed
                ? "border-teal bg-teal/20 text-teal"
                : "border-input bg-transparent text-muted-foreground hover:bg-secondary"
            )}
            aria-pressed={completed}
            aria-label={completed ? "Marked complete" : "Mark complete"}
          >
            <Check className="h-5 w-5" />
          </button>
          <span className="text-sm text-foreground">
            {completed ? "Done for today" : "Mark as complete"}
          </span>
        </div>
        <div className="space-y-2">
          <Label htmlFor="checkin-notes">Notes (optional)</Label>
          <textarea
            id="checkin-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value ?? "")}
            placeholder="Quick note…"
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            aria-label="Check-in notes"
          />
        </div>
        {canSubmit && (
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isPending}
            aria-label="Save check-in"
          >
            {isPending ? "Saving…" : "Save check-in"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
