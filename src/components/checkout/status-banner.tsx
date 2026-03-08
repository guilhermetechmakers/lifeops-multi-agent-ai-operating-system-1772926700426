/**
 * StatusBanner / OrderToast — success, error, or guidance messages for checkout.
 */

import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

export type StatusBannerVariant = "success" | "error" | "info";

export interface StatusBannerProps {
  variant: StatusBannerVariant;
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

const variantConfig: Record<
  StatusBannerVariant,
  { icon: typeof CheckCircle2; classNames: string }
> = {
  success: {
    icon: CheckCircle2,
    classNames: "border-teal/30 bg-teal/10 text-teal",
  },
  error: {
    icon: AlertCircle,
    classNames: "border-destructive/30 bg-destructive/10 text-destructive",
  },
  info: {
    icon: Info,
    classNames: "border-amber/30 bg-amber/10 text-amber",
  },
};

export function StatusBanner({
  variant,
  title,
  message,
  onDismiss,
  className,
}: StatusBannerProps) {
  const config = variantConfig[variant] ?? variantConfig.info;
  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4",
        config.classNames,
        className
      )}
    >
      <Icon className="h-5 w-5 shrink-0 mt-0.5" aria-hidden />
      <div className="flex-1 min-w-0">
        {title && (
          <p className="font-medium text-foreground">{title}</p>
        )}
        <p className="text-sm opacity-90">{message}</p>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded p-1 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-ring min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
}
