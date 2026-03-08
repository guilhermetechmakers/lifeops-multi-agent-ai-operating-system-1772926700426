/**
 * 500ServerErrorPage — Dedicated 500 error page with error card, retry, guidance, and support.
 * Accessible, null-safe, and aligned with LifeOps design system.
 */

import * as React from "react";
import { useNavigate } from "react-router-dom";
import { ServerCrash, Copy, Check } from "lucide-react";
import { AnimatedPage } from "@/components/animated-page";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useErrorContext } from "@/hooks/use-error-context";
import { GuidanceList } from "./guidance-list";
import { RetryActionButton } from "./retry-action-button";
import { ContactSupportSection } from "./contact-support-section";

export interface ServerError500PageProps {
  onRetry?: () => void | Promise<void>;
  errorId?: string | null;
  retryDisabled?: boolean;
  className?: string;
}

export function ServerError500Page({
  onRetry,
  errorId: propsErrorId,
  retryDisabled = false,
  className,
}: ServerError500PageProps) {
  const navigate = useNavigate();
  const errorContext = useErrorContext(propsErrorId ?? undefined);
  const [isRetrying, setRetrying] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handleRetry = React.useCallback(async () => {
    if (retryDisabled) return;
    setRetrying(true);
    try {
      if (typeof onRetry === "function") {
        await Promise.resolve(onRetry());
      } else {
        window.location.reload();
      }
    } finally {
      setRetrying(false);
    }
  }, [onRetry, retryDisabled]);

  const handleCopyId = React.useCallback(() => {
    const id = errorContext?.errorId ?? "";
    if (!id) return;
    void navigator.clipboard.writeText(id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [errorContext?.errorId]);

  const displayErrorId = errorContext?.errorId ?? propsErrorId ?? "";

  return (
    <main
      className={cn(
        "min-h-screen bg-background",
        "flex flex-col items-center justify-center px-4 py-16 sm:py-24",
        "bg-gradient-to-b from-background via-[rgb(21_23_24)] to-background",
        className
      )}
      role="main"
      aria-label="Server error"
    >
      <AnimatedPage className="w-full max-w-2xl flex flex-col items-center gap-8 animate-fade-in-up">
        {/* Breadcrumb / page label */}
        <nav aria-label="Breadcrumb" className="self-start">
          <p className="text-xs text-muted-foreground">
            Error <span aria-hidden>·</span> 500
          </p>
        </nav>

        {/* Main Error Card */}
        <section
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="w-full"
        >
          <Card
            className={cn(
              "border-white/[0.03] bg-card overflow-hidden",
              "shadow-card transition-all duration-200 hover:shadow-card-hover",
              "rounded-xl"
            )}
            style={{
              boxShadow:
                "0 1px 0 0 rgba(255,255,255,0.03), 0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            <div
              className="h-1 w-full bg-gradient-to-r from-destructive/80 to-destructive/40"
              aria-hidden
            />
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-destructive/20 text-destructive"
                  aria-hidden
                >
                  <ServerCrash className="h-6 w-6" />
                </span>
                <div>
                  <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
                    Something went wrong on our side
                  </h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    We&apos;re sorry. Our servers hit an error. Use the steps below or
                    contact support if it keeps happening.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-0">
              {/* Guidance list */}
              <div>
                <h2 className="text-sm font-medium text-foreground mb-2">
                  What you can do
                </h2>
                <GuidanceList />
              </div>

              {/* Error ID + copy */}
              {displayErrorId && (
                <div className="rounded-md border border-white/[0.06] bg-secondary/30 px-3 py-2">
                  <p className="text-xs text-muted-foreground">
                    Reference ID (for support):{" "}
                    <code className="font-mono text-foreground/90">
                      {displayErrorId}
                    </code>
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyId}
                    className="mt-2 h-8 gap-1.5 text-xs"
                    aria-label="Copy reference ID"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
              )}

              {/* Actions: Retry + Contact Support */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <RetryActionButton
                  onRetry={handleRetry}
                  isLoading={isRetrying}
                  disabled={retryDisabled}
                />
                <ContactSupportSection errorContext={errorContext} />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Secondary: Dashboard / Home */}
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="min-h-[44px] transition-transform hover:scale-[1.02] active:scale-[0.98]"
            aria-label="Go to dashboard"
          >
            Dashboard
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate("/")}
            className="min-h-[44px] transition-transform hover:scale-[1.02] active:scale-[0.98]"
            aria-label="Return to home"
          >
            Home
          </Button>
        </div>
      </AnimatedPage>
    </main>
  );
}
