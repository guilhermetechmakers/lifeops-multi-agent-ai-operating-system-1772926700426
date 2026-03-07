/**
 * GlobalErrorView — Renders page_500_039 layout with actionable steps.
 * Use when a critical error should take over the view (e.g. after API failure).
 */

import { RetryPanel } from "./retry-panel";
import type { APIError } from "@/lib/errors/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface GlobalErrorViewProps {
  error: APIError;
  onRetry?: () => void;
  /** Optional title override */
  title?: string;
  /** Show full diagnostic section */
  showDiagnostics?: boolean;
  className?: string;
}

export function GlobalErrorView({
  error,
  onRetry,
  title = "Something went wrong",
  showDiagnostics = true,
  className,
}: GlobalErrorViewProps) {
  return (
    <div
      className={cn("flex min-h-[50vh] items-center justify-center p-6", className)}
      role="alert"
      aria-live="assertive"
    >
      <Card className="w-full max-w-lg border-destructive/30 bg-card">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden />
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <RetryPanel error={error} onRetry={onRetry} showDiagnostics={showDiagnostics} />
          <div className="flex flex-wrap gap-3 pt-2">
            <Link to="/">
              <Button variant="outline" size="sm">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
            </Link>
            {onRetry && (
              <Button variant="default" size="sm" onClick={onRetry}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
