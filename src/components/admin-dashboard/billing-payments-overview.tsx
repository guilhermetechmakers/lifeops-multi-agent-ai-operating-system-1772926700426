/**
 * Billing & Payments Overview — Subscriptions, invoices, enterprise settings,
 * integrations, compliance reports. Guards: (subscriptions ?? []), (invoices ?? []).
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBillingSubscriptions, useBillingInvoices } from "@/hooks/use-admin";
import { CreditCard, FileText } from "lucide-react";
import { EnterpriseSettingsPanel } from "./enterprise-settings-panel";
import { IntegrationsList } from "./integrations-list";
import { ComplianceReportsPanel } from "./compliance-reports-panel";

const EMPTY_SUBS: { id: string; orgId: string; plan: string; status: string; startDate: string; nextBillingDate?: string }[] = [];
const EMPTY_INV: { id: string; orgId: string; date: string; amount: number; status: string }[] = [];

export function BillingPaymentsOverview() {
  const { subscriptions, data: subsData, isLoading: subsLoading } = useBillingSubscriptions();
  const { invoices, data: invData, isLoading: invLoading } = useBillingInvoices();

  const subs = subscriptions ?? subsData ?? EMPTY_SUBS;
  const invs = invoices ?? invData ?? EMPTY_INV;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="card-health">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Subscriptions</CardTitle>
            <CreditCard className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {subsLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : (subs ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No subscriptions.</p>
            ) : (
              <ul className="space-y-2">
                {(subs ?? []).map((s) => (
                  <li key={s.id} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{s.plan}</span>
                    <Badge variant={s.status === "active" ? "default" : "secondary"}>{s.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="card-health">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent invoices</CardTitle>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {invLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : (invs ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No invoices.</p>
            ) : (
              <ul className="space-y-2">
                {(invs ?? []).slice(0, 5).map((inv) => (
                  <li key={inv.id} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{inv.date} — ${(inv.amount / 100).toFixed(2)}</span>
                    <Badge variant={inv.status === "paid" ? "default" : "secondary"}>{inv.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <EnterpriseSettingsPanel />
        <IntegrationsList />
        <ComplianceReportsPanel />
      </div>
    </div>
  );
}
