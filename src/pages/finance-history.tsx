/**
 * Order / Transaction History — invoices, payments, subscription changes, usage, receipts.
 * Route: /dashboard/finance/history
 */

import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";
import { useBillingHistory } from "@/hooks/use-billing-history";
import {
  FiltersBar,
  SummaryCard,
  InvoicesTable,
  InvoiceDetailsPanel,
  PaymentsList,
  SubscriptionHistoryTimeline,
  UsageBillingPanel,
  EmptyState,
} from "@/components/billing-history";
import type { BillingHistoryFilters } from "@/types/billing-history";
import { toast } from "sonner";

export default function FinanceHistoryPage() {
  const [filters, setFilters] = useState<BillingHistoryFilters>({});
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  const {
    invoices,
    payments,
    changes,
    usageEntries,
    isLoading,
  } = useBillingHistory(filters);

  const handleViewInvoice = useCallback((invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
  }, []);

  const handleDownloadInvoice = useCallback((invoiceId: string) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (inv?.pdf_url) {
      window.open(inv.pdf_url, "_blank", "noopener,noreferrer");
      toast.success("Download started");
    } else {
      toast.info("Download link not available");
    }
  }, [invoices]);

  const handlePayInvoice = useCallback((_invoiceId: string) => {
    toast.info("Pay flow would open here");
  }, []);

  const handleReceiptDownload = useCallback((paymentId: string) => {
    const p = payments.find((x) => x.id === paymentId);
    if (p?.receipt_url) {
      window.open(p.receipt_url ?? "#", "_blank", "noopener,noreferrer");
      toast.success("Receipt opened");
    } else {
      toast.info("Receipt not available");
    }
  }, [payments]);

  const selectedInvoice = selectedInvoiceId
    ? (invoices ?? []).find((i) => i.id === selectedInvoiceId) ?? null
    : null;

  const totalPaid = (payments ?? []).reduce((sum, p) => sum + (p.amount ?? 0), 0);
  const totalDue = (invoices ?? []).filter((i) => i.status === "due" || i.status === "overdue").reduce((sum, i) => sum + (i.amount_due ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Order & transaction history
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
          Finance dashboard
        </Link>
      </div>

      <FiltersBar filters={filters} onChange={setFilters} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total paid"
          value={`$${totalPaid.toFixed(2)}`}
          hint={`${(payments ?? []).length} payments`}
        />
        <SummaryCard
          title="Amount due"
          value={`$${totalDue.toFixed(2)}`}
          hint={(invoices ?? []).filter((i) => i.status === "due" || i.status === "overdue").length ? "Outstanding" : "None"}
        />
        <SummaryCard
          title="Invoices"
          value={(invoices ?? []).length}
          hint="All time"
        />
        <SummaryCard
          title="Subscription changes"
          value={(changes ?? []).length}
          hint="Plan history"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <InvoicesTable
            invoices={invoices ?? []}
            onView={handleViewInvoice}
            onDownload={handleDownloadInvoice}
            onPay={handlePayInvoice}
            isLoading={isLoading}
          />
          <PaymentsList
            payments={payments ?? []}
            onReceiptDownload={handleReceiptDownload}
          />
        </div>
        <div className="space-y-6">
          <SubscriptionHistoryTimeline changes={changes ?? []} />
          <UsageBillingPanel usageEntries={usageEntries ?? []} />
        </div>
      </div>

      {(invoices ?? []).length === 0 && !isLoading && (
        <EmptyState
          title="No invoices yet"
          description="Invoices and payment history will appear here after your first billing cycle or when connected to a billing provider."
          actions={[{ label: "Go to subscriptions", to: "/dashboard/finance/subscriptions" }]}
        />
      )}

      <InvoiceDetailsPanel
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoiceId(null)}
        onDownload={handleDownloadInvoice}
      />
    </div>
  );
}
