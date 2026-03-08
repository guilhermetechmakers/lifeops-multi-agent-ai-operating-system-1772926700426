/**
 * GatedActionButton — A11y-conscious CTA for banners with disabled/enabled states.
 * Optional confirmation prompt; used in StatusBanner and NextStepsPanel.
 */

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface GatedActionButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  confirmMessage?: string;
  className?: string;
  children?: React.ReactNode;
}

export function GatedActionButton({
  label,
  onClick,
  disabled = false,
  loading = false,
  variant = "default",
  size = "default",
  confirmMessage,
  className,
  children,
  ...rest
}: GatedActionButtonProps) {
  const [confirming, setConfirming] = React.useState(false);
  const confirmTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDisabled = disabled || loading;

  React.useEffect(() => {
    return () => {
      if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
    };
  }, []);

  const handleClick = () => {
    if (isDisabled) return;
    if (confirmMessage && !confirming) {
      setConfirming(true);
      confirmTimeoutRef.current = window.setTimeout(() => {
        setConfirming(false);
        confirmTimeoutRef.current = null;
      }, 3000);
      return;
    }
    if (confirmTimeoutRef.current) {
      clearTimeout(confirmTimeoutRef.current);
      confirmTimeoutRef.current = null;
    }
    setConfirming(false);
    onClick();
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isDisabled}
      className={cn(
        "min-h-[44px] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
        className
      )}
      aria-label={label}
      aria-busy={loading}
      {...rest}
    >
      {children ?? label}
    </Button>
  );
}
