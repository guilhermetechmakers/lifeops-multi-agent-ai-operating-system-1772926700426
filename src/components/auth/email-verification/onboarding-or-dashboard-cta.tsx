/**
 * CTA to proceed to onboarding or dashboard based on user state.
 */

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface OnboardingOrDashboardCTAProps {
  targetPath: "onboarding" | "dashboard";
  infoText?: string;
  className?: string;
}

const ROUTES = {
  onboarding: "/dashboard",
  dashboard: "/dashboard",
} as const;

export function OnboardingOrDashboardCTA({
  targetPath,
  infoText,
  className,
}: OnboardingOrDashboardCTAProps) {
  const path = ROUTES[targetPath] ?? "/dashboard";
  const label =
    targetPath === "onboarding"
      ? "Go to Onboarding"
      : "Continue to Dashboard";

  return (
    <div className={cn("space-y-2", className)}>
      <Button asChild size="lg" className="w-full sm:w-auto">
        <Link to={path}>
          {label}
          <ArrowRight className="h-4 w-4 ml-2" aria-hidden />
        </Link>
      </Button>
      {infoText && (
        <p className="text-sm text-muted-foreground">{infoText}</p>
      )}
    </div>
  );
}
