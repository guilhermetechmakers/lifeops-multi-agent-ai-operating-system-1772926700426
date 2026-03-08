/**
 * Checkout progress: Plan → Billing → Review → Confirm.
 * Accessible, keyboard-friendly, with clear active/completed states.
 */

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export type CheckoutStepId = "plan" | "billing" | "review" | "confirm";

const STEPS: { id: CheckoutStepId; label: string }[] = [
  { id: "plan", label: "Plan" },
  { id: "billing", label: "Billing" },
  { id: "review", label: "Review" },
  { id: "confirm", label: "Confirm" },
];

export interface ProgressStepperProps {
  currentStep: CheckoutStepId;
  className?: string;
}

export function ProgressStepper({ currentStep, className }: ProgressStepperProps) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;

  return (
    <nav
      aria-label="Checkout progress"
      className={cn("w-full", className)}
    >
      <ol className="flex items-center justify-between gap-2">
        {(STEPS ?? []).map((step, index) => {
          const isCompleted = index < safeIndex;
          const isCurrent = index === safeIndex;
          return (
            <li
              key={step.id}
              className={cn(
                "flex flex-1 items-center transition-opacity duration-200",
                index < STEPS.length - 1 && "after:content-[''] after:flex-1 after:border-t after:border-white/[0.06] after:mx-2"
              )}
              aria-current={isCurrent ? "step" : undefined}
            >
              <span
                className={cn(
                  "flex min-w-[44px] min-h-[44px] items-center justify-center rounded-full border-2 text-sm font-medium transition-all duration-200",
                  isCompleted &&
                    "border-primary bg-primary text-primary-foreground",
                  isCurrent &&
                    "border-primary bg-primary/10 text-primary ring-2 ring-primary/30",
                  !isCompleted &&
                    !isCurrent &&
                    "border-white/10 bg-card text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" aria-hidden />
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={cn(
                  "ml-2 hidden text-sm font-medium sm:inline",
                  isCurrent ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
