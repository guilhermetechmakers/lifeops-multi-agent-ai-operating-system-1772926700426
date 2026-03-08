/**
 * LoadingSpinner — Accessible loading indicator with configurable size and status text.
 * Used across modules for in-flight operations (sync, publish, run cronjob, etc.).
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import type { LoadingStatus } from "@/types/loading-success";

export type SpinnerSize = "xs" | "sm" | "md" | "lg";

const sizeClasses: Record<SpinnerSize, string> = {
  xs: "h-4 w-4 border-2",
  sm: "h-6 w-6 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-10 w-10 border-[3px]",
};

export interface LoadingSpinnerProps {
  size?: SpinnerSize;
  label?: string;
  description?: string;
  status?: LoadingStatus;
  className?: string;
  /** Optional custom spinner element; when provided, size/label/description still apply to layout */
  children?: React.ReactNode;
}

export function LoadingSpinner({
  size = "md",
  label,
  description,
  status = "loading",
  className,
  children,
}: LoadingSpinnerProps) {
  const isActive = status === "loading";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label ?? (isActive ? "Loading" : "Idle")}
      className={cn("flex flex-col items-center justify-center gap-3", className)}
    >
      {children ?? (
        <div
          className={cn(
            "rounded-full border-muted-foreground/30 border-t-primary",
            sizeClasses[size],
            isActive && "animate-spin"
          )}
          aria-hidden
        />
      )}
      {(label ?? description) && (
        <div className="text-center space-y-1">
          {label && (
            <p className="text-sm font-medium text-foreground">{label}</p>
          )}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      )}
    </div>
  );
}
