import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

function generateCorrelationId(): string {
  return `ui_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, correlationId: string) => void;
  className?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  correlationId: string | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, State> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      correlationId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    const correlationId = generateCorrelationId();
    this.setState((s) => (s.correlationId ? s : { ...s, correlationId }));
    this.props.onError?.(error, correlationId);
    if (import.meta.env.DEV) {
      console.error("[ErrorBoundary]", correlationId, error, errorInfo.componentStack);
    }
  }

  render(): React.ReactNode {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div
          className={cn("flex min-h-[200px] items-center justify-center p-6", this.props.className)}
          role="alert"
          aria-live="assertive"
        >
          <Card className="max-w-md border-destructive/30 bg-card">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden />
                <h2 className="text-lg font-semibold">Something went wrong</h2>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                An unexpected error occurred. You can try refreshing or return home.
              </p>
              {this.state.correlationId && (
                <p className="text-xs text-muted-foreground mt-2">
                  Reference: <code className="rounded bg-secondary px-1 py-0.5 font-mono">{this.state.correlationId}</code>
                </p>
              )}
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                aria-label="Refresh the page"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Link to="/">
                <Button variant="default" size="sm" aria-label="Go to home">
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}
