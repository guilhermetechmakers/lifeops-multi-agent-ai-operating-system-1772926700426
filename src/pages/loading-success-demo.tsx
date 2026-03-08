/**
 * Demo page for Loading / Success / Failure UI primitives.
 * Accessible at /dashboard/loading-success-demo for validation and integration.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatedPage } from "@/components/animated-page";
import {
  LoadingSpinner,
  StatusBanner,
  ErrorSnippet,
  NextStepsPanel,
  InlineMessage,
} from "@/components/loading-success";
import { Button } from "@/components/ui/button";
import type { StatusBannerVariant, NextStep } from "@/types/loading-success";

export default function LoadingSuccessDemoPage() {
  const navigate = useNavigate();
  const [bannerVariant, setBannerVariant] = useState<StatusBannerVariant>("loading");

  const nextSteps: NextStep[] = [
    { title: "View artifacts", description: "Open run outputs", href: "/dashboard/artifacts" },
    { title: "Schedule next run", description: "Configure cron", href: "/dashboard/cronjobs" },
    { title: "Back to dashboard", href: "/dashboard" },
  ];

  const handleNavigate = (step: NextStep) => {
    if (step.href) navigate(step.href);
  };

  return (
    <AnimatedPage className="space-y-8 max-w-3xl">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Loading &amp; Success States
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Reusable primitives for in-flight operations, success banners, and failure states.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">LoadingSpinner</h2>
        <div className="flex flex-wrap gap-6 p-4 rounded-xl border border-white/[0.03] bg-card/50">
          <LoadingSpinner size="xs" label="Small" status="loading" />
          <LoadingSpinner size="sm" label="Syncing…" description="Fetching data…" status="loading" />
          <LoadingSpinner size="md" label="Processing update…" status="loading" />
          <LoadingSpinner size="lg" label="Running job…" description="This may take a moment." status="loading" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">StatusBanner</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {(["loading", "success", "failure"] as const).map((v) => (
            <Button
              key={v}
              variant={bannerVariant === v ? "default" : "outline"}
              size="sm"
              onClick={() => setBannerVariant(v)}
            >
              {v}
            </Button>
          ))}
        </div>
        <StatusBanner
          variant={bannerVariant}
          title={
            bannerVariant === "loading"
              ? "Syncing data…"
              : bannerVariant === "success"
                ? "Data sync complete"
                : "Sync failed"
          }
          subtitle={
            bannerVariant === "success"
              ? "Run 1234 completed. Artifacts available."
              : bannerVariant === "failure"
                ? "The operation could not be completed."
                : "This may take a few seconds."
          }
          timestamp={bannerVariant !== "loading" ? new Date().toISOString() : undefined}
          actions={
            bannerVariant === "success"
              ? [
                  { label: "View artifacts", onClick: () => navigate("/dashboard/artifacts"), kind: "primary" as const },
                  { label: "Close", onClick: () => {}, kind: "secondary" as const },
                ]
              : bannerVariant === "failure"
                ? [{ label: "Retry", onClick: () => setBannerVariant("loading"), kind: "primary" as const }]
                : []
          }
          error={
            bannerVariant === "failure"
              ? { errorCode: "SYNC_FAILED", message: "Connection timed out.", details: "Retry in a few minutes." }
              : undefined
          }
          retryHandler={bannerVariant === "failure" ? () => setBannerVariant("loading") : undefined}
          nextSteps={bannerVariant === "success" ? nextSteps : []}
          onNavigate={handleNavigate}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">ErrorSnippet</h2>
        <ErrorSnippet
          errorCode="RATE_LIMITED"
          message="Too many requests. Please try again later."
          details="Retry after 60 seconds."
          retryHandler={() => {}}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">NextStepsPanel</h2>
        <NextStepsPanel steps={nextSteps} onNavigate={handleNavigate} />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">InlineMessage</h2>
        <div className="flex flex-col gap-2">
          <InlineMessage variant="success" message="Preferences saved." />
          <InlineMessage variant="info" message="Checking for updates…" />
          <InlineMessage variant="error" message="Could not save. Please retry." />
        </div>
      </section>
    </AnimatedPage>
  );
}
