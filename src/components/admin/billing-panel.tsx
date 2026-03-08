/**
 * BillingPanel — Subscriptions, invoices, usage, spend controls.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, FileText } from "lucide-react";
import { useBillingSubscriptions, useBillingInvoices } from "@/hooks/use-admin";
import { DataVizChart } from "@/components/health-dashboard/data-viz-chart";
import { AnimatedPage } from "@/components/animated-page";

export function BillingPanel() {
  const { subscriptions, isLoading: subsLoading } = useBillingSubscriptions();
  const { invoices, isLoading: invLoading } = useBillingInvoices();

  const isLoading = subsLoading || invLoading;

  const invoiceChartData = (invoices ?? []).slice(0, 6).map((inv) => ({
    label: inv?.date ? new Date(inv.date).toLocaleDateString("en-US", { month: "short", year: "2-digit" }) : "",
    value: inv?.amount ?? 0,
  })).reverse();

  return (
    <AnimatedPage className="space-y-6">
      <h2 className="text-lg font-semibold">Billing & payments</h2>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-24 animate-pulse rounded bg-secondary/50" />
            ) : (subscriptions ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No subscriptions.</p>
            ) : (
              <div className="space-y-3">
                {(subscriptions ?? []).map((s) => (
                  <div
                    key={s?.id ?? ""}
                    className="flex items-center justify-between rounded-lg border border-white/[0.03] px-4 py-3"
                  >
                    <div>
                      <p className="font-medium">{s?.plan ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{s?.status ?? "—"}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Next: {s?.nextBillingDate ? new Date(s.nextBillingDate).toLocaleDateString() : "—"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Invoicing history
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-24 animate-pulse rounded bg-secondary/50" />
            ) : (invoices ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No invoices.</p>
            ) : (
              <div className="space-y-2">
                {(invoices ?? []).slice(0, 5).map((inv) => (
                  <div
                    key={inv?.id ?? ""}
                    className="flex items-center justify-between rounded-md border border-white/[0.03] px-3 py-2 text-sm"
                  >
                    <span>{inv?.date ? new Date(inv.date).toLocaleDateString() : "—"}</span>
                    <span className="font-medium">${inv?.amount ?? 0}</span>
                    <span className="text-muted-foreground">{inv?.status ?? "—"}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {invoiceChartData.length > 0 && (
        <Card className="border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B]">
          <CardHeader>
            <CardTitle>Invoice amounts (last 6)</CardTitle>
          </CardHeader>
          <CardContent>
            <DataVizChart
              type="bar"
              data={invoiceChartData}
              categories={["label"]}
              series={[{ dataKey: "value", name: "Amount", color: "teal" }]}
              height={200}
            />
          </CardContent>
        </Card>
      )}
    </AnimatedPage>
  );
}
