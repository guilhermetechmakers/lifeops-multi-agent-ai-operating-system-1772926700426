/**
 * InlineMessage — Lightweight in-context messaging for non-blocking updates.
 * Toast-ish inline feedback (success, error, info) without leaving the page.
 */
import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type InlineMessageVariant = "success" | "error" | "info";

const variantConfig: Record<
  InlineMessageVariant,
  { icon: typeof CheckCircle2; className: string }
> = {
  success: {
    icon: CheckCircle2,
    className: "border-teal/30 bg-teal/10 text-teal",
  },
  error: {
    icon: AlertCircle,
    className: "border-destructive/30 bg-destructive/10 text-destructive",
  },
  info: {
    icon: Info,
    className: "border-amber-500/30 bg-amber-500/10 text-amber-500",
  },
};

export interface InlineMessageProps {
  variant: InlineMessageVariant;
  message: string;
  className?: string;
}

export function InlineMessage({
  variant,
  message,
  className,
}: InlineMessageProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm animate-fade-in duration-200",
        config.className,
        className
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      <span className="font-medium">{message}</span>
    </div>
  );
}
