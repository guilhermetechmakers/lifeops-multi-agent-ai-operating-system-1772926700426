/**
 * NextStepsPanel — Compact list of recommended next actions after a success.
 * Guards with Array.isArray and defaults to [].
 */

import * as React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NextStep } from "@/types/loading-success";

export interface NextStepsPanelProps {
  steps?: NextStep[] | null;
  onNavigate?: (step: NextStep) => void;
  className?: string;
}

export function NextStepsPanel({
  steps: propsSteps,
  onNavigate,
  className,
}: NextStepsPanelProps) {
  const navigate = useNavigate();
  const steps = React.useMemo(() => {
    const list = propsSteps ?? [];
    return Array.isArray(list) ? list : [];
  }, [propsSteps]);

  const handleStepClick = React.useCallback(
    (step: NextStep) => {
      if (typeof onNavigate === "function") {
        onNavigate(step);
        return;
      }
      if (step.href) {
        if (step.href.startsWith("http")) {
          window.open(step.href, "_blank", "noopener,noreferrer");
        } else {
          navigate(step.href);
        }
      }
    },
    [onNavigate, navigate]
  );

  if (steps.length === 0) return null;

  return (
    <section
      className={cn("space-y-3", className)}
      aria-label="Recommended next steps"
    >
      <h3 className="text-sm font-medium text-foreground">Next steps</h3>
      <ul className="space-y-2" role="list">
        {steps.map((step, idx) => (
          <li key={idx}>
            <button
              type="button"
              onClick={() => handleStepClick(step)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg border border-white/[0.03]",
                "bg-secondary/30 px-4 py-3 text-left transition-all duration-200",
                "hover:bg-secondary/50 hover:border-white/[0.06]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              )}
              aria-label={step.description ? `${step.title}: ${step.description}` : step.title}
            >
              <span className="flex-1">
                <span className="text-sm font-medium text-foreground">
                  {step.title}
                </span>
                {step.description && (
                  <span className="block text-xs text-muted-foreground mt-0.5">
                    {step.description}
                  </span>
                )}
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
