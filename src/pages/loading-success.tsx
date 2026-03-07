/**
 * page_loading_success_040 — Generic loading spinner and operation success/error state.
 * Reusable for async flows: Loading → Success or Error with retry and correlationId.
 */

import { Button } from "@/components/ui/button";
import { AnimatedPage } from "@/components/animated-page";
import { RetryPanel } from "@/components/error";
import type { APIError } from "@/lib/errors/types";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type LoadingSuccessStatus = "idle" | "loading" | "success" | "error";

export interface LoadingSuccessPageProps {
  status: LoadingSuccessStatus;
  /** Shown during loading */
  loadingMessage?: string;
  /** Shown on success */
  successMessage?: string;
  /** Optional redirect URL after success (caller can use navigate() instead) */
  onSuccessRedirect?: string;
  /** Error when status === "error" */
  error?: APIError | null;
  /** Retry callback when status === "error" */
  onRetry?: () => void;
  /** Optional cancel during loading */
  onCancel?: () => void;
  /** Optional action button in success state */
  successAction?: { label: string; onClick: () => void };
  className?: string;
  /** Optional descriptive text below spinner */
  loadingDescription?: string;
}

export function LoadingSuccessPage({
  status,
  loadingMessage = "Loading…",
  successMessage = "Done!",
  onSuccessRedirect,
  error = null,
  onRetry,
  onCancel,
  successAction,
  className,
  loadingDescription,
}: LoadingSuccessPageProps) {
  if (status === "idle") return null;

  return (
    <AnimatedPage
      className={cn(
        "min-h-[40vh] flex flex-col items-center justify-center px-4 py-8",
        className
      )}
    >
      {status === "loading" && (
        <div
          className="flex flex-col items-center gap-4 animate-fade-in"
          role="status"
          aria-live="polite"
          aria-label={loadingMessage}
        >
          <Loader2 className="h-12 w-12 animate-spin text-primary" aria-hidden />
          <p className="text-sm font-medium text-foreground">{loadingMessage}</p>
          {loadingDescription && (
            <p className="text-xs text-muted-foreground max-w-sm text-center">
              {loadingDescription}
            </p>
          )}
          <div className="flex gap-2 mt-2">
            {onCancel && (
              <Button variant="outline" size="sm" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      )}

      {status === "success" && (
        <div
          className="flex flex-col items-center gap-4 animate-scale-in"
          role="status"
          aria-live="polite"
          aria-label={successMessage}
        >
          <div className="rounded-full bg-teal/20 p-4">
            <Check className="h-12 w-12 text-teal" aria-hidden />
          </div>
          <p className="text-sm font-medium text-foreground">{successMessage}</p>
          <div className="flex gap-2 mt-2">
            {onSuccessRedirect && (
              <Button
                variant="default"
                size="sm"
                onClick={() => (window.location.href = onSuccessRedirect)}
              >
                Continue
              </Button>
            )}
            {successAction && (
              <Button variant="outline" size="sm" onClick={successAction.onClick}>
                {successAction.label}
              </Button>
            )}
          </div>
        </div>
      )}

      {status === "error" && error && (
        <div className="w-full max-w-md animate-fade-in">
          <RetryPanel error={error} onRetry={onRetry} showDiagnostics />
        </div>
      )}
    </AnimatedPage>
  );
}
