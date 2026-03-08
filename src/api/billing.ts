/**
 * Billing & Payments API — plans, subscriptions, usage, invoices, payments, admin.
 * All responses normalized; guard arrays with Array.isArray and data ?? [].
 */

import { api } from "@/lib/api";
import { safeArray } from "@/lib/api/guards";
import type {
  Plan,
  Subscription,
  Invoice,
  Enterprise,
  Integration,
  ComplianceReport,
  UsageSummaryResponse,
  PlansResponse,
} from "@/types/billing";

const PLANS_PATH = "/api/plans";
const SUBS_PATH = "/api/subscriptions";
const USAGE_PATH = "/api/usage";
const INVOICES_PATH = "/api/invoices";
const PAYMENTS_PATH = "/api/payments";
const ADMIN_PATH = "/admin";

/** GET /api/plans — Retrieve available plans */
export async function getPlans(): Promise<Plan[]> {
  try {
    const res = await api.get<Plan[] | PlansResponse>(PLANS_PATH);
    const data = Array.isArray(res) ? res : (res as PlansResponse)?.data;
    return safeArray<Plan>(data);
  } catch {
    return [];
  }
}

/** POST /api/subscriptions — Create or update subscription */
export async function createOrUpdateSubscription(payload: {
  planId: string;
  userId?: string;
  quantity?: number;
  trialDays?: number;
  promoCode?: string;
}): Promise<Subscription | null> {
  try {
    const res = await api.post<Subscription | { data?: Subscription }>(SUBS_PATH, payload);
    if (res && typeof res === "object" && "id" in res) return res as Subscription;
    return (res as { data?: Subscription })?.data ?? null;
  } catch {
    return null;
  }
}

/** GET /api/subscriptions/:id */
export async function getSubscription(id: string): Promise<Subscription | null> {
  try {
    const res = await api.get<Subscription | { data?: Subscription }>(`${SUBS_PATH}/${id}`);
    if (res && typeof res === "object" && "id" in res) return res as Subscription;
    return (res as { data?: Subscription })?.data ?? null;
  } catch {
    return null;
  }
}

/** POST /api/subscriptions/:id/change-plan */
export async function changePlan(
  subscriptionId: string,
  payload: { planId: string; proration?: boolean }
): Promise<Subscription | null> {
  try {
    const res = await api.post<Subscription | { data?: Subscription }>(
      `${SUBS_PATH}/${subscriptionId}/change-plan`,
      payload
    );
    if (res && typeof res === "object" && "id" in res) return res as Subscription;
    return (res as { data?: Subscription })?.data ?? null;
  } catch {
    return null;
  }
}

/** POST /api/subscriptions/:id/cancel */
export async function cancelSubscription(subscriptionId: string): Promise<{ success: boolean }> {
  try {
    const res = await api.post<{ success: boolean }>(`${SUBS_PATH}/${subscriptionId}/cancel`, {});
    return res ?? { success: false };
  } catch {
    return { success: false };
  }
}

/** POST /api/usage/submit — Submit metered usage */
export async function submitUsage(payload: {
  subscriptionId: string;
  usageAmount: number;
  timestamp?: string;
  product?: string;
}): Promise<{ success: boolean }> {
  try {
    const res = await api.post<{ success: boolean }>(`${USAGE_PATH}/submit`, payload);
    return res ?? { success: false };
  } catch {
    return { success: false };
  }
}

/** GET /api/usage/:subscriptionId/summary */
export async function getUsageSummary(
  subscriptionId: string,
  period?: string
): Promise<UsageSummaryResponse | null> {
  try {
    const q = period ? `?period=${encodeURIComponent(period)}` : "";
    const res = await api.get<UsageSummaryResponse>(
      `${USAGE_PATH}/${encodeURIComponent(subscriptionId)}/summary${q}`
    );
    if (res && typeof res === "object" && "subscriptionId" in res) return res as UsageSummaryResponse;
    return null;
  } catch {
    return null;
  }
}

/** POST /api/invoices/generate */
export async function generateInvoice(payload: {
  subscriptionId: string;
  usage?: Record<string, number>;
  charges?: unknown[];
}): Promise<Invoice | null> {
  try {
    const res = await api.post<Invoice | { data?: Invoice }>(`${INVOICES_PATH}/generate`, payload);
    if (res && typeof res === "object" && "id" in res) return res as Invoice;
    return (res as { data?: Invoice })?.data ?? null;
  } catch {
    return null;
  }
}

/** GET /api/invoices/:id */
export async function getInvoice(invoiceId: string): Promise<Invoice | null> {
  try {
    const res = await api.get<Invoice | { data?: Invoice }>(
      `${INVOICES_PATH}/${encodeURIComponent(invoiceId)}`
    );
    if (res && typeof res === "object" && "id" in res) return res as Invoice;
    return (res as { data?: Invoice })?.data ?? null;
  } catch {
    return null;
  }
}

/** GET /api/invoices/:id/download — Returns URL or blob; caller opens in new tab or downloads */
export async function getInvoiceDownloadUrl(invoiceId: string): Promise<string | null> {
  try {
    const res = await api.get<{ url?: string }>(
      `${INVOICES_PATH}/${encodeURIComponent(invoiceId)}/download`
    );
    return (res as { url?: string })?.url ?? null;
  } catch {
    return null;
  }
}

/** POST /api/payments/intent — Create payment intent (Stripe) */
export async function createPaymentIntent(payload: {
  subscriptionId: string;
  amount: number;
  currency: string;
  paymentMethodId?: string;
}): Promise<{ clientSecret: string; paymentIntentId?: string } | null> {
  try {
    const res = await api.post<{ clientSecret: string; paymentIntentId?: string }>(
      `${PAYMENTS_PATH}/intent`,
      payload
    );
    return res ?? null;
  } catch {
    return null;
  }
}

/** Admin: GET /admin/users */
export async function getAdminUsers(params?: { page?: number; limit?: number }): Promise<unknown[]> {
  try {
    const q = params
      ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
      : "";
    const res = await api.get<unknown[] | { data?: unknown[] }>(`${ADMIN_PATH}/users${q}`);
    const data = Array.isArray(res) ? res : (res as { data?: unknown[] })?.data;
    return safeArray(data);
  } catch {
    return [];
  }
}

/** Admin: GET /admin/enterprise/settings */
export async function getEnterpriseSettings(): Promise<Enterprise | null> {
  try {
    const res = await api.get<Enterprise | { data?: Enterprise }>(
      `${ADMIN_PATH}/enterprise/settings`
    );
    if (res && typeof res === "object" && "id" in res) return res as Enterprise;
    return (res as { data?: Enterprise })?.data ?? null;
  } catch {
    return null;
  }
}

/** Admin: PUT /admin/enterprise/settings */
export async function updateEnterpriseSettings(payload: Partial<Enterprise>): Promise<Enterprise | null> {
  try {
    const res = await api.put<Enterprise | { data?: Enterprise }>(
      `${ADMIN_PATH}/enterprise/settings`,
      payload
    );
    if (res && typeof res === "object" && "id" in res) return res as Enterprise;
    return (res as { data?: Enterprise })?.data ?? null;
  } catch {
    return null;
  }
}

/** Admin: GET /admin/compliance/reports */
export async function getComplianceReports(): Promise<ComplianceReport[]> {
  try {
    const res = await api.get<ComplianceReport[] | { data?: ComplianceReport[] }>(
      `${ADMIN_PATH}/compliance/reports`
    );
    const data = Array.isArray(res) ? res : (res as { data?: ComplianceReport[] })?.data;
    return safeArray<ComplianceReport>(data);
  } catch {
    return [];
  }
}

/** Admin: GET /admin/integrations (billing-related) */
export async function getAdminIntegrations(): Promise<Integration[]> {
  try {
    const res = await api.get<Integration[] | { data?: Integration[] }>(
      `${ADMIN_PATH}/integrations`
    );
    const data = Array.isArray(res) ? res : (res as { data?: Integration[] })?.data;
    return safeArray<Integration>(data);
  } catch {
    return [];
  }
}
