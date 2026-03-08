/**
 * Step 2: Token entry (manual code) or magic-link confirmation.
 * Verify button and optional expiry countdown.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ValidationMessage } from "@/components/auth/validation-message";
import { Mail } from "lucide-react";

export interface TokenVerificationProps {
  /** Magic link flow: show "check your email" and optional token entry */
  mode?: "magic-link" | "token-entry";
  onVerify: (token: string) => Promise<boolean | void>;
  isVerifying?: boolean;
  error?: string | null;
  /** Expiry minutes for countdown (optional) */
  expiryMinutes?: number;
  expiresInMinutes?: number;
  className?: string;
}

export function TokenVerification({
  mode = "token-entry",
  onVerify,
  isVerifying = false,
  error = null,
  expiryMinutes,
  expiresInMinutes,
  className,
}: TokenVerificationProps) {
  const expiry = expiryMinutes ?? expiresInMinutes;
  const [token, setToken] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = token.trim();
    if (!t) return;
    await onVerify(t);
  };

  return (
    <div className={className}>
      {mode === "magic-link" && (
        <div
          role="status"
          className="mb-4 flex items-start gap-3 rounded-lg border border-white/[0.03] bg-secondary/50 px-4 py-3 text-sm text-muted-foreground animate-fade-in"
        >
          <Mail className="h-5 w-5 shrink-0 text-teal" aria-hidden />
          <div>
            <p className="font-medium text-foreground">Check your email</p>
            <p className="mt-1">
              If this email is registered, you will receive a reset link. Click it to continue, or enter the code below.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="reset-token">Reset code</Label>
          <Input
            id="reset-token"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="Enter code from email"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="bg-input border-white/[0.03] font-mono tracking-widest"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "token-error" : undefined}
            disabled={isVerifying}
          />
          <ValidationMessage id="token-error" message={error ?? undefined} type="error" />
        </div>
        {expiry != null && expiry > 0 && (
          <p className="text-micro text-muted-foreground">
            Code expires in {expiry} minutes.
          </p>
        )}
        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          disabled={!token.trim() || isVerifying}
        >
          {isVerifying ? "Verifying…" : "Verify"}
        </Button>
      </form>
    </div>
  );
}
