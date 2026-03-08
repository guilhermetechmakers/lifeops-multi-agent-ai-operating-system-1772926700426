import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EmailAuthForm } from "./email-auth-form";
import { SocialOAuthButtons } from "./social-oauth-buttons";
import { EnterpriseSSOSection } from "./enterprise-sso-section";
import { ForgotPasswordLink } from "./forgot-password-link";
import { SupportContactLink } from "./support-contact-link";
import { OnboardingWizardModal } from "./onboarding-wizard-modal";
import { useAuth } from "@/contexts/auth-context";
import { getProviders, initiateOAuth } from "@/api/auth";
import type { OAuthProvider } from "@/types/auth";
import type { LoginFormValues, SignupFormValues } from "./email-auth-form";
import { cn } from "@/lib/utils";

export interface AuthContainerProps {
  defaultMode?: "login" | "signup";
  className?: string;
}

const RATE_LIMIT_THRESHOLD = 5;
const RATE_LIMIT_COOLDOWN_MS = 60_000;

export function AuthContainer({
  defaultMode = "login",
  className,
}: AuthContainerProps) {
  const navigate = useNavigate();
  const { login, signup, isAuthenticated, isLoading } = useAuth();
  const [mode, setMode] = React.useState<"login" | "signup">(defaultMode);
  const [providers, setProviders] = React.useState<OAuthProvider[]>([]);
  const [onboardingOpen, setOnboardingOpen] = React.useState(false);
  const [onboardingSessionId, setOnboardingSessionId] = React.useState("");
  const [failedAttempts, setFailedAttempts] = React.useState(0);
  const [cooldownUntil, setCooldownUntil] = React.useState<number>(0);
  const [cooldownRemaining, setCooldownRemaining] = React.useState(0);

  React.useEffect(() => {
    if (isAuthenticated && !onboardingOpen) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, onboardingOpen, navigate]);

  React.useEffect(() => {
    getProviders().then((p) => setProviders(p ?? []));
  }, []);

  React.useEffect(() => {
    if (cooldownUntil <= 0) return;
    const interval = setInterval(() => {
      const remaining = Math.ceil((cooldownUntil - Date.now()) / 1000);
      setCooldownRemaining(remaining);
      if (remaining <= 0) {
        setCooldownUntil(0);
        setFailedAttempts(0);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownUntil]);

  const isRateLimited = cooldownUntil > Date.now();

  const handleLoginSubmit = React.useCallback(
    async (values: LoginFormValues | SignupFormValues) => {
      if (mode === "login") {
        if (isRateLimited) return;
        const v = values as LoginFormValues;
        try {
          await login(v.email, v.password, v.rememberMe);
          setFailedAttempts(0);
          navigate("/dashboard", { replace: true });
        } catch (err) {
          const next = failedAttempts + 1;
          setFailedAttempts(next);
          if (next >= RATE_LIMIT_THRESHOLD) {
            setCooldownUntil(Date.now() + RATE_LIMIT_COOLDOWN_MS);
            setCooldownRemaining(Math.ceil(RATE_LIMIT_COOLDOWN_MS / 1000));
          }
          throw err;
        }
      } else {
        const v = values as SignupFormValues;
        const response = await signup({
          email: v.email,
          password: v.password,
          displayName: v.displayName,
          company: v.company,
          inviteCode: v.inviteCode,
          acceptTerms: v.acceptTerms,
        });
        const sessionId = response?.user?.id ?? "mock-session";
        setOnboardingSessionId(sessionId);
        setOnboardingOpen(true);
      }
    },
    [mode, login, signup, navigate, failedAttempts, isRateLimited]
  );

  const handleOAuthInitiate = React.useCallback(async (providerId: string) => {
    const { url } = await initiateOAuth(providerId);
    if (url) window.location.href = url;
  }, []);

  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center bg-background px-4 py-8",
        className
      )}
    >
      <Card className="w-full max-w-md border-white/[0.03] bg-card shadow-card animate-fade-in-up">
        <CardHeader className="space-y-1 text-center pb-2">
          <Link
            to="/"
            className="text-xl font-semibold text-foreground hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            LifeOps
          </Link>
          <CardTitle className="text-2xl">
            {mode === "login" ? "Sign in" : "Create account"}
          </CardTitle>
          <CardDescription>
            {mode === "login"
              ? "Enter your email and password"
              : "Enter your details to get started"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs
            value={mode}
            onValueChange={(v) => setMode(v as "login" | "signup")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-secondary border border-white/[0.03]">
              <TabsTrigger value="login">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="mt-4 space-y-4">
              {isRateLimited && (
                <div
                  role="alert"
                  className="rounded-md border border-amber/50 bg-amber/10 px-3 py-2 text-sm text-amber"
                >
                  Too many failed attempts. Try again in {cooldownRemaining} seconds.
                </div>
              )}
              <EmailAuthForm
                mode="login"
                onSubmit={handleLoginSubmit}
                isLoading={isLoading}
                disabled={isRateLimited}
              />
              <div className="flex items-center justify-between text-sm">
                <ForgotPasswordLink />
              </div>
            </TabsContent>
            <TabsContent value="signup" className="mt-4 space-y-4">
              <EmailAuthForm
                mode="signup"
                onSubmit={handleLoginSubmit}
                isLoading={isLoading}
              />
            </TabsContent>
          </Tabs>

          <Separator className="bg-white/[0.06]" />

          <SocialOAuthButtons
            providers={providers}
            onInitiate={handleOAuthInitiate}
            disabled={isLoading}
          />

          <EnterpriseSSOSection
            onError={(err) => toast.error(err.message)}
          />

          <div className="text-center">
            <SupportContactLink />
          </div>
        </CardContent>
      </Card>

      <OnboardingWizardModal
        open={onboardingOpen}
        onOpenChange={setOnboardingOpen}
        sessionId={onboardingSessionId}
        onComplete={() => navigate("/dashboard", { replace: true })}
      />
    </div>
  );
}
