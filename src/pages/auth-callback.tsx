import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { exchangeOAuthCallback } from "@/api/auth";
import { AnimatedPage } from "@/components/animated-page";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setSession, isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
      return;
    }

    const provider = searchParams.get("provider") ?? "google";
    const code = searchParams.get("code") ?? undefined;
    const state = searchParams.get("state") ?? undefined;
    const mock = searchParams.get("mock") ?? undefined;

    let cancelled = false;

    (async () => {
      try {
        const response = await exchangeOAuthCallback(provider, {
          code,
          state,
          mock,
        });
        if (cancelled) return;
        if (response?.token && response?.user) {
          setSession(response);
          navigate("/dashboard", { replace: true });
        } else {
          setError("Sign-in could not be completed.");
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Sign-in failed.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, setSession, navigate, isAuthenticated]);

  if (error) {
    return (
      <AnimatedPage className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <a
            href="/auth"
            className="text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            Back to sign in
          </a>
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
      <span className="sr-only">Completing sign in…</span>
    </AnimatedPage>
  );
}
