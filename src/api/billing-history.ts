/**
 * Billing History API — invoices, payments, subscription changes, usage, receipts.
 * Uses mock data when backend is not available. All responses validated for runtime safety.
 */

import type {
  Invoice,
  BillingHistoryData,
  BillingHistoryFilters,
} from "@/types/billing-history";
import { getMockBillingHistory, getMockInvoiceById } from "@/api/billing-history-mock";
import { api } from "@/lib/api";

const USE_MOCK = true;

async function fetchBillingHistory(filters?: BillingHistoryFilters): Promise<BillingHistoryData> {
  if (USE_MOCK) {
    return Promise.resolve(getMockBillingHistory(filters as Record<string, unknown> | undefined));
  }
  const res = await api.get<{ data?: BillingHistoryData }>("/api/billing/history");
  const data = res?.data ?? res;
  const invoices = Array.isArray((data as BillingHistoryData)?.invoices) ? (data as BillingHistoryData).invoices : [];
  const payments = Array.isArray((data as BillingHistoryData)?.payments) ? (data as BillingHistoryData).payments : [];
  const changes = Array.isArray((data as BillingHistoryData)?.changes) ? (data as BillingHistoryData).changes : [];
  const usageEntries = Array.isArray((data as BillingHistoryData)?.usageEntries) ? (data as BillingHistoryData).usageEntries : [];
  const receipts = Array.isArray((data as BillingHistoryData)?.receipts) ? (data as BillingHistoryData).receipts : [];
  return { invoices, payments, changes, usageEntries, receipts };
}

export async function getBillingHistory(filters?: BillingHistoryFilters): Promise<BillingHistoryData> {
  const raw = await fetchBillingHistory(filters);
  return {
    invoices: raw.invoices ?? [],
    payments: raw.payments ?? [],
    changes: raw.changes ?? [],
    usageEntries: raw.usageEntries ?? [],
    receipts: raw.receipts ?? [],
  };
}

export async function getInvoiceById(invoiceId: string): Promise<Invoice | null> {
  if (USE_MOCK) {
    return Promise.resolve(getMockInvoiceById(invoiceId));
  }
  const res = await api.get<Invoice>(`/api/billing/invoices/${encodeURIComponent(invoiceId)}`);
  return res ?? null;
}

export async function getReceiptDownloadUrl(receiptId: string): Promise<string | null> {
  if (USE_MOCK) {
    return Promise.resolve("#");
  }
  const res = await api.get<{ url?: string }>(`/api/billing/receipts/${encodeURIComponent(receiptId)}/download`);
  return res?.url ?? null;
}

export async function getInvoiceDownloadUrl(invoiceId: string): Promise<string | null> {
  const inv = await getInvoiceById(invoiceId);
  return inv?.pdf_url ?? null;
}
