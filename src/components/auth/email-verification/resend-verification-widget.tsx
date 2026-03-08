/**
 * Resend verification email widget with rate limiting and toast feedback.
 */

import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { resendVerification } from "@/api/auth";
import { cn } from "@/lib/utils";

export interface ResendVerificationWidgetProps {
  email?: string;
  userId?: string;
  onResend?: () => void;
  disabled?: boolean;
  /** When true, show email input when email/userId not provided */
  allowEmailInput?: boolean;
  className?: string;
}

export function ResendVerificationWidget({
  email,
  userId,
  onResend,
  disabled = false,
  allowEmailInput = true,
  className,
}: ResendVerificationWidgetProps) {
  const [isResending, setIsResending] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [emailInput, setEmailInput] = useState(email ?? "");

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const effectiveEmail = email ?? (emailInput.trim() || undefined);

  const handleResend = useCallback(async () => {
    if (isResending || cooldownSeconds > 0 || disabled) return;
    if (!effectiveEmail && !userId) {
      toast.error("Enter your email to resend the verification link.");
      return;
    }

    setIsResending(true);
    try {
      const result = await resendVerification({ email: effectiveEmail, userId });
      if (result?.success) {
        toast.success(result?.message ?? "Verification email sent. Check your inbox.");
        const nextRetry = result?.nextRetryInSeconds ?? 60;
        setCooldownSeconds(nextRetry);
        onResend?.();
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
          setCooldownSeconds((s) => {
            if (s <= 1 && intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
              return 0;
            }
            return s - 1;
          });
        }, 1000);
      } else {
        toast.error(result?.message ?? "Failed to send verification email. Try again later.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsResending(false);
    }
  }, [effectiveEmail, userId, isResending, cooldownSeconds, disabled, onResend]);

  const isDisabled = disabled || isResending || cooldownSeconds > 0;

  return (
    <div className={cn("space-y-3", className)}>
      {allowEmailInput && !email && !userId && (
        <div className="space-y-2">
          <Label htmlFor="resend-email">Email address</Label>
          <Input
            id="resend-email"
            type="email"
            placeholder="you@example.com"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            disabled={isDisabled}
            className="bg-secondary border-white/[0.03]"
          />
        </div>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={handleResend}
        disabled={isDisabled}
        aria-label={cooldownSeconds > 0 ? `Resend available in ${cooldownSeconds}s` : "Resend verification email"}
      >
        {isResending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Sending…
          </>
        ) : cooldownSeconds > 0 ? (
          `Resend in ${cooldownSeconds}s`
        ) : (
          "Resend verification email"
        )}
      </Button>
      <p className="text-xs text-muted-foreground">
        Check your spam folder. Links expire after 24 hours.
      </p>
    </div>
  );
}
