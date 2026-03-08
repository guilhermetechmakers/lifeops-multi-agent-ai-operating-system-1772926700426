/**
 * Checkout state and API integration.
 * Centralizes plan selection, promo validation, payment intent, and confirmation.
 * All array/object access guarded per runtime safety rules.
 */

import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  Plan,
  PlanSelectResponse,
  PriceBreakdown,
  BillingAddress,
} from "@/types/checkout";
import {
  fetchPlans,
  planSelect,
  validatePromo,
  createPaymentIntent,
  confirmPayment,
  fetchInvoice,
} from "@/api/checkout";
import type { Invoice } from "@/types/checkout";

export type CheckoutStep = "plan" | "billing" | "review" | "confirm";

const PLANS_QUERY_KEY = ["checkout", "plans"];

const defaultPriceBreakdown: PriceBreakdown = {
  planPrice: 0,
  discount: 0,
  tax: 0,
  usageEstimate: 0,
  totalDueToday: 0,
  currency: "USD",
};

export function useCheckout() {
  const [step, setStep] = useState<CheckoutStep>("plan");
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [cadence, setCadence] = useState<"monthly" | "yearly">("monthly");
  const [promoCode, setPromoCode] = useState<string>("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoMessage, setPromoMessage] = useState<string>("");
  const [subscriptionId, setSubscriptionId] = useState<string>("");
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown>(defaultPriceBreakdown);
  const [nextBillingDate, setNextBillingDate] = useState<string>("");
  const [paymentMethodId, setPaymentMethodId] = useState<string>("");
  const [billingAddress, setBillingAddress] = useState<BillingAddress | null>(null);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: PLANS_QUERY_KEY,
    queryFn: fetchPlans,
  });

  const plans: Plan[] = Array.isArray(plansData) ? plansData : [];

  const planSelectMutation = useMutation({
    mutationFn: (payload: { planId: string; cadence: "monthly" | "yearly"; promoCode?: string }) =>
      planSelect(payload),
    onSuccess: (res: PlanSelectResponse) => {
      setPriceBreakdown(res?.priceBreakdown ?? defaultPriceBreakdown);
      setNextBillingDate(res?.nextBillingDate ?? "");
      if (res?.subscriptionId) setSubscriptionId(res.subscriptionId);
    },
    onError: () => {
      toast.error("Failed to update plan selection");
    },
  });

  const validatePromoMutation = useMutation({
    mutationFn: (code: string) =>
      validatePromo({
        code,
        planId: selectedPlanId || undefined,
        cadence,
      }),
    onSuccess: (res) => {
      if (res?.valid) {
        setPromoApplied(true);
        setPromoMessage(res?.message ?? "Discount applied");
        toast.success(res?.message ?? "Promo applied");
        planSelectMutation.mutate({
          planId: selectedPlanId,
          cadence,
          promoCode,
        });
      } else {
        setPromoApplied(false);
        setPromoMessage(res?.message ?? "Invalid promo");
        toast.error(res?.message ?? "Invalid promo code");
      }
    },
    onError: () => {
      setPromoApplied(false);
      setPromoMessage("Could not validate promo");
      toast.error("Could not validate promo code");
    },
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: async () => {
      const intentRes = await createPaymentIntent({
        subscriptionId,
        paymentMethodId: paymentMethodId || "pm_mock",
        amount: priceBreakdown.totalDueToday,
        currency: priceBreakdown.currency,
      });
      const id = intentRes?.paymentIntentId ?? intentRes?.clientSecret ?? "pi_mock";
      return confirmPayment(id);
    },
    onSuccess: (res) => {
      if (res?.invoiceId) {
        setInvoiceId(res.invoiceId);
        setStep("confirm");
        toast.success("Payment successful");
      } else {
        toast.error("Payment completed but no invoice generated");
      }
    },
    onError: () => {
      toast.error("Payment failed. Please try again or use another card.");
    },
  });

  const selectPlan = useCallback(
    (planId: string) => {
      setSelectedPlanId(planId);
      planSelectMutation.mutate(
        { planId, cadence, promoCode: promoCode || undefined },
        {
          onSuccess: () => {},
        }
      );
    },
    [cadence, promoCode, planSelectMutation]
  );

  const setCadenceAndRefresh = useCallback(
    (c: "monthly" | "yearly") => {
      setCadence(c);
      if (selectedPlanId) {
        planSelectMutation.mutate({
          planId: selectedPlanId,
          cadence: c,
          promoCode: promoCode || undefined,
        });
      }
    },
    [selectedPlanId, promoCode, planSelectMutation]
  );

  const applyPromo = useCallback(
    (code: string) => {
      const trimmed = (code ?? "").trim();
      if (!trimmed) return;
      setPromoCode(trimmed);
      validatePromoMutation.mutate(trimmed);
    },
    [validatePromoMutation]
  );

  const loadInvoice = useCallback(async (id: string) => {
    const inv = await fetchInvoice(id);
    setInvoice(inv ?? null);
    return inv;
  }, []);

  return {
    step,
    setStep,
    plans,
    plansLoading,
    selectedPlanId,
    setSelectedPlanId: selectPlan,
    cadence,
    setCadence: setCadenceAndRefresh,
    promoCode,
    setPromoCode,
    promoApplied,
    promoMessage,
    applyPromo,
    subscriptionId,
    priceBreakdown,
    nextBillingDate,
    paymentMethodId,
    setPaymentMethodId,
    billingAddress,
    setBillingAddress,
    invoiceId,
    invoice,
    loadInvoice,
    planSelectMutation,
    validatePromoMutation,
    confirmPaymentMutation,
  };
}

/** Granular hooks for checkout page composition */
export function useCheckoutPlans() {
  const { data, isLoading } = useQuery({
    queryKey: PLANS_QUERY_KEY,
    queryFn: fetchPlans,
  });
  const items = Array.isArray(data) ? data : [];
  return { items, isLoading };
}

export function usePlanSelect() {
  return useMutation({
    mutationFn: (payload: { planId: string; cadence: "monthly" | "yearly"; promoCode?: string }) =>
      planSelect(payload),
  });
}

export function useValidatePromo() {
  return useMutation({
    mutationFn: (payload: { code: string; planId?: string; cadence?: "monthly" | "yearly" }) =>
      validatePromo(payload),
  });
}

export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: (payload: {
      subscriptionId: string;
      paymentMethodId: string;
      amount: number;
      currency: string;
    }) => createPaymentIntent(payload),
  });
}

export function useConfirmPayment() {
  return useMutation({
    mutationFn: (payload: { paymentIntentId: string }) =>
      confirmPayment(payload.paymentIntentId),
  });
}
