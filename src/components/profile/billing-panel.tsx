/**
 * Billing panel: plan summary, seats, renewal, invoice history with download links.
 */

import { Link } from "react-router-dom";
import { CreditCard, Download, FileText, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBilling } from "@/hooks/use-profile";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export function BillingPanel() {
  const { billing, isLoading } = useBilling();
  const invoices = billing?.invoices ?? [];

  if (isLoading) {
    return (
      <Card className="border-white/[0.03] bg-card">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-white/[0.03] bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Plan summary
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Current plan, seats, and renewal date
          </p>
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
          <Button variant="outline" size="sm" asChild className="mt-4">
            <Link to="/dashboard/checkout" className="gap-2">
              <Plus className="h-4 w-4" />
              Subscribe / Upgrade
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="border-white/[0.03] bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoices
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Download past invoices
          </p>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <ul className="space-y-2">
              {invoices.map((inv) => (
                <li
                  key={inv.id}
                  className="flex items-center justify-between rounded-lg border border-white/[0.03] bg-secondary/50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {inv.date
                          ? format(new Date(inv.date), "MMM d, yyyy")
                          : inv.id}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {inv.currency ?? "USD"} {(inv.amount ?? 0).toFixed(2)}
                        {inv.status ? ` · ${inv.status}` : ""}
                      </p>
                    </div>
                  </div>
                  {inv.url ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                    >
                      <a
                        href={inv.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </a>
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">No file</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-lg border border-dashed border-white/[0.08] p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">No invoices yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Invoices will appear here after your first billing cycle
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
