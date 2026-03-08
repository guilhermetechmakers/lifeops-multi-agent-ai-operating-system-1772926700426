/**
 * BillingSummaryCard — Plan, usage, invoices.
 */

import { Link } from "react-router-dom";
import { CreditCard, FileText, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBilling } from "@/hooks/use-profile";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export function BillingSummaryCard() {
  const { billing, isLoading } = useBilling();
  const invoices = billing?.invoices ?? [];

  if (isLoading) {
    return (
      <Card className="border-white/[0.03] bg-card card-health">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/[0.03] bg-card card-health">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Billing summary
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Plan, usage, and invoices
          </p>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link to="/dashboard/profile/billing">
            Manage billing
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-white/[0.03] bg-secondary/50 p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Plan
            </p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {billing?.planName ?? "—"}
            </p>
          </div>
          <div className="rounded-lg border border-white/[0.03] bg-secondary/50 p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Seats
            </p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {billing?.seats ?? 0}
            </p>
          </div>
          <div className="rounded-lg border border-white/[0.03] bg-secondary/50 p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Renewal
            </p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {billing?.renewalDate
                ? format(new Date(billing.renewalDate), "MMM d, yyyy")
                : "—"}
            </p>
          </div>
        </div>

        {invoices.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">
              Recent invoices
            </h4>
            <ul className="space-y-2">
              {(invoices ?? []).slice(0, 3).map((inv) => (
                <li
                  key={inv.id}
                  className="flex items-center justify-between rounded-lg border border-white/[0.03] bg-secondary/50 px-4 py-2"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {inv.date
                        ? format(new Date(inv.date), "MMM d, yyyy")
                        : inv.id}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {inv.currency ?? "USD"} {(inv.amount ?? 0).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
