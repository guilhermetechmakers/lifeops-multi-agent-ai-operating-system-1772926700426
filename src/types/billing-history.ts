/**
 * Order / Transaction History — data models for invoices, payments,
 * subscription changes, usage billing, and receipts.
 */

export type InvoiceStatus = "paid" | "due" | "overdue" | "canceled";

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitAmount: number;
  amount: number;
  currency?: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  date: string;
  due_date: string;
  amount_due: number;
  currency: string;
  status: InvoiceStatus;
  line_items?: LineItem[];
  pdf_url?: string | null;
  customer_id?: string | null;
  tax?: number;
  total?: number;
}

export type PaymentStatus = "succeeded" | "pending" | "failed" | "refunded";

export interface Payment {
  id: string;
  date: string;
  amount: number;
  currency: string;
  method: string;
  status: PaymentStatus;
  invoice_id?: string | null;
  transaction_id?: string | null;
  processor?: string | null;
  receipt_url?: string | null;
  last4?: string | null;
}

export type SubscriptionChangeType = "upgrade" | "downgrade" | "renewal" | "cancel";

export interface SubscriptionChange {
  id: string;
  subscription_id: string;
  change_type: SubscriptionChangeType;
  effective_date: string;
  old_plan_id?: string | null;
  new_plan_id?: string | null;
  delta_cost?: number | null;
  reason?: string | null;
}

export interface UsageEntry {
  id: string;
  subscription_id: string;
  date: string;
  metric_name: string;
  units: number;
  unit_cost: number;
  amount: number;
  currency?: string;
}

export interface Receipt {
  id: string;
  type: "invoice" | "receipt";
  generated_at: string;
  url: string;
}

export interface BillingHistoryFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  plan?: string;
  search?: string;
  amountMin?: number;
  amountMax?: number;
}

export interface BillingHistoryData {
  invoices: Invoice[];
  payments: Payment[];
  changes: SubscriptionChange[];
  usageEntries: UsageEntry[];
  receipts: Receipt[];
}
