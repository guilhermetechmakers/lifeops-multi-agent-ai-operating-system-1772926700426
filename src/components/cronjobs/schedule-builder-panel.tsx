/**
 * Schedule Builder: presets, cron expression input, timezone, next-run preview.
 */

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CRON_PRESETS,
  getNextRunPreview,
  formatNextRun,
} from "@/lib/cron-utils";
import { Clock } from "lucide-react";

const TIMEZONES = ["UTC", "America/New_York", "America/Los_Angeles", "Europe/London", "Europe/Paris", "Asia/Tokyo"];

export interface ScheduleBuilderValue {
  expression: string;
  timezone: string;
}

interface ScheduleBuilderPanelProps {
  value: ScheduleBuilderValue;
  onChange: (v: ScheduleBuilderValue) => void;
  className?: string;
  showPresets?: boolean;
}

export function ScheduleBuilderPanel({
  value,
  onChange,
  className,
  showPresets = true,
}: ScheduleBuilderPanelProps) {
  const nextRunIso = useMemo(
    () => getNextRunPreview(value.expression, value.timezone),
    [value.expression, value.timezone]
  );
  const nextRunLabel = !nextRunIso ? "—" : formatNextRun(nextRunIso);

  return (
    <Card
      className={cn(
        "border-white/[0.03] bg-card transition-all duration-200",
        className
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Clock className="h-4 w-4" />
          Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showPresets && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Presets</Label>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(CRON_PRESETS) ?? []).map(([key, { expression, label }]) => (
                <Button
                  key={key}
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn(
                    "transition-colors",
                    value.expression === expression &&
                      "border-primary bg-primary/10 text-primary"
                  )}
                  onClick={() =>
                    onChange({ ...value, expression })
                  }
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="cron-expression" className="text-xs text-muted-foreground">
            Cron expression
          </Label>
          <Input
            id="cron-expression"
            value={value.expression}
            onChange={(e) =>
              onChange({ ...value, expression: e.target.value.trim() })
            }
            placeholder="0 9 * * 1-5"
            className="font-mono text-sm bg-input border-white/[0.03]"
            aria-describedby="cron-next-run"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="schedule-timezone" className="text-xs text-muted-foreground">
            Timezone
          </Label>
          <select
            id="schedule-timezone"
            value={value.timezone}
            onChange={(e) =>
              onChange({ ...value, timezone: e.target.value })
            }
            className="flex h-9 w-full rounded-md border border-input bg-input px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring border-white/[0.03]"
            aria-describedby="cron-next-run"
          >
            {(TIMEZONES ?? []).map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>
        <div id="cron-next-run" className="rounded-md border border-white/[0.03] bg-secondary/50 px-3 py-2">
          <span className="text-xs text-muted-foreground">Next run (preview): </span>
          <span className="text-sm font-medium text-foreground">{nextRunLabel}</span>
        </div>
      </CardContent>
    </Card>
  );
}
