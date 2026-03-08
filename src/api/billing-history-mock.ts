/**
 * Mock data for Order / Transaction History (invoices, payments, subscription changes, usage).
 * Used when no real backend is available. All arrays are safe for (data ?? []).map(...).
 */

import type {
  Invoice,
  Payment,
  SubscriptionChange,
  UsageEntry,
  Receipt,
  BillingHistoryData,
} from "@/types/billing-history";

export const mockInvoices: Invoice[] = [
  {
    id: "inv-1",
    invoice_number: "INV-2024-001",
    date: "2024-03-01",
    due_date: "2024-03-15",
    amount_due: 99,
    currency: "USD",
    status: "paid",
    pdf_url: "#",
    line_items: [
      { id: "li-1", description: "Pro plan — March 2024", quantity: 1, unitAmount: 99, amount: 99 },
    ],
  },
  {
    id: "inv-2",
    invoice_number: "INV-2024-002",
    date: "2024-04-01",
    due_date: "2024-04-15",
    amount_due: 149,
    currency: "USD",
    status: "due",
    pdf_url: "#",
    line_items: [
      { id: "li-2", description: "Pro plan — April 2024", quantity: 1, unitAmount: 99, amount: 99 },
      { id: "li-3", description: "API overage — 10k calls", quantity: 1, unitAmount: 50, amount: 50 },
    ],
  },
  {
    id: "inv-3",
    invoice_number: "INV-2024-003",
    date: "2024-02-01",
    due_date: "2024-02-15",
    amount_due: 99,
    currency: "USD",
    status: "paid",
    pdf_url: "#",
    line_items: [
      { id: "li-4", description: "Pro plan — February 2024", quantity: 1, unitAmount: 99, amount: 99 },
    ],
  },
];

export const mockPayments: Payment[] = [
  {
    id: "pay-1",
    date: "2024-03-02",
    amount: 99,
    currency: "USD",
    method: "card",
    status: "succeeded",
    invoice_id: "inv-1",
    transaction_id: "txn_abc",
    processor: "stripe",
    receipt_url: "#",
    last4: "4242",
  },
  {
    id: "pay-2",
    date: "2024-02-03",
    amount: 99,
    currency: "USD",
    method: "card",
    status: "succeeded",
    invoice_id: "inv-3",
    receipt_url: "#",
    last4: "4242",
  },
];

export const mockSubscriptionChanges: SubscriptionChange[] = [
  {
    id: "ch-1",
    subscription_id: "sub-1",
    change_type: "upgrade",
    effective_date: "2024-03-01",
    old_plan_id: "plan_basic",
    new_plan_id: "plan_pro",
    delta_cost: 49,
    reason: "Upgrade to Pro for API access",
  },
  {
    id: "ch-2",
    subscription_id: "sub-1",
    change_type: "renewal",
    effective_date: "2024-02-01",
    new_plan_id: "plan_basic",
    delta_cost: 0,
  },
];

export const mockUsageEntries: UsageEntry[] = [
  { id: "use-1", subscription_id: "sub-1", date: "2024-03-15", metric_name: "API calls", units: 50000, unit_cost: 0.001, amount: 50, currency: "USD" },
  { id: "use-2", subscription_id: "sub-1", date: "2024-03-14", metric_name: "API calls", units: 45000, unit_cost: 0.001, amount: 45, currency: "USD" },
  { id: "use-3", subscription_id: "sub-1", date: "2024-03-13", metric_name: "LLM tokens", units: 100000, unit_cost: 0.00002, amount: 2, currency: "USD" },
];

export const mockReceipts: Receipt[] = [
  { id: "rec-1", type: "invoice", generated_at: "2024-03-02T10:00:00Z", url: "#" },
  { id: "rec-2", type: "receipt", generated_at: "2024-02-03T10:00:00Z", url: "#" },
];

export function getMockBillingHistory(_filters?: Record<string, unknown>): BillingHistoryData {
  return {
    invoices: [...mockInvoices],
    payments: [...mockPayments],
    changes: [...mockSubscriptionChanges],
    usageEntries: [...mockUsageEntries],
    receipts: [...mockReceipts],
  };
}

export function getMockInvoiceById(id: string): Invoice | null {
  return mockInvoices.find((inv) => inv.id === id) ?? null;
}
