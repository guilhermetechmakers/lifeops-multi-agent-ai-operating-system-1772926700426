/**
 * Inline error banner for password reset flow (actionable remediation).
 */

import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

export interface InlineErrorProps {
  message: string;
  /** Optional remediation text (e.g. "Try again" or "Request a new link") */
  remediation?: string;
  /** Optional custom action node */
  action?: React.ReactNode;
  id?: string;
  className?: string;
}

export function InlineError({
  message,
  remediation,
  action,
  id = "inline-error",
  className,
}: InlineErrorProps) {
  return (
    <div
      id={id}
      role="alert"
      aria-live="assertive"
      className={cn(
        "flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive animate-fade-in",
        className
      )}
    >
      <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" aria-hidden />
      <div className="flex-1 min-w-0">
        <p>{message}</p>
        {action && <div className="mt-2">{action}</div>}
        {!action && remediation && (
          <p className="mt-2 text-muted-foreground text-xs">{remediation}</p>
        )}
      </div>
    </div>
  );
}
