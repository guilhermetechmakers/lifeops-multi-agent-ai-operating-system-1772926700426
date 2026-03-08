/**
 * OnboardingResourcesPanel — Guided onboarding steps with progress and checklists.
 * Data: steps array; guarded. Progress computed from completed count.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SectionTitle } from "./section-title";
import { Check, Circle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OnboardingStep } from "@/types/about-help";
import { setOnboardingStepCompleted } from "@/api/about-help";

interface OnboardingResourcesPanelProps {
  steps?: OnboardingStep[] | null;
  className?: string;
}

export function OnboardingResourcesPanel({
  steps: stepsProp,
  className,
}: OnboardingResourcesPanelProps) {
  const initialSteps = Array.isArray(stepsProp) ? stepsProp : (stepsProp ?? []);
  const [steps, setSteps] = useState<OnboardingStep[]>(initialSteps);

  const completedCount = steps.filter((s) => s.completed).length;
  const total = steps.length;
  const progressPct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const toggleStep = async (stepId: string) => {
    const step = steps.find((s) => s.id === stepId);
    if (!step) return;
    const nextCompleted = !step.completed;
    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, completed: nextCompleted } : s))
    );
    try {
      await setOnboardingStepCompleted(stepId, nextCompleted);
    } catch {
      setSteps((prev) =>
        prev.map((s) => (s.id === stepId ? { ...s, completed: step.completed } : s))
      );
    }
  };

  return (
    <Card
      className={cn(
        "rounded-xl border border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B] shadow-card transition-all duration-200",
        className
      )}
    >
      <CardHeader className="pb-3">
        <SectionTitle>Onboarding resources</SectionTitle>
        <p className="text-sm text-muted-foreground">
          Guided steps to get the most out of LifeOps.
        </p>
        {total > 0 ? (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{completedCount} of {total} completed</span>
              <span>{progressPct}%</span>
            </div>
            <Progress value={progressPct} className="mt-1 h-2" />
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="p-0 pt-0">
        <ul className="space-y-2" role="list" aria-label="Onboarding checklist">
          {(steps ?? []).map((step) => (
            <li key={step.id}>
              <div
                className={cn(
                  "flex items-start gap-3 rounded-lg border border-white/[0.03] bg-card/50 p-3 transition-colors hover:bg-secondary/30"
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleStep(step.id)}
                  className={cn(
                    "mt-0.5 shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    step.completed ? "text-teal" : "text-muted-foreground"
                  )}
                  aria-label={step.completed ? "Mark incomplete" : "Mark complete"}
                >
                  {step.completed ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <h3
                    className={cn(
                      "font-medium text-foreground",
                      step.completed && "text-muted-foreground line-through"
                    )}
                  >
                    {step.title ?? "Untitled"}
                  </h3>
                  {step.description ? (
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  ) : null}
                  {step.link ? (
                    <Link
                      to={step.link}
                      className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      Open <ExternalLink className="h-3 w-3" />
                    </Link>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
        {steps.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No onboarding steps available.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
