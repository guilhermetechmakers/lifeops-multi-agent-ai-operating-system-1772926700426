/**
 * Stripe Adapter API client.
 * Subscriptions sync, invoices sync, get subscriptions by customer.
 * Webhook is server-to-server only (no client call). All responses use data ?? [] patterns.
 */

import { api, safeArray } from "@/lib/api";

export interface StripeSubscription {
  id: string;
  userId: string;
  stripeCustomerId: string;
  planId: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  quantity: number;
  price: number;
}

export interface StripeInvoice {
  id: string;
  subscriptionId: string;
  periodStart: string;
  periodEnd: string;
  amountDue: number;
  amountPaid: number;
  status: string;
}

function asSubscriptions(data: unknown): StripeSubscription[] {
  return safeArray<StripeSubscription>(data);
}

function asInvoices(data: unknown): StripeInvoice[] {
  return safeArray<StripeInvoice>(data);
}

export interface SubscriptionsSyncResponse {
  subscriptions: StripeSubscription[];
  syncedAt: string;
}

export interface InvoicesSyncResponse {
  invoices: StripeInvoice[];
  syncedAt: string;
}

export async function stripeSubscriptionsSync(customerId?: string, userId?: string): Promise<SubscriptionsSyncResponse> {
  const raw = await api.post<{ data?: SubscriptionsSyncResponse } | SubscriptionsSyncResponse>(
    "/stripe/subscriptions.sync",
    { customerId: customerId ?? "", userId: userId ?? "" }
  );
  const data = (raw as { data?: SubscriptionsSyncResponse })?.data ?? (raw as SubscriptionsSyncResponse);
  const subscriptions = Array.isArray(data?.subscriptions)
    ? data.subscriptions
    : asSubscriptions((data as { subscriptions?: unknown })?.subscriptions);
  return {
    subscriptions: subscriptions ?? [],
    syncedAt: typeof data?.syncedAt === "string" ? data.syncedAt : new Date().toISOString(),
  };
}

export async function stripeInvoicesSync(customerId?: string, subscriptionId?: string): Promise<InvoicesSyncResponse> {
  const raw = await api.post<{ data?: InvoicesSyncResponse } | InvoicesSyncResponse>("/stripe/invoices.sync", {
    customerId: customerId ?? undefined,
    subscriptionId: subscriptionId ?? undefined,
  });
  const data = (raw as { data?: InvoicesSyncResponse })?.data ?? (raw as InvoicesSyncResponse);
  const invoices = Array.isArray(data?.invoices) ? data.invoices : asInvoices((data as { invoices?: unknown })?.invoices);
  return {
    invoices: invoices ?? [],
    syncedAt: typeof data?.syncedAt === "string" ? data.syncedAt : new Date().toISOString(),
  };
}

export async function stripeGetSubscriptionsByCustomer(customerId: string): Promise<StripeSubscription[]> {
  const raw = await api.get<{ data?: { subscriptions?: StripeSubscription[] } } | StripeSubscription[]>(
    `/stripe/subscriptions/${encodeURIComponent(customerId)}`
  );
  const data = (raw as { data?: { subscriptions?: StripeSubscription[] } })?.data;
  const list = data?.subscriptions ?? (Array.isArray(raw) ? raw : []);
  return asSubscriptions(list);
}
