/**
 * PlanSelector — tier cards, feature matrix, monthly/yearly toggle.
 * Upgrade/downgrade hints; accessibility and keyboard nav.
 */

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import type { Plan } from "@/types/checkout";

export interface PlanSelectorProps {
  plans: Plan[];
  selectedPlanId: string;
  onSelect: (planId: string) => void;
  cadence: "monthly" | "yearly";
  onCadenceChange: (cadence: "monthly" | "yearly") => void;
  isLoading?: boolean;
  prorationNotice?: string;
  className?: string;
}

export function PlanSelector({
  plans,
  selectedPlanId,
  onSelect,
  cadence,
  onCadenceChange,
  isLoading = false,
  prorationNotice,
  className,
}: PlanSelectorProps) {
  const safePlans = Array.isArray(plans) ? plans : [];

  const displayPrice = (plan: Plan) =>
    cadence === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;

  const yearlySavings = useMemo(() => {
    if (safePlans.length === 0) return null;
    const first = safePlans[0];
    const monthlyYear = (first?.monthlyPrice ?? 0) * 12;
    const yearly = first?.yearlyPrice ?? 0;
    if (monthlyYear <= 0) return null;
    const pct = Math.round((1 - yearly / monthlyYear) * 100);
    return pct > 0 ? pct : null;
  }, [safePlans]);

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-foreground">Choose your plan</h2>
        <div
          className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-card p-1"
          role="group"
          aria-label="Billing cadence"
        >
          <Button
            type="button"
            variant={cadence === "monthly" ? "default" : "ghost"}
            size="sm"
            onClick={() => onCadenceChange("monthly")}
            aria-pressed={cadence === "monthly"}
            className="min-w-[44px] min-h-[44px]"
          >
            Monthly
          </Button>
          <Button
            type="button"
            variant={cadence === "yearly" ? "default" : "ghost"}
            size="sm"
            onClick={() => onCadenceChange("yearly")}
            aria-pressed={cadence === "yearly"}
            className="min-w-[44px] min-h-[44px]"
          >
            Yearly
          </Button>
          {yearlySavings != null && yearlySavings > 0 && (
            <span className="ml-2 rounded bg-teal/20 px-2 py-1 text-xs font-medium text-teal">
              Save {yearlySavings}%
            </span>
          )}
        </div>
      </div>

      {prorationNotice && (
        <p className="text-sm text-amber" role="status">
          {prorationNotice}
        </p>
      )}

      <div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        role="radiogroup"
        aria-label="Subscription plans"
      >
        {safePlans.map((plan) => {
          const isSelected = selectedPlanId === plan.id;
          const price = displayPrice(plan);
          const features = Array.isArray(plan.features) ? plan.features : [];

          return (
            <Card
              key={plan.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-card-hover",
                isSelected &&
                  "ring-2 ring-primary border-primary/50 shadow-card-hover"
              )}
              onClick={() => onSelect(plan.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(plan.id);
                }
              }}
              tabIndex={0}
              role="radio"
              aria-checked={isSelected}
              aria-label={`${plan.name} plan, $${price} per ${cadence === "yearly" ? "year" : "month"}`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  {plan.name}
                </CardTitle>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-foreground">
                    ${price}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    /{cadence === "yearly" ? "year" : "month"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <ul className="space-y-2" aria-label="Plan features">
                  {features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <Check
                        className="h-4 w-4 shrink-0 text-teal"
                        aria-hidden
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  className="w-full min-h-[44px]"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(plan.id);
                  }}
                >
                  {isSelected ? "Selected" : "Select plan"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {isLoading && (
        <div
          className="animate-pulse rounded-lg border border-white/[0.06] bg-card p-6"
          aria-busy="true"
          aria-label="Loading plans"
        >
          <div className="h-6 w-32 rounded bg-white/10" />
          <div className="mt-4 h-4 w-full rounded bg-white/10" />
          <div className="mt-2 h-4 w-3/4 rounded bg-white/10" />
        </div>
      )}
    </div>
  );
}

