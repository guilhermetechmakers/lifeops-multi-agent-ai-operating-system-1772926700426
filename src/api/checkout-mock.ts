/**
 * Mock Checkout API for LifeOps.
 * Used when VITE_API_URL is not set. Simulates plan selection, promo validation, and payment.
 */

import type {
  Plan,
  PlanSelectResponse,
  PaymentIntentResponse,
  PaymentConfirmResponse,
  PromoValidateResponse,
} from "@/types/checkout";

const MOCK_PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    tier: "starter",
    monthlyPrice: 29,
    yearlyPrice: 290,
    features: ["5 cronjobs", "1,000 runs/month", "Email support"],
  },
  {
    id: "pro",
    name: "Pro",
    tier: "pro",
    monthlyPrice: 99,
    yearlyPrice: 990,
    features: ["Unlimited cronjobs", "10,000 runs/month", "Priority support", "LLM agents"],
  },
  {
    id: "team",
    name: "Team",
    tier: "team",
    monthlyPrice: 249,
    yearlyPrice: 2490,
    features: ["Everything in Pro", "5 seats", "Team analytics", "SSO"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tier: "enterprise",
    monthlyPrice: 999,
    yearlyPrice: 9990,
    features: ["Everything in Team", "Unlimited seats", "Dedicated support", "SLA"],
  },
];

const VALID_PROMOS: Record<string, { discount: number; message: string }> = {
  WELCOME20: { discount: 20, message: "20% off your first year" },
  PRO50: { discount: 50, message: "50% off Pro plan" },
  TEAM30: { discount: 30, message: "30% off Team plan" },
};

function getNextBillingDate(cadence: "monthly" | "yearly"): string {
  const d = new Date();
  if (cadence === "yearly") d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}

export const checkoutMockApi = {
  getPlans: async (): Promise<Plan[]> => {
    await new Promise((r) => setTimeout(r, 200));
    return [...MOCK_PLANS];
  },

  planSelect: async (body: {
    planId: string;
    cadence: "monthly" | "yearly";
    promoCode?: string;
  }): Promise<PlanSelectResponse> => {
    await new Promise((r) => setTimeout(r, 300));
    const plan = MOCK_PLANS.find((p) => p.id === body.planId) ?? MOCK_PLANS[1];
    const basePrice = body.cadence === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
    const promo = body.promoCode ? VALID_PROMOS[body.promoCode.toUpperCase()] : null;
    const discount = promo ? (basePrice * promo.discount) / 100 : 0;
    const planPrice = basePrice - discount;
    const tax = planPrice * 0.08;
    const usageEstimate = body.planId === "pro" || body.planId === "team" ? 15 : 0;
    const totalDueToday = planPrice + tax + usageEstimate;

    return {
      success: true,
      subscriptionId: `sub_${Date.now()}`,
      priceBreakdown: {
        planPrice,
        discount,
        tax,
        usageEstimate,
        totalDueToday,
        currency: "USD",
      },
      nextBillingDate: getNextBillingDate(body.cadence),
      prorations:
        body.planId === "pro"
          ? [{ amount: 12.5, description: "Prorated upgrade from Starter" }]
          : undefined,
    };
  },

  createPaymentIntent: async (_body: {
    subscriptionId: string;
    paymentMethodId: string;
    amount: number;
    currency: string;
  }): Promise<PaymentIntentResponse> => {
    await new Promise((r) => setTimeout(r, 400));
    return {
      clientSecret: `pi_mock_${Date.now()}_secret`,
      status: "requires_confirmation",
    };
  },

  confirmPayment: async (_body: { paymentIntentId: string }): Promise<PaymentConfirmResponse> => {
    await new Promise((r) => setTimeout(r, 500));
    return {
      status: "succeeded",
      invoiceId: `inv_${Date.now()}`,
    };
  },

  validatePromo: async (body: {
    code: string;
    planId?: string;
    cadence?: string;
  }): Promise<PromoValidateResponse> => {
    await new Promise((r) => setTimeout(r, 250));
    const code = body.code?.trim().toUpperCase() ?? "";
    const promo = VALID_PROMOS[code];
    if (!promo) {
      return {
        valid: false,
        discountAmount: 0,
        newTotal: 0,
        message: "Invalid or expired promo code",
      };
    }
    const plan = MOCK_PLANS.find((p) => p.id === (body.planId ?? "pro")) ?? MOCK_PLANS[1];
    const basePrice = body.cadence === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
    const discountAmount = (basePrice * promo.discount) / 100;
    const newTotal = basePrice - discountAmount;
    return {
      valid: true,
      discountAmount,
      newTotal,
      message: promo.message,
    };
  },

  getInvoice: async (invoiceId: string): Promise<{ url: string }> => {
    await new Promise((r) => setTimeout(r, 200));
    return {
      url: `https://example.com/invoices/${invoiceId}.pdf`,
    };
  },

  getSubscription: async (_subscriptionId: string) => {
    await new Promise((r) => setTimeout(r, 150));
    return {
      status: "active",
      usageData: { llmUnitsUsed: 1200, cost: 12 },
    };
  },
};
