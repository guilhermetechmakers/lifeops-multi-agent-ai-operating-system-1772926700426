/**
 * ReminderBell — Visual indicator for upcoming reminders with snooze/dismiss.
 */

import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export interface ReminderBellProps {
  nextReminder?: string;
  enabled?: boolean;
  onToggle?: (enabled: boolean) => void;
  onSnooze?: () => void;
  className?: string;
}

function formatReminderTime(iso: string): string {
  try {
    const d = new Date(iso);
    return format(d, "HH:mm");
  } catch {
    return "";
  }
}

export function ReminderBell({
  nextReminder,
  enabled = true,
  onToggle,
  onSnooze,
  className,
}: ReminderBellProps) {
  const timeStr = nextReminder ? formatReminderTime(nextReminder) : "";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {timeStr && (
        <span className="text-xs text-muted-foreground" aria-label={`Next reminder at ${timeStr}`}>
          {timeStr}
        </span>
      )}
      {onToggle && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => onToggle(!enabled)}
          aria-label={enabled ? "Disable reminders" : "Enable reminders"}
        >
          {enabled ? (
            <Bell className="h-4 w-4 text-teal" aria-hidden />
          ) : (
            <BellOff className="h-4 w-4 text-muted-foreground" aria-hidden />
          )}
        </Button>
      )}
      {onSnooze && enabled && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={onSnooze}
          aria-label="Snooze reminder"
        >
          Snooze
        </Button>
      )}
    </div>
  );
}
