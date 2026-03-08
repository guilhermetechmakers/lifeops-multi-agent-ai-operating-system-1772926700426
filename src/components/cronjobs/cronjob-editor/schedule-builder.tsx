/**
 * ScheduleBuilder: Cron expression builder UI with presets, validation, expression input.
 * Timezone-aware with next-run preview.
 */

import { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CRON_PRESETS,
  isValidCronExpression,
  getNextRunPreview,
  getNextNRunPreviews,
  formatNextRun,
} from "@/lib/cron-utils";
import { Clock, CheckCircle2, AlertCircle } from "lucide-react";

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "America/Chicago",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export interface ScheduleBuilderValue {
  type: "expression" | "builder";
  expression?: string;
  timezone: string;
  builder?: {
    minute?: number;
    hour?: number;
    dayOfMonth?: number;
    month?: number;
    dayOfWeek?: number;
    preset?: string;
  };
}

interface ScheduleBuilderProps {
  value: ScheduleBuilderValue;
  onChange: (v: ScheduleBuilderValue) => void;
  className?: string;
}

export function ScheduleBuilder({
  value,
  onChange,
  className,
}: ScheduleBuilderProps) {
  const [mode, setMode] = useState<"expression" | "builder">(
    value.type ?? "expression"
  );
  const expr = value.expression ?? "0 9 * * 1-5";
  const tz = value.timezone ?? "UTC";

  const isValid = useMemo(
    () => (expr?.trim() ? isValidCronExpression(expr) : false),
    [expr]
  );
  const nextRunIso = useMemo(
    () => getNextRunPreview(expr ?? "", tz),
    [expr, tz]
  );
  const nextRunLabel = !nextRunIso ? "—" : formatNextRun(nextRunIso);
  const nextNRuns = useMemo(
    () => getNextNRunPreviews(expr ?? "", tz, 5),
    [expr, tz]
  );

  const handleExpressionChange = (e: string) => {
    onChange({
      ...value,
      type: "expression",
      expression: e,
      timezone: tz,
      builder: value.builder,
    });
  };

  const handlePresetClick = (expression: string) => {
    onChange({
      ...value,
      type: "expression",
      expression,
      timezone: tz,
      builder: value.builder,
    });
    setMode("expression");
  };

  const handleTimezoneChange = (tzVal: string) => {
    onChange({ ...value, timezone: tzVal });
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === "expression" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("expression")}
        >
          Expression
        </Button>
        <Button
          type="button"
          variant={mode === "builder" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("builder")}
        >
          Builder
        </Button>
      </div>

      {mode === "expression" ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="cron-expression" className="text-xs text-muted-foreground">
              Cron expression (minute hour day month weekday)
            </Label>
            <div className="relative">
              <Input
                id="cron-expression"
                value={expr}
                onChange={(e) => handleExpressionChange(e.target.value.trim())}
                placeholder="0 9 * * 1-5"
                className="font-mono text-sm bg-input border-white/[0.03] pr-10"
                aria-describedby="cron-validation cron-next-run"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                {expr?.trim() ? (
                  isValid ? (
                    <CheckCircle2 className="h-4 w-4 text-teal" aria-hidden />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-destructive" aria-hidden />
                  )
                ) : null}
              </span>
            </div>
            <p id="cron-validation" className="text-xs text-muted-foreground">
              {expr?.trim()
                ? isValid
                  ? "Valid expression"
                  : "Invalid cron syntax"
                : "Enter a 5-field cron expression"}
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Presets</Label>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(CRON_PRESETS) ?? []).map(
                ([key, { expression, label }]) => (
                  <Button
                    key={key}
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      "transition-colors",
                      expr === expression && "border-primary bg-primary/10 text-primary"
                    )}
                    onClick={() => handlePresetClick(expression)}
                  >
                    {label}
                  </Button>
                )
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Minute</Label>
            <Input
              type="number"
              min={0}
              max={59}
              value={value.builder?.minute ?? 0}
              onChange={(e) =>
                onChange({
                  ...value,
                  type: "builder",
                  timezone: value.timezone ?? "UTC",
                  builder: {
                    ...value.builder,
                    minute: parseInt(e.target.value, 10) || 0,
                  },
                })
              }
              className="bg-input border-white/[0.03]"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Hour</Label>
            <Input
              type="number"
              min={0}
              max={23}
              value={value.builder?.hour ?? 9}
              onChange={(e) =>
                onChange({
                  ...value,
                  type: "builder",
                  timezone: value.timezone ?? "UTC",
                  builder: {
                    ...value.builder,
                    hour: parseInt(e.target.value, 10) || 9,
                  },
                })
              }
              className="bg-input border-white/[0.03]"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Day of month</Label>
            <Input
              type="number"
              min={1}
              max={31}
              value={value.builder?.dayOfMonth ?? 1}
              onChange={(e) =>
                onChange({
                  ...value,
                  type: "builder",
                  timezone: value.timezone ?? "UTC",
                  builder: {
                    ...value.builder,
                    dayOfMonth: parseInt(e.target.value, 10) || 1,
                  },
                })
              }
              className="bg-input border-white/[0.03]"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Month</Label>
            <Input
              type="number"
              min={1}
              max={12}
              value={value.builder?.month ?? 1}
              onChange={(e) =>
                onChange({
                  ...value,
                  type: "builder",
                  timezone: value.timezone ?? "UTC",
                  builder: {
                    ...value.builder,
                    month: parseInt(e.target.value, 10) || 1,
                  },
                })
              }
              className="bg-input border-white/[0.03]"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Day of week</Label>
            <Input
              type="number"
              min={0}
              max={6}
              value={value.builder?.dayOfWeek ?? 1}
              onChange={(e) =>
                onChange({
                  ...value,
                  type: "builder",
                  timezone: value.timezone ?? "UTC",
                  builder: {
                    ...value.builder,
                    dayOfWeek: parseInt(e.target.value, 10) || 1,
                  },
                })
              }
              className="bg-input border-white/[0.03]"
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="schedule-timezone" className="text-xs text-muted-foreground">
          Timezone
        </Label>
        <select
          id="schedule-timezone"
          value={tz}
          onChange={(e) => handleTimezoneChange(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-input px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring border-white/[0.03]"
          aria-describedby="cron-next-run"
        >
          {(TIMEZONES ?? []).map((tzOption) => (
            <option key={tzOption} value={tzOption}>
              {tzOption}
            </option>
          ))}
        </select>
      </div>

      <div
        id="cron-next-run"
        className="space-y-2 rounded-md border border-white/[0.03] bg-secondary/50 px-3 py-2"
      >
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground">Next run (preview): </span>
          <span className="text-sm font-medium text-foreground">{nextRunLabel}</span>
        </div>
        {(nextNRuns ?? []).length > 1 && (
          <ul className="text-xs text-muted-foreground space-y-0.5 pl-6">
            {(nextNRuns ?? []).slice(1, 5).map((iso, i) => (
              <li key={iso}>
                {i + 2}. {formatNextRun(iso)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
