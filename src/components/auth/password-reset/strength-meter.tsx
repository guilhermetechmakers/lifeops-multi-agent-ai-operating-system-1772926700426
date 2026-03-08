/**
 * Live password strength meter with visual bar and guidance.
 * Red → amber → teal progression per LifeOps design (teal #00C2A8, amber #FFB020).
 */

import { useMemo } from "react";
import { cn } from "@/lib/utils";

export type StrengthLevel = 0 | 1 | 2 | 3 | 4;

const LEVEL_LABELS: Record<StrengthLevel, string> = {
  0: "Enter a password",
  1: "Very weak",
  2: "Weak",
  3: "Good",
  4: "Strong",
};

const LEVEL_HINTS: Record<StrengthLevel, string[]> = {
  0: [],
  1: ["Use at least 8 characters", "Add uppercase and numbers", "Add symbols for strength"],
  2: ["Use 12+ characters", "Add symbols (!@#$%)", "Mix character types"],
  3: ["Use 14+ characters for stronger", "Avoid common words"],
  4: [],
};

function scorePassword(password: string): StrengthLevel {
  if (!password?.length) return 0;
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  if (password.length >= 14) score += 1;
  return Math.min(4, Math.max(0, score)) as StrengthLevel;
}

export interface StrengthMeterProps {
  password: string;
  className?: string;
  /** Minimum level to consider "passing" (e.g. 2 or 3) */
  minLevel?: StrengthLevel;
  /** Id for aria-describedby */
  id?: string;
}

export function StrengthMeter({
  password,
  className,
  minLevel = 2,
  id = "password-strength",
}: StrengthMeterProps) {
  const level = useMemo(() => scorePassword(password ?? ""), [password]);
  const hints = LEVEL_HINTS[level] ?? [];
  const pass = level >= minLevel;
  const barWidth = level === 0 ? 0 : (level / 4) * 100;

  const barColor =
    level <= 1
      ? "bg-destructive"
      : level === 2
        ? "bg-amber"
        : level === 3
          ? "bg-teal"
          : "bg-purple";

  return (
    <div id={id} className={cn("space-y-2", className)} role="status" aria-live="polite">
      <div className="flex items-center gap-2">
        <div
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary"
          aria-hidden
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              barColor
            )}
            style={{ width: `${barWidth}%` }}
          />
        </div>
        <span
          className={cn(
            "text-micro font-medium",
            level <= 1 && "text-destructive",
            level === 2 && "text-amber",
            level === 3 && "text-teal",
            level === 4 && "text-purple"
          )}
        >
          {LEVEL_LABELS[level]}
        </span>
      </div>
      {hints.length > 0 && (
        <ul className="text-micro text-muted-foreground list-disc list-inside space-y-0.5">
          {(hints ?? []).map((hint, i) => (
            <li key={i}>{hint}</li>
          ))}
        </ul>
      )}
      {password.length > 0 && (
        <span className="sr-only">
          Password strength: {LEVEL_LABELS[level]}. {pass ? "Meets minimum requirement." : "Add more characters and variety."}
        </span>
      )}
    </div>
  );
}
