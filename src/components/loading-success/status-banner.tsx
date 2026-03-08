/**
 * StatusBanner — Loading / Success / Failure banner with actions, details, and optional next steps.
 * Renders appropriate UI per variant; collapsible details for failure; integrates with ErrorSnippet.
 */

import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ErrorSnippet } from "@/components/loading-success/error-snippet";
import { NextStepsPanel } from "@/components/loading-success/next-steps-panel";
import { GatedActionButton } from "@/components/loading-success/gated-action-button";
import type {
  StatusBannerVariant,
  StatusBannerAction,
  NextStep,
  ErrorInfo,
} from "@/types/loading-success";

export type { StatusBannerVariant };

export interface StatusBannerProps {
  variant: StatusBannerVariant;
  title: string;
  subtitle?: string;
  /** Action buttons (e.g. "View artifact", "Next step", "Close"); guarded for null/undefined */
  actions?: StatusBannerAction[];
  /** Optional details string or object for failure; collapsible when present */
  details?: string | Record<string, unknown>;
  timestamp?: string;
  /** For failure: use ErrorSnippet. Pass error object OR errorCode/errorMessage/errorDetails */
  error?: ErrorInfo;
  /** For failure: error code (alternative to error object) */
  errorCode?: string;
  /** For failure: error message (alternative to error object) */
  errorMessage?: string;
  /** For failure: error details (alternative to error object) */
  errorDetails?: string;
  retryHandler?: () => void | Promise<void>;
  /** For success: optional next steps to show below the banner */
  nextSteps?: NextStep[];
  onNavigate?: (step: NextStep) => void;
  /** Auto-hide loading after timeout (ms); 0 or undefined = no auto-hide */
  autoHideLoadingMs?: number;
  className?: string;
}

const variantConfig: Record<
  StatusBannerVariant,
  { icon: typeof Loader2; borderBg: string }
> = {
  loading: {
    icon: Loader2,
    borderBg: "border-amber-500/30 bg-amber-500/5",
  },
  success: {
    icon: CheckCircle2,
    borderBg: "border-teal/30 bg-teal/10",
  },
  failure: {
    icon: AlertCircle,
    borderBg: "border-destructive/30 bg-destructive/10",
  },
};

export function StatusBanner({
  variant,
  title,
  subtitle,
  actions = [],
  details,
  timestamp,
  error: errorProp,
  errorCode,
  errorMessage,
  errorDetails,
  retryHandler,
  nextSteps = [],
  onNavigate,
  className,
}: StatusBannerProps) {
  const safeActions = Array.isArray(actions) ? actions : [];
  const safeNextSteps = Array.isArray(nextSteps) ? nextSteps : [];

  const error: ErrorInfo | undefined =
    errorProp ??
    (errorCode ?? errorMessage
      ? {
          errorCode: errorCode ?? "UNKNOWN",
          message: errorMessage ?? "An error occurred",
          details: errorDetails,
        }
      : undefined);

  const config = variantConfig[variant];
  const Icon = config.icon;

  const detailsString =
    typeof details === "string"
      ? details
      : details && typeof details === "object"
        ? JSON.stringify(details, null, 2)
        : undefined;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "rounded-xl border p-4 md:p-5 space-y-4 animate-fade-in-up duration-200",
        config.borderBg,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Icon
          className={cn(
            "h-5 w-5 shrink-0 mt-0.5",
            variant === "loading" && "animate-spin text-amber-500",
            variant === "success" && "text-teal",
            variant === "failure" && "text-destructive"
          )}
          aria-hidden
        />
        <div className="flex-1 min-w-0 space-y-1">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
          {timestamp && (
            <p className="text-xs text-muted-foreground">{timestamp}</p>
          )}
        </div>
      </div>

      {variant === "failure" && error && (
        <ErrorSnippet
          errorCode={error.errorCode}
          message={error.message}
          details={error.details ?? detailsString}
          retryHandler={retryHandler}
        />
      )}

      {variant === "failure" && !error && detailsString && (
        <details className="rounded-lg border border-white/[0.03] bg-card/50 p-3">
          <summary className="cursor-pointer text-sm font-medium text-foreground">
            Details
          </summary>
          <pre className="mt-2 text-xs text-muted-foreground overflow-auto max-h-40">
            {detailsString}
          </pre>
        </details>
      )}

      {safeActions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {(safeActions ?? []).map((action, i) => (
            <GatedActionButton
              key={i}
              label={action.label}
              onClick={action.onClick}
              variant={
                action.kind === "secondary"
                  ? "secondary"
                  : action.kind === "ghost"
                    ? "ghost"
                    : "default"
              }
              size="sm"
            />
          ))}
        </div>
      )}

      {variant === "success" && safeNextSteps.length > 0 && (
        <NextStepsPanel steps={safeNextSteps} onNavigate={onNavigate} />
      )}
    </div>
  );
}
