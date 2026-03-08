/**
 * Cron expression presets, validation, and next-run preview.
 */

export type CronPreset = "hourly" | "daily" | "weekly" | "monthly";

export interface ScheduleBuilderState {
  preset?: CronPreset;
  minute?: number;
  hour?: number;
  dayOfMonth?: number;
  month?: number;
  dayOfWeek?: number;
}

const CRON_REGEX = /^(\d{1,2}|\*|\*\/\d+|\d+-\d+)(\s+(\d{1,2}|\*|\*\/\d+|\d+-\d+))?(\s+(\d{1,2}|\*|\*\/\d+|\d+-\d+))?(\s+(\d{1,2}|\*|\*\/\d+|\d+-\d+))?(\s+(\d{1,2}|\*|\*\/\d+|\d+-\d+))?$/;

export function isValidCronExpression(expr: string): boolean {
  if (!expr?.trim()) return false;
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5 && parts.length !== 6) return false;
  return CRON_REGEX.test(expr.trim());
}

export function presetToCron(preset: CronPreset, state: ScheduleBuilderState): string {
  switch (preset) {
    case "hourly":
      return `${state.minute ?? 0} * * * *`;
    case "daily":
      return `${state.minute ?? 0} ${state.hour ?? 9} * * *`;
    case "weekly":
      return `${state.minute ?? 0} ${state.hour ?? 9} * * ${state.dayOfWeek ?? 1}`;
    case "monthly":
      return `${state.minute ?? 0} ${state.hour ?? 9} ${state.dayOfMonth ?? 1} * *`;
    default:
      return "0 9 * * *";
  }
}

export function humanizeCron(expr: string): string {
  if (!expr?.trim()) return "—";
  const parts = expr.trim().split(/\s+/);
  if (parts.length < 5) return expr;
  const [min, hour, dom, month, dow] = parts;
  if (min === "0" && hour === "*" && dom === "*" && month === "*" && dow === "*")
    return "Every hour";
  if (min !== "*" && hour !== "*" && dom === "*" && month === "*" && dow === "*")
    return `Daily at ${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
  if (min !== "*" && hour !== "*" && dom === "*" && month === "*" && dow !== "*")
    return `Weekly on day ${dow} at ${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
  if (min !== "*" && hour !== "*" && dom !== "*" && month === "*" && dow === "*")
    return `Monthly on day ${dom} at ${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
  return expr;
}

export const CRON_PRESETS: Record<string, { expression: string; label: string }> = {
  hourly: { expression: "0 * * * *", label: "Every hour" },
  daily: { expression: "0 0 * * *", label: "Daily at midnight" },
  weekly: { expression: "0 0 * * 0", label: "Weekly (Sunday midnight)" },
  monthly: { expression: "0 0 1 * *", label: "Monthly (1st at midnight)" },
  "weekdays-9am": { expression: "0 9 * * 1-5", label: "Weekdays at 09:00" },
};

/** Approximate next run for common patterns. Returns null if invalid. */
export function getNextRunPreview(
  expression: string,
  _timezone: string = "UTC"
): string | null {
  const ex = (expression ?? "").trim();
  if (!ex || !isValidCronExpression(ex)) return null;
  try {
    if (ex === "0 * * * *") {
      const next = new Date();
      next.setMinutes(0, 0, 0);
      if (next.getTime() <= Date.now()) next.setHours(next.getHours() + 1);
      return next.toISOString();
    }
    if (ex === "0 0 * * *") {
      const next = new Date();
      next.setUTCHours(24, 0, 0, 0);
      return next.toISOString();
    }
    if (ex === "0 9 * * 1-5") {
      const d = new Date();
      const day = d.getUTCDay();
      let daysToAdd = (1 - day + 7) % 7;
      if (day >= 1 && day <= 5 && d.getUTCHours() < 9) daysToAdd = 0;
      else if (day >= 1 && day <= 5) daysToAdd = 1;
      else if (day === 0) daysToAdd = 1;
      const next = new Date(d);
      next.setUTCDate(d.getUTCDate() + daysToAdd);
      next.setUTCHours(9, 0, 0, 0);
      return next.toISOString();
    }
    if (ex === "0 0 1 * *") {
      const next = new Date();
      next.setUTCMonth(next.getUTCMonth() + 1, 1);
      next.setUTCHours(0, 0, 0, 0);
      return next.toISOString();
    }
    const parts = ex.split(/\s+/);
    if (parts.length >= 5) {
      const min = parseInt(parts[0], 10) || 0;
      const hour = parseInt(parts[1], 10);
      if (!Number.isNaN(hour) && parts[2] === "*" && parts[3] === "*" && parts[4] === "*") {
        const next = new Date();
        next.setMinutes(min, 0, 0);
        next.setHours(hour);
        if (next.getTime() <= Date.now()) next.setDate(next.getDate() + 1);
        return next.toISOString();
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function formatNextRun(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}
