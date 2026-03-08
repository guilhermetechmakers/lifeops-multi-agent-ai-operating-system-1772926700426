/**
 * Billing History Page — Order / Transaction History.
 * Invoices, payments, subscription changes, usage-based billing.
 */

import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";
import { useBillingHistory } from "@/hooks/use-billing-history";
import {
  InvoicesTable,
  InvoiceDetailsPanel,
  PaymentsList,
  SubscriptionHistoryTimeline,
  UsageBillingPanel,
  FiltersBar,
  SummaryCard,
  EmptyState,
} from "@/components/billing-history";
import type { BillingHistoryFilters, Invoice } from "@/types/billing-history";

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount ?? 0);
}

export default function BillingHistoryPage() {
  const [filters, setFilters] = useState<BillingHistoryFilters>({});
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const {
    invoices,
    payments,
    changes,
    usageEntries,
    isLoading,
  } = useBillingHistory(filters);

  const filteredInvoices = useMemo(() => {
    let out = invoices ?? [];
    if ((filters.status ?? "all") !== "all") {
      out = out.filter((i) => (i.status ?? "") === filters.status);
    }
    if ((filters.search ?? "").trim()) {
      const q = (filters.search ?? "").toLowerCase();
      out = out.filter(
        (i) =>
          (i.invoice_number ?? "").toLowerCase().includes(q) ||
          (i.id ?? "").toLowerCase().includes(q)
      );
    }
    if ((filters.dateFrom ?? "").trim()) {
      out = out.filter((i) => (i.date ?? "") >= (filters.dateFrom ?? ""));
    }
    if ((filters.dateTo ?? "").trim()) {
      out = out.filter((i) => (i.date ?? "") <= (filters.dateTo ?? ""));
    }
    return out;
  }, [invoices, filters]);

  const totalPaid = useMemo(() => {
    return (payments ?? []).reduce((sum, p) => sum + (p.amount ?? 0), 0);
  }, [payments]);

  const totalDue = useMemo(() => {
    return (invoices ?? [])
      .filter((i) => i.status === "due" || i.status === "overdue")
      .reduce((sum, i) => sum + (i.amount_due ?? 0), 0);
  }, [invoices]);

  const handleViewInvoice = useCallback((invoiceId: string) => {
    const inv = (invoices ?? []).find((i) => i.id === invoiceId);
    setSelectedInvoice(inv ?? null);
  }, [invoices]);

  const handleDownloadInvoice = useCallback((_invoiceId: string) => {
    // In real app: call API to get signed URL or trigger download
    // For mock: could open pdf_url if available
    const inv = (invoices ?? []).find((i) => i.id === _invoiceId);
    if (inv?.pdf_url) {
      window.open(inv.pdf_url, "_blank");
    }
  }, [invoices]);

  const handlePayInvoice = useCallback((invoiceId: string) => {
    // Navigate to checkout or payment flow
    window.location.href = `/dashboard/checkout?invoice=${invoiceId}`;
  }, []);

  const isEmpty =
    (invoices ?? []).length === 0 &&
    (payments ?? []).length === 0 &&
    (changes ?? []).length === 0 &&
    (usageEntries ?? []).length === 0;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Order / Transaction History
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Invoices, payments, subscription changes, and usage-based billing
          </p>
        </div>
        <Link
          to="/dashboard/finance"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <LayoutDashboard className="h-4 w-4" />
          Finance Dashboard
        </Link>
      </div>

      {isEmpty && !isLoading ? (
        <EmptyState
          title="No billing history yet"
          description="Your invoices, payments, and subscription changes will appear here once you have billing activity."
          actions={[
            { label: "Go to Subscriptions", to: "/dashboard/finance/subscriptions" },
            { label: "Finance Dashboard", to: "/dashboard/finance" },
          ]}
        />
      ) : (
        <>
          <FiltersBar filters={filters} onChange={setFilters} />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              title="Total invoices"
              value={(invoices ?? []).length}
              hint="All time"
            />
            <SummaryCard
              title="Total paid"
              value={formatAmount(totalPaid)}
              hint="Successful payments"
            />
            <SummaryCard
              title="Amount due"
              value={formatAmount(totalDue)}
              hint="Outstanding invoices"
            />
            <SummaryCard
              title="Subscription changes"
              value={(changes ?? []).length}
              hint="Upgrades, downgrades, renewals"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <InvoicesTable
                invoices={filteredInvoices}
                onView={handleViewInvoice}
                onDownload={handleDownloadInvoice}
                onPay={handlePayInvoice}
              />
              <PaymentsList
                payments={payments ?? []}
                onReceiptDownload={(paymentId) => {
                  const p = (payments ?? []).find((x) => x.id === paymentId);
                  if (p?.receipt_url) window.open(p.receipt_url ?? "", "_blank");
                }}
              />
            </div>
            <div className="space-y-6">
              <SubscriptionHistoryTimeline changes={changes ?? []} />
              <UsageBillingPanel usageEntries={usageEntries ?? []} />
            </div>
          </div>
        </>
      )}

      <InvoiceDetailsPanel
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        onDownload={handleDownloadInvoice}
      />
    </div>
  );
}
