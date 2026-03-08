/**
 * 2FA setup wizard: QR/secret step, verify step, backup codes step.
 * Accessible, keyboard-navigable.
 */

import { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Download, CheckCircle } from "lucide-react";
import {
  useTwoFactorSetup,
  useTwoFactorVerify,
} from "@/hooks/use-profile";
import type { TwoFactorSetupResult } from "@/types/profile";

export interface TwoFactorSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type Step = "setup" | "verify" | "backup";

export function TwoFactorSetupModal({
  open,
  onOpenChange,
  onSuccess,
}: TwoFactorSetupModalProps) {
  const [step, setStep] = useState<Step>("setup");
  const [setupResult, setSetupResult] = useState<TwoFactorSetupResult | null>(null);
  const [verifyCode, setVerifyCode] = useState("");

  const setup2FA = useTwoFactorSetup();
  const verify2FA = useTwoFactorVerify();

  useEffect(() => {
    if (open) {
      setStep("setup");
      setSetupResult(null);
      setVerifyCode("");
    }
  }, [open]);

  const handleStartSetup = useCallback(() => {
    setStep("setup");
    setSetupResult(null);
    setVerifyCode("");
    setup2FA.mutate(undefined, {
      onSuccess: (data) => {
        setSetupResult(data ?? null);
        setStep("verify");
      },
    });
  }, [setup2FA]);

  const handleVerify = useCallback(() => {
    if (!verifyCode.trim() || verifyCode.length < 6) return;
    verify2FA.mutate(
      { token: verifyCode.trim() },
      {
        onSuccess: () => {
          setStep("backup");
        },
      }
    );
  }, [verifyCode, verify2FA]);

  const handleFinish = useCallback(() => {
    onSuccess();
    onOpenChange(false);
    setStep("setup");
    setSetupResult(null);
    setVerifyCode("");
  }, [onSuccess, onOpenChange]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next && step === "backup") {
        handleFinish();
        return;
      }
      onOpenChange(next);
      if (!next) {
        setStep("setup");
        setSetupResult(null);
        setVerifyCode("");
      }
    },
    [onOpenChange, step, handleFinish]
  );

  const backupCodes = (setupResult?.backupCodes ?? []) as string[];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="border-white/[0.06] bg-card sm:max-w-md"
        aria-describedby="2fa-setup-description"
      >
        <DialogHeader>
          <DialogTitle>Two-Factor Authentication</DialogTitle>
          <DialogDescription id="2fa-setup-description">
            {step === "setup" && "Start setup to get a QR code and backup codes."}
            {step === "verify" && "Enter the 6-digit code from your authenticator app."}
            {step === "backup" && "Save your backup codes in a safe place."}
          </DialogDescription>
        </DialogHeader>

        {step === "setup" && (
          <div className="py-4">
            <Button
              onClick={handleStartSetup}
              disabled={setup2FA.isPending}
              className="w-full"
            >
              {setup2FA.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Get QR code"
              )}
            </Button>
          </div>
        )}

        {step === "verify" && setupResult && (
          <div className="space-y-4 py-2">
            <div className="rounded-lg border border-white/[0.06] bg-secondary/30 p-4 flex flex-col items-center gap-3">
              {setupResult.qrCodeDataUrl ? (
                <img
                  src={setupResult.qrCodeDataUrl}
                  alt="QR code for authenticator app"
                  className="h-32 w-32 object-contain"
                />
              ) : null}
              {setupResult.secret && (
                <p className="text-xs text-muted-foreground font-mono break-all text-center">
                  Or enter manually: {setupResult.secret}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="2fa-verify-code">Verification code</Label>
              <Input
                id="2fa-verify-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="bg-input border-white/[0.03] font-mono text-center text-lg"
                aria-label="6-digit verification code"
              />
            </div>
            <DialogFooter>
              <Button
                onClick={handleVerify}
                disabled={verify2FA.isPending || verifyCode.length < 6}
              >
                {verify2FA.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Verify"
                )}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "backup" && (
          <div className="space-y-4 py-2">
            <div className="rounded-lg border border-white/[0.06] bg-secondary/30 p-4">
              <p className="text-sm text-muted-foreground mb-3">
                Store these backup codes securely. Each can be used once if you lose access to your authenticator.
              </p>
              <ul className="grid grid-cols-2 gap-2 text-sm font-mono" role="list">
                {(backupCodes ?? []).map((code, i) => (
                  <li key={i} className="rounded bg-background/50 px-2 py-1">
                    {code}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500 shrink-0" aria-hidden />
              <span>2FA is now enabled.</span>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const text = (backupCodes ?? []).join("\n");
                  const blob = new Blob([text], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "lifeops-2fa-backup-codes.txt";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download codes
              </Button>
              <Button onClick={handleFinish}>Done</Button>
            </DialogFooter>
          </div>
        )}

        {step === "setup" && !setup2FA.isPending && !setupResult && (
          <DialogFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
