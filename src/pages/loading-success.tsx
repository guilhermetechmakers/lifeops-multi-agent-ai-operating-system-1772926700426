/**
 * LoadingSuccessPage — Generic loading spinner and operation success/error state.
 * Uses LoadingSpinner, StatusBanner, ErrorSnippet, NextStepsPanel primitives.
 * Reusable for async flows: Loading → Success or Error with retry and correlationId.
 */

import { Button } from "@/components/ui/button";
import { AnimatedPage } from "@/components/animated-page";
import {
  LoadingSpinner,
  StatusBanner,
} from "@/components/loading-success";
import type { APIError } from "@/lib/errors/types";
import type { NextStep } from "@/types/loading-success";
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
  /** Optional next steps for success state */
  nextSteps?: NextStep[] | null;
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
  nextSteps,
  className,
  loadingDescription,
}: LoadingSuccessPageProps) {
  if (status === "idle") return null;

  const nextStepsSafe = Array.isArray(nextSteps) ? nextSteps : [];

  const successActions = [
    ...(onSuccessRedirect
      ? [
          {
            label: "Continue",
            onClick: () => {
              window.location.href = onSuccessRedirect;
            },
            kind: "primary" as const,
          },
        ]
      : []),
    ...(successAction
      ? [
          {
            label: successAction.label,
            onClick: successAction.onClick,
            kind: "secondary" as const,
          },
        ]
      : []),
  ];

  return (
    <AnimatedPage
      className={cn(
        "min-h-[40vh] flex flex-col items-center justify-center px-4 py-8",
        className
      )}
    >
      {status === "loading" && (
        <div className="w-full max-w-md flex flex-col items-center gap-4 animate-fade-in">
          <LoadingSpinner
            size="lg"
            label={loadingMessage}
            description={loadingDescription}
            status="loading"
          />
          {onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      )}

      {status === "success" && (
        <div className="w-full max-w-md animate-scale-in">
          <StatusBanner
            variant="success"
            title={successMessage}
            nextSteps={nextStepsSafe.length > 0 ? nextStepsSafe : undefined}
            actions={successActions.length > 0 ? successActions : undefined}
          />
        </div>
      )}

      {status === "error" && error && (
        <div className="w-full max-w-md animate-fade-in">
          <StatusBanner
            variant="failure"
            title="Operation failed"
            subtitle={error.message}
            errorCode={error.code}
            errorMessage={error.message}
            errorDetails={
              error.correlationId
                ? `Reference: ${error.correlationId}`
                : undefined
            }
            retryHandler={onRetry}
          />
        </div>
      )}
    </AnimatedPage>
  );
}
