/**
 * Password reset flow orchestrator: request → sent (optional token) → set password → confirmation.
 * Supports magic link (token in URL) and manual token entry.
 */

import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { toast } from "sonner";
import * as authApi from "@/api/auth";
import { useAuth } from "@/contexts/auth-context";
import {
  RequestResetForm,
  TokenVerification,
  SetNewPasswordForm,
  ConfirmationScreen,
  InlineError,
} from "./index";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AnimatedPage } from "@/components/animated-page";

export type PasswordResetStep = "request" | "sent" | "set" | "done";

const SUCCESS_MESSAGE =
  "If this email is registered, you will receive a reset link. Check your inbox.";

export function PasswordResetPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const tokenFromUrl = searchParams.get("token") ?? undefined;
  const isResetRoute = location.pathname === "/auth/reset";

  // /auth/reset without token → redirect to request flow
  useEffect(() => {
    if (isResetRoute && !tokenFromUrl) {
      navigate("/password-reset", { replace: true });
    }
  }, [isResetRoute, tokenFromUrl, navigate]);

  const [step, setStep] = useState<PasswordResetStep>("request");
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSetting, setIsSetting] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [setPasswordError, setSetPasswordError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Magic link: token in URL → verify and go to set step
  useEffect(() => {
    if (!tokenFromUrl) return;
    let cancelled = false;
    setIsVerifying(true);
    setVerifyError(null);
    authApi
      .verifyPasswordResetToken(tokenFromUrl)
      .then((result) => {
        if (cancelled) return;
        if (result?.valid) {
          setResetToken(tokenFromUrl);
          setStep("set");
        } else {
          setVerifyError("This link is invalid or has expired. Request a new reset link.");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setVerifyError("Verification failed. Request a new reset link.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsVerifying(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tokenFromUrl]);

  const handleRequestSubmit = async (values: { email: string }) => {
    setIsRequesting(true);
    try {
      const result = await authApi.requestPasswordReset(values.email);
      setStep("sent");
      const msg = result?.message ?? SUCCESS_MESSAGE;
      toast.success(msg);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsRequesting(false);
    }
  };

  const handleTokenVerify = async (token: string) => {
    setIsVerifying(true);
    setVerifyError(null);
    try {
      const result = await authApi.verifyPasswordResetToken(token);
      if (result?.valid) {
        setResetToken(token);
        setStep("set");
        setVerifyError(null);
      } else {
        setVerifyError("Invalid or expired code. Check the code or request a new link.");
      }
    } catch {
      setVerifyError("Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSetPassword = async (values: { newPassword: string }) => {
    const t = resetToken ?? tokenFromUrl;
    if (!t) {
      toast.error("Reset session expired. Please start over.");
      setStep("request");
      return;
    }
    setIsSetting(true);
    setSetPasswordError(null);
    try {
      const result = await authApi.setNewPassword(t, values.newPassword);
      if (result?.success && result?.session) {
        setSession(result.session);
        setIsLoggedIn(true);
        setStep("done");
        toast.success("Password updated. You are signed in.");
        // Brief delay then redirect to dashboard
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 1500);
        return;
      }
      if (result?.success) {
        setIsLoggedIn(false);
        setStep("done");
        toast.success("Password updated. Sign in with your new password.");
      } else {
        setSetPasswordError("Failed to update password. The link may have expired.");
      }
    } catch {
      setSetPasswordError("Failed to update password. Please try again.");
    } finally {
      setIsSetting(false);
    }
  };

  const currentToken = resetToken ?? tokenFromUrl ?? null;
  const isMagicLinkFlow = Boolean(tokenFromUrl);

  return (
    <AnimatedPage className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-white/[0.03] bg-card shadow-card animate-fade-in-up">
        <CardHeader className="space-y-1 text-center">
          <Link
            to="/"
            className="text-xl font-semibold text-foreground hover:text-primary transition-colors"
          >
            LifeOps
          </Link>
          <CardTitle className="text-2xl">
            {step === "request" && "Reset password"}
            {step === "sent" && "Check your email"}
            {step === "set" && "Set new password"}
            {step === "done" && "All set"}
          </CardTitle>
          <CardDescription>
            {step === "request" && "Enter your email and we'll send a reset link."}
            {step === "sent" && "Use the link in the email or enter the code below."}
            {step === "set" && "Choose a strong password."}
            {step === "done" && "Your password has been updated."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Magic link: verifying token from URL */}
          {isMagicLinkFlow && isVerifying && (
            <p className="text-sm text-muted-foreground animate-fade-in">
              Verifying link…
            </p>
          )}
          {isMagicLinkFlow && verifyError && !isVerifying && (
            <InlineError
              message={verifyError}
              action={
                <Link
                  to="/password-reset"
                  className="text-primary hover:underline font-medium"
                >
                  Request a new link
                </Link>
              }
            />
          )}

          {step === "request" && !tokenFromUrl && (
            <RequestResetForm
              onSubmit={handleRequestSubmit}
              isSubmitting={isRequesting}
              successMessage={null}
            />
          )}

          {step === "sent" && (
            <TokenVerification
              mode="magic-link"
              onVerify={handleTokenVerify}
              isVerifying={isVerifying}
              error={verifyError}
              expiryMinutes={30}
            />
          )}

          {step === "set" && currentToken && !isVerifying && (
            <SetNewPasswordForm
              token={currentToken}
              onSubmit={handleSetPassword}
              isLoading={isSetting}
              error={setPasswordError ?? undefined}
              minStrength={2}
            />
          )}

          {step === "done" && (
            <ConfirmationScreen isLoggedIn={isLoggedIn} />
          )}

          {step !== "done" && (
            <p className="text-center text-sm text-muted-foreground pt-2">
              <Link to="/auth" className="text-primary hover:underline">
                Back to sign in
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </AnimatedPage>
  );
}
