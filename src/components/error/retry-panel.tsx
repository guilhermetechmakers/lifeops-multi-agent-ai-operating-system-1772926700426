import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { APIError } from "@/lib/errors/types";
import { getRetrySuggestion } from "@/lib/errors/messages";
import { RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

export interface RetryPanelProps {
  error: APIError;
  onRetry?: () => void;
  /** Show diagnostic details (correlationId, etc.) in expandable section */
  showDiagnostics?: boolean;
  className?: string;
}

export function RetryPanel({
  error,
  onRetry,
  showDiagnostics = true,
  className,
}: RetryPanelProps) {
  const [diagnosticsOpen, setDiagnosticsOpen] = React.useState(false);
  const retryHint = getRetrySuggestion(error.code);

  return (
    <Card className={cn("border-destructive/30 bg-card", className)}>
      <CardHeader className="pb-2">
        <p className="text-sm font-medium text-foreground">{error.message}</p>
        {error.correlationId && (
          <p className="text-xs text-muted-foreground mt-1">
            Reference: <code className="rounded bg-secondary px-1 py-0.5 font-mono text-micro">{error.correlationId}</code>
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {error.retryable && onRetry && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRetry}
              aria-label="Retry the request"
              className="hover:bg-secondary"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
            {retryHint && (
              <span className="text-xs text-muted-foreground">{retryHint}</span>
            )}
          </div>
        )}
        {showDiagnostics && error.correlationId && (
          <div>
            <button
              type="button"
              onClick={() => setDiagnosticsOpen((o) => !o)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              aria-expanded={diagnosticsOpen}
            >
              {diagnosticsOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              Diagnostics
            </button>
            {diagnosticsOpen && (
              <pre
                className="mt-2 rounded-md border border-white/5 bg-secondary/50 p-3 text-xs text-muted-foreground overflow-x-auto"
                role="region"
                aria-label="Error diagnostics"
              >
                {JSON.stringify(
                  {
                    correlationId: error.correlationId,
                    code: error.code,
                    status: error.status,
                    retryable: error.retryable,
                  },
                  null,
                  2
                )}
              </pre>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
