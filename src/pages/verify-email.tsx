/**
 * Email Verification Page - processes verification links, shows success/error states.
 * Route: /verify-email?token=XYZ or /verify-email/:token
 */

import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useSearchParams, useParams } from "react-router-dom";
import { verifyEmail, type VerifyEmailSuccess } from "@/api/auth";
import { useAuth } from "@/contexts/auth-context";
import {
  VerificationStatusBanner,
  ResendVerificationWidget,
  OnboardingOrDashboardCTA,
} from "@/components/auth/email-verification";
import { SupportContactLink } from "@/components/auth/support-contact-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedPage } from "@/components/animated-page";

type VerificationStatus = "idle" | "loading" | "success" | "error";

const ERROR_MESSAGES: Record<string, string> = {
  TOKEN_EXPIRED: "This verification link has expired. Request a new one.",
  TOKEN_INVALID: "This verification link is invalid. Request a new one.",
  ALREADY_VERIFIED: "This email is already verified. You can sign in.",
  USER_NOT_FOUND: "We couldn't find an account for this link. Request a new verification email.",
  RATE_LIMIT_EXCEEDED: "Too many requests. Please wait before requesting another email.",
};

function getErrorMessage(errorCode: string): string {
  return ERROR_MESSAGES[errorCode] ?? "Verification failed. Please try again.";
}

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const { token: tokenFromPath } = useParams<{ token?: string }>();
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("idle");
  const [message, setMessage] = useState("");
  const [errorCode, setErrorCode] = useState<string>("");
  const [userPath, setUserPath] = useState<"onboarding" | "dashboard">("dashboard");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userId, setUserId] = useState<string>("");

  const token = (searchParams.get("token") ?? tokenFromPath ?? "").trim();

  const runVerification = useCallback(async () => {
    if (!token || token.length < 1) {
      setVerificationStatus("error");
      setErrorCode("TOKEN_INVALID");
      setMessage("No verification token found. Check your email for the full link.");
      return;
    }

    setVerificationStatus("loading");
    setMessage("");
    setErrorCode("");

    const result = await verifyEmail(token);

    if (result?.success === true) {
      const successData = result as VerifyEmailSuccess;
      setVerificationStatus("success");
      setMessage("Your email has been verified. You can now continue.");
      setUserPath(successData?.next === "onboarding" ? "onboarding" : "dashboard");
      setUserEmail(successData?.user?.email ?? "");
      setUserId(successData?.user?.id ?? "");

      const sessionData = successData?.session;
      if (sessionData?.token && sessionData?.user) {
        setSession(sessionData);
      }
    } else {
      const failData = result as { errorCode?: string; message?: string };
      setVerificationStatus("error");
      setErrorCode(failData?.errorCode ?? "TOKEN_INVALID");
      setMessage(failData?.message ?? getErrorMessage(failData?.errorCode ?? "TOKEN_INVALID"));
    }
  }, [token, setSession]);

  useEffect(() => {
    if (verificationStatus === "idle" && token) {
      runVerification();
    } else if (verificationStatus === "idle" && !token) {
      setVerificationStatus("error");
      setErrorCode("TOKEN_INVALID");
      setMessage("No verification token found. Check your email for the full link.");
    }
  }, [token, verificationStatus, runVerification]);

  return (
    <AnimatedPage className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md border-white/[0.03] bg-card shadow-card animate-fade-in-up">
        <CardHeader className="space-y-1 text-center pb-2">
          <Link
            to="/"
            className="text-xl font-semibold text-foreground hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            LifeOps
          </Link>
          <CardTitle className="text-2xl">Email verification</CardTitle>
          <CardDescription>
            {verificationStatus === "loading"
              ? "Verifying your email…"
              : verificationStatus === "success"
                ? "Your email has been verified"
                : verificationStatus === "error"
                  ? "Verification issue"
                  : "Confirm your email address"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {verificationStatus === "loading" && (
            <div className="space-y-3" role="status" aria-live="polite">
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          )}

          {verificationStatus === "success" && (
            <>
              <VerificationStatusBanner
                status="success"
                headline="Email verified"
                description={message}
              />
              <OnboardingOrDashboardCTA
                targetPath={userPath}
                infoText={
                  userPath === "onboarding"
                    ? "Complete your profile and set up your workspace."
                    : "You're all set. Head to your dashboard."
                }
              />
            </>
          )}

          {verificationStatus === "error" && (
            <>
              <VerificationStatusBanner
                status="error"
                headline="Verification failed"
                description={message}
                actionLabel={errorCode === "ALREADY_VERIFIED" ? "Sign in" : undefined}
                actionCallback={
                  errorCode === "ALREADY_VERIFIED"
                    ? () => navigate("/auth", { replace: true })
                    : undefined
                }
              />
              {errorCode !== "ALREADY_VERIFIED" && (
                <ResendVerificationWidget
                  email={userEmail || undefined}
                  userId={userId || undefined}
                />
              )}
              <div className="space-y-2 pt-2">
                <p className="text-xs text-muted-foreground">
                  Links expire after 24 hours. Check your spam folder.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    to="/auth"
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    Back to sign in
                  </Link>
                  <SupportContactLink showIcon={false} className="text-sm" />
                </div>
              </div>
            </>
          )}

          {verificationStatus === "idle" && !token && (
            <p className="text-sm text-muted-foreground">
              No verification token found. Use the link from your email.
            </p>
          )}
        </CardContent>
      </Card>
    </AnimatedPage>
  );
}
