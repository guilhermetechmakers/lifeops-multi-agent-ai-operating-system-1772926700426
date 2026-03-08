/**
 * SummaryPanel — live cost breakdown: plan, tax, discount, usage estimate, first billing date, total.
 * Updates as plan, promo, or usage changes.
 */

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { PriceBreakdown } from "@/types/checkout";

export interface SummaryPanelProps {
  priceBreakdown: PriceBreakdown | null;
  nextBillingDate: string | null;
  planName?: string;
  prorationNotes?: string[];
  onConfirm?: () => void;
  isSubmitting?: boolean;
  disabled?: boolean;
  className?: string;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function SummaryPanel({
  priceBreakdown,
  nextBillingDate,
  planName,
  prorationNotes,
  onConfirm,
  isSubmitting = false,
  disabled = false,
  className,
}: SummaryPanelProps) {
  const breakdown = priceBreakdown ?? {
    planPrice: 0,
    discount: 0,
    tax: 0,
    usageEstimate: 0,
    totalDueToday: 0,
    currency: "USD",
  };

  const lines = useMemo(() => {
    const list: { label: string; value: number; muted?: boolean }[] = [
      { label: "Plan", value: breakdown.planPrice },
    ];
    if ((breakdown.discount ?? 0) > 0) {
      list.push({ label: "Discount", value: -breakdown.discount!, muted: true });
    }
    if ((breakdown.tax ?? 0) > 0) {
      list.push({ label: "Tax / VAT", value: breakdown.tax! });
    }
    if ((breakdown.usageEstimate ?? 0) > 0) {
      list.push({
        label: "Usage estimate (LLM/API)",
        value: breakdown.usageEstimate!,
      });
    }
    return list;
  }, [breakdown]);

  const total = breakdown.totalDueToday ?? 0;
  const currency = breakdown.currency ?? "USD";

  return (
    <Card className={cn("sticky top-24", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Order summary</CardTitle>
        {planName && (
          <p className="text-sm text-muted-foreground">{planName}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <dl className="space-y-2">
          {lines.map((line) => (
            <div
              key={line.label}
              className="flex justify-between text-sm"
            >
              <dt className={cn(line.muted && "text-muted-foreground")}>
                {line.label}
              </dt>
              <dd
                className={cn(
                  "font-medium",
                  line.muted && "text-muted-foreground"
                )}
              >
                {line.value < 0
                  ? `-${formatCurrency(Math.abs(line.value), currency)}`
                  : formatCurrency(line.value, currency)}
              </dd>
            </div>
          ))}
        </dl>
        <div className="border-t border-white/[0.06] pt-3">
          <div className="flex justify-between text-base font-semibold">
            <span>Total due today</span>
            <span>{formatCurrency(total, currency)}</span>
          </div>
        </div>
        {nextBillingDate && (
          <p className="text-xs text-muted-foreground">
            First billing date:{" "}
            {new Date(nextBillingDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        )}
        {prorationNotes && prorationNotes.length > 0 && (
          <ul className="text-xs text-muted-foreground space-y-1">
            {prorationNotes.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
        )}
        {onConfirm && (
          <Button
            type="button"
            className="w-full mt-4 min-h-[44px]"
            onClick={onConfirm}
            disabled={disabled || isSubmitting}
          >
            {isSubmitting ? "Processing…" : "Confirm / Subscribe"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
