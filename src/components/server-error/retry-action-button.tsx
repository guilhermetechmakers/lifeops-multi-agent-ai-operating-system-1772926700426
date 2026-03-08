/**
 * RetryActionButton — Primary retry action with loading state and disabled handling.
 * Accessible: aria-label, disabled when retry in progress or retryDisabled.
 */

import { RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface RetryActionButtonProps {
  onRetry?: () => void | Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function RetryActionButton({
  onRetry,
  isLoading = false,
  disabled = false,
  className,
  children = "Retry",
}: RetryActionButtonProps) {
  const isDisabled = disabled || isLoading;

  const handleClick = () => {
    if (isDisabled) return;
    void Promise.resolve(onRetry?.()).catch(() => {});
  };

  return (
    <Button
      type="button"
      variant="default"
      onClick={handleClick}
      disabled={isDisabled}
      className={cn("min-h-[44px] min-w-[120px] transition-transform hover:scale-[1.02] active:scale-[0.98]", className)}
      aria-label={isLoading ? "Retrying…" : "Retry the last action"}
      aria-busy={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        <RefreshCw className="h-4 w-4" aria-hidden />
      )}
      {children}
    </Button>
  );
}
