/**
 * ErrorSnippet — Standardized error presentation with errorCode, message, details, and retry.
 * Uses Array.isArray guards for any list of error details; null-safe rendering.
 */

import * as React from "react";
import { AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { ErrorInfo } from "@/types/loading-success";

export interface ErrorSnippetProps {
  errorCode: string;
  message: string;
  details?: string;
  /** Optional list of detail lines; guarded with Array.isArray */
  detailLines?: string[];
  retryHandler?: () => void | Promise<void>;
  className?: string;
}

export function ErrorSnippet({
  errorCode,
  message,
  details,
  detailLines,
  retryHandler,
  className,
}: ErrorSnippetProps) {
  const [open, setOpen] = React.useState(false);
  const [retrying, setRetrying] = React.useState(false);

  const safeDetailLines = Array.isArray(detailLines) ? detailLines : [];
  const hasDetails = Boolean(details ?? (safeDetailLines.length > 0));

  const handleRetry = async () => {
    if (!retryHandler) return;
    setRetrying(true);
    try {
      await Promise.resolve(retryHandler());
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-left animate-fade-in duration-200",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <AlertCircle
          className="h-5 w-5 shrink-0 text-destructive mt-0.5"
          aria-hidden
        />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="font-mono text-xs font-medium text-destructive"
              aria-label="Error code"
            >
              {errorCode}
            </span>
            <p className="text-sm font-medium text-foreground">{message}</p>
          </div>
          {hasDetails && (
            <Collapsible open={open} onOpenChange={setOpen}>
              <CollapsibleTrigger
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-1 -ml-1 min-h-[44px] min-w-[44px] items-center justify-center"
                aria-expanded={open}
              >
                {open ? (
                  <ChevronUp className="h-4 w-4" aria-hidden />
                ) : (
                  <ChevronDown className="h-4 w-4" aria-hidden />
                )}
                <span>{open ? "Hide details" : "Show details"}</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                {details && !safeDetailLines.length ? (
                  <p className="text-xs text-muted-foreground">{details}</p>
                ) : (
                  <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                    {(safeDetailLines ?? []).map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                )}
              </CollapsibleContent>
            </Collapsible>
          )}
          {retryHandler && (
            <div className="pt-2">
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleRetry}
                disabled={retrying}
                aria-label="Retry the last action"
                aria-busy={retrying}
                className="min-h-[44px]"
              >
                {retrying ? "Retrying…" : "Retry"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export interface ErrorSnippetFromInfoProps {
  info: ErrorInfo;
  retryHandler?: () => void | Promise<void>;
  className?: string;
}

/** Renders ErrorSnippet from an ErrorInfo object. */
export function ErrorSnippetFromInfo({
  info,
  retryHandler,
  className,
}: ErrorSnippetFromInfoProps) {
  return (
    <ErrorSnippet
      errorCode={info.errorCode}
      message={info.message}
      details={info.details}
      retryHandler={retryHandler}
      className={className}
    />
  );
}
