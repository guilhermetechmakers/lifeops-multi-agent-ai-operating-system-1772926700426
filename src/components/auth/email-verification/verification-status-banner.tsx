/**
 * Verification status banner - success (green) or error (red) with icon and CTA.
 */

import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface VerificationStatusBannerProps {
  status: "success" | "error";
  headline: string;
  description: string;
  actionLabel?: string;
  actionCallback?: () => void;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export function VerificationStatusBanner({
  status,
  headline,
  description,
  actionLabel,
  actionCallback,
  className,
}: VerificationStatusBannerProps) {
  const isSuccess = status === "success";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        "rounded-xl border px-4 py-4 animate-fade-in transition-shadow duration-200",
        isSuccess
          ? "border-teal/30 bg-teal/10 text-foreground shadow-sm"
          : "border-destructive/30 bg-destructive/10 text-foreground shadow-sm",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {isSuccess ? (
          <CheckCircle2 className="h-6 w-6 shrink-0 text-teal" aria-hidden />
        ) : (
          <XCircle className="h-6 w-6 shrink-0 text-destructive" aria-hidden />
        )}
        <div className="flex-1 min-w-0 space-y-1">
          <h3 className="font-semibold text-base">{headline}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
          {actionLabel && actionCallback && (
            <Button
              variant={isSuccess ? "default" : "destructive"}
              size="sm"
              className="mt-3"
              onClick={actionCallback}
            >
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
