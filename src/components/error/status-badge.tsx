import * as React from "react";
import { cn } from "@/lib/utils";
import { ERROR_CODES } from "@/lib/errors/types";

const STATUS_VARIANT_MAP: Record<string, "default" | "destructive" | "secondary" | "success" | "warning" | "outline"> = {
  [ERROR_CODES.API.VALIDATION_FAILED]: "warning",
  [ERROR_CODES.API.UNAUTHORIZED]: "secondary",
  [ERROR_CODES.API.FORBIDDEN]: "destructive",
  [ERROR_CODES.API.NOT_FOUND]: "secondary",
  [ERROR_CODES.API.CONFLICT]: "warning",
  [ERROR_CODES.API.RATE_LIMITED]: "warning",
  [ERROR_CODES.API.INTERNAL_ERROR]: "destructive",
  [ERROR_CODES.API.SERVICE_UNAVAILABLE]: "warning",
  [ERROR_CODES.API.TIMEOUT]: "warning",
  [ERROR_CODES.API.INVALID_REQUEST]: "warning",
  [ERROR_CODES.APP_LOGIC.MISSING_DEPENDENCY]: "warning",
  [ERROR_CODES.APP_LOGIC.INVALID_STATE]: "warning",
  [ERROR_CODES.APP_LOGIC.ACTION_NOT_ALLOWED]: "destructive",
};

const variantClasses: Record<string, string> = {
  default: "border-transparent bg-primary text-primary-foreground",
  destructive: "border-transparent bg-destructive/20 text-destructive",
  secondary: "border-transparent bg-secondary text-secondary-foreground",
  success: "border-transparent bg-teal/20 text-teal",
  warning: "border-transparent bg-amber/20 text-amber",
  outline: "text-foreground border-border",
};

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  code: string;
  label?: string;
}

export function StatusBadge({ code, label, className, ...props }: StatusBadgeProps) {
  const variant = STATUS_VARIANT_MAP[code] ?? "outline";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {label ?? code}
    </span>
  );
}
