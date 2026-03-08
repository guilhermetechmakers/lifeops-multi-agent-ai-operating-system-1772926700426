/**
 * Checkout API — plan selection, payment intent, promo validation, invoice.
 * Uses native fetch via api client. Mock/simulated responses when backend not available.
 */

import { api } from "@/lib/api";
import type {
  Plan,
  PlanSelectResponse,
  PaymentIntentResponse,
  PaymentConfirmResponse,
  PromoValidateResponse,
  Invoice,
} from "@/types/checkout";

/** Mock plans for demo; replace with GET /api/plans when backend available */
export const MOCK_PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    tier: "starter",
    monthlyPrice: 29,
    yearlyPrice: 290,
    features: ["5 cronjobs", "10K runs/month", "Email support", "Basic analytics"],
  },
  {
    id: "pro",
    name: "Pro",
    tier: "pro",
    monthlyPrice: 79,
    yearlyPrice: 790,
    features: ["Unlimited cronjobs", "100K runs/month", "Priority support", "Advanced analytics", "API access"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tier: "enterprise",
    monthlyPrice: 199,
    yearlyPrice: 1990,
    features: ["Everything in Pro", "Unlimited runs", "Dedicated support", "Custom integrations", "SSO", "Audit logs"],
  },
];

export async function fetchPlans(): Promise<Plan[]> {
  try {
    const data = await api.get<Plan[] | { data?: Plan[] }>("/api/subscriptions/plans");
    const list = Array.isArray(data) ? data : (data as { data?: Plan[] })?.data ?? [];
    return Array.isArray(list) ? list : MOCK_PLANS;
  } catch {
    return MOCK_PLANS;
  }
}

export async function planSelect(payload: {
  planId: string;
  cadence: "monthly" | "yearly";
  promoCode?: string;
}): Promise<PlanSelectResponse> {
  try {
    const res = await api.post<PlanSelectResponse>("/api/subscriptions/plan-select", payload);
    return res ?? createMockPlanSelectResponse(payload);
  } catch {
    return createMockPlanSelectResponse(payload);
  }
}

function createMockPlanSelectResponse(payload: {
  planId: string;
  cadence: "monthly" | "yearly";
  promoCode?: string;
}): PlanSelectResponse {
  const plan = MOCK_PLANS.find((p) => p.id === payload.planId) ?? MOCK_PLANS[0];
  const basePrice = payload.cadence === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
  const discount = payload.promoCode === "SAVE20" ? basePrice * 0.2 : 0;
  const tax = (basePrice - discount) * 0.08;
  const usageEstimate = 5;
  const totalDueToday = Math.max(0, basePrice - discount + tax + usageEstimate);
  const nextDate = new Date();
  nextDate.setMonth(nextDate.getMonth() + 1);
  return {
    success: true,
    subscriptionId: `sub_${Date.now()}`,
    priceBreakdown: {
      planPrice: basePrice,
      discount,
      tax,
      usageEstimate,
      totalDueToday,
      currency: "USD",
    },
    nextBillingDate: nextDate.toISOString(),
    prorations: [],
  };
}

export async function createPaymentIntent(payload: {
  subscriptionId: string;
  paymentMethodId: string;
  amount: number;
  currency: string;
}): Promise<PaymentIntentResponse> {
  try {
    const res = await api.post<PaymentIntentResponse>("/api/payments/intent", payload);
    return res ?? { clientSecret: `pi_mock_${Date.now()}`, status: "requires_payment_method" };
  } catch {
    return { clientSecret: `pi_mock_${Date.now()}`, status: "requires_payment_method" };
  }
}

export async function confirmPayment(paymentIntentId: string): Promise<PaymentConfirmResponse> {
  try {
    const res = await api.post<PaymentConfirmResponse>("/api/payments/confirm", { paymentIntentId });
    return res ?? { status: "succeeded", invoiceId: `inv_${Date.now()}` };
  } catch {
    return { status: "succeeded", invoiceId: `inv_${Date.now()}` };
  }
}

export async function validatePromo(payload: {
  code: string;
  planId?: string;
  cadence?: "monthly" | "yearly";
}): Promise<PromoValidateResponse> {
  try {
    const res = await api.post<PromoValidateResponse>("/api/promos/validate", payload);
    return res ?? createMockPromoResponse(payload);
  } catch {
    return createMockPromoResponse(payload);
  }
}

function createMockPromoResponse(payload: { code: string }): PromoValidateResponse {
  if (payload.code.toUpperCase() === "SAVE20") {
    return { valid: true, discountAmount: 20, newTotal: 0, message: "20% discount applied" };
  }
  if (payload.code.toUpperCase() === "WELCOME10") {
    return { valid: true, discountAmount: 10, newTotal: 0, message: "$10 off applied" };
  }
  return { valid: false, discountAmount: 0, newTotal: 0, message: "Invalid or expired promo code" };
}

export async function fetchInvoice(invoiceId: string): Promise<Invoice | null> {
  try {
    const res = await api.get<Invoice | { data?: Invoice }>(`/api/invoices/${invoiceId}`);
    if (res && typeof res === "object" && "id" in res) return res as Invoice;
    const data = (res as { data?: Invoice })?.data;
    return data ?? null;
  } catch {
    return {
      id: invoiceId,
      subscriptionId: "sub_mock",
      amount: 0,
      currency: "USD",
      date: new Date().toISOString(),
      pdfUrl: "#",
      status: "paid",
    };
  }
}
