/**
 * Checkout / Payment Page — Subscription purchase and upgrade flows.
 * Plan selection, billing details, promo codes, secure payment processing.
 */

import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  PlanSelector,
  BillingForm,
  SummaryPanel,
  InvoicePanel,
  StatusBanner,
  ProgressStepper,
  type CheckoutStepId,
} from "@/components/checkout";
import {
  useCheckoutPlans,
  usePlanSelect,
  useValidatePromo,
  useCreatePaymentIntent,
  useConfirmPayment,
} from "@/hooks/use-checkout";
import type { PriceBreakdown, Plan, Invoice } from "@/types/checkout";
import { fetchInvoice } from "@/api/checkout";

export default function CheckoutPage() {
  const [step, setStep] = useState<CheckoutStepId>("plan");
  const [selectedPlanId, setSelectedPlanId] = useState<string>("pro");
  const [cadence, setCadence] = useState<"monthly" | "yearly">("yearly");
  const [promoCode] = useState("");
  const [promoStatus, setPromoStatus] = useState<"idle" | "validating" | "valid" | "invalid">("idle");
  const [promoMessage, setPromoMessage] = useState("");
  const [, setPromoDiscount] = useState(0);
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);
  const [nextBillingDate, setNextBillingDate] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [paymentToken, setPaymentToken] = useState("");
  const [paymentValid, setPaymentValid] = useState(false);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const { items: plans, isLoading: plansLoading } = useCheckoutPlans();
  const planSelect = usePlanSelect();
  const validatePromo = useValidatePromo();
  const createIntent = useCreatePaymentIntent();
  const confirmPayment = useConfirmPayment();

  const selectedPlan = (plans ?? []).find((p: Plan) => p.id === selectedPlanId) ?? null;
  const planName = selectedPlan?.name ?? null;

  useEffect(() => {
    if (selectedPlanId && plans.length > 0) {
      planSelect.mutate(
        {
          planId: selectedPlanId,
          cadence,
          promoCode: promoCode.trim() || undefined,
        },
        {
          onSuccess: (data: { priceBreakdown?: PriceBreakdown; nextBillingDate?: string; subscriptionId?: string }) => {
            if (data?.priceBreakdown) setPriceBreakdown(data.priceBreakdown);
            if (data?.nextBillingDate) setNextBillingDate(data.nextBillingDate);
            if (data?.subscriptionId) setSubscriptionId(data.subscriptionId);
          },
        }
      );
    }
  }, [selectedPlanId, cadence, plans.length]);

  const handlePlanSelect = useCallback(
    async (planId: string) => {
      setSelectedPlanId(planId);
      const result = await planSelect.mutateAsync({
        planId,
        cadence,
        promoCode: promoCode.trim() || undefined,
      });
      if (result?.priceBreakdown) {
        setPriceBreakdown(result.priceBreakdown);
      }
      if (result?.nextBillingDate) {
        setNextBillingDate(result.nextBillingDate);
      }
      if (result?.subscriptionId) {
        setSubscriptionId(result.subscriptionId);
      }
    },
    [cadence, promoCode, planSelect]
  );

  const handleCadenceChange = useCallback(
    async (newCadence: "monthly" | "yearly") => {
      setCadence(newCadence);
      if (selectedPlanId) {
        const result = await planSelect.mutateAsync({
          planId: selectedPlanId,
          cadence: newCadence,
          promoCode: promoCode.trim() || undefined,
        });
        if (result?.priceBreakdown) setPriceBreakdown(result.priceBreakdown);
        if (result?.nextBillingDate) setNextBillingDate(result.nextBillingDate);
      }
    },
    [selectedPlanId, promoCode, planSelect]
  );

  const handlePromoApply = useCallback(
    async (code: string) => {
      if (!code.trim()) {
        setPromoStatus("idle");
        setPromoMessage("");
        setPromoDiscount(0);
        return;
      }
      setPromoStatus("validating");
      try {
        const res = await validatePromo.mutateAsync({
          code: code.trim(),
          planId: selectedPlanId ?? undefined,
          cadence,
        });
        if (res?.valid) {
          setPromoStatus("valid");
          setPromoMessage(res.message ?? "Promo applied");
          setPromoDiscount(res.discountAmount ?? 0);
          if (selectedPlanId) {
            const planRes = await planSelect.mutateAsync({
              planId: selectedPlanId,
              cadence,
              promoCode: code.trim(),
            });
            if (planRes?.priceBreakdown) setPriceBreakdown(planRes.priceBreakdown);
            if (planRes?.nextBillingDate) setNextBillingDate(planRes.nextBillingDate);
          }
        } else {
          setPromoStatus("invalid");
          setPromoMessage(res?.message ?? "Invalid promo code");
          setPromoDiscount(0);
        }
      } catch {
        setPromoStatus("invalid");
        setPromoMessage("Could not validate promo");
        setPromoDiscount(0);
      }
    },
    [selectedPlanId, cadence, validatePromo, planSelect]
  );

  const handleConfirm = useCallback(async () => {
    if (!selectedPlanId || !paymentValid) {
      toast.error("Please complete plan selection and payment details");
      return;
    }
    setStep("confirm");

    let subId = subscriptionId;
    let amount = priceBreakdown?.totalDueToday ?? 0;
    const currency = priceBreakdown?.currency ?? "USD";

    if (!subId) {
      const planRes = await planSelect.mutateAsync({
        planId: selectedPlanId,
        cadence,
        promoCode: promoCode.trim() || undefined,
      });
      subId = planRes?.subscriptionId ?? null;
      amount = planRes?.priceBreakdown?.totalDueToday ?? amount;
      if (planRes?.priceBreakdown) setPriceBreakdown(planRes.priceBreakdown);
    }
    if (!subId) {
      toast.error("Could not create subscription");
      return;
    }
    setSubscriptionId(subId);

    const token = paymentToken || `pm_mock_${Date.now()}`;
    try {
      const intentRes = await createIntent.mutateAsync({
        subscriptionId: subId,
        paymentMethodId: token,
        amount,
        currency,
      });
      const paymentIntentId = intentRes?.clientSecret ?? `pi_${Date.now()}`;
      const confirmRes = await confirmPayment.mutateAsync({
        paymentIntentId,
      });
      if (confirmRes?.status === "succeeded") {
        const invId = confirmRes?.invoiceId ?? null;
        setInvoiceId(invId);
        if (invId) {
          fetchInvoice(invId).then((inv) => setInvoice(inv ?? null));
        }
        setIsSuccess(true);
        toast.success("Subscription activated");
      } else {
        toast.error("Payment could not be completed");
      }
    } catch {
      // Error already handled by mutation onError
    }
  }, [
    selectedPlanId,
    subscriptionId,
    paymentToken,
    paymentValid,
    cadence,
    promoCode,
    planSelect,
    priceBreakdown,
    createIntent,
    confirmPayment,
  ]);


  if (isSuccess) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Thank you</h1>
          <p className="text-muted-foreground">
            Your subscription is now active.
          </p>
        </div>
        <StatusBanner
          variant="success"
          title="Payment successful"
          message="Your subscription has been activated. You can now access all plan features."
        />
        <InvoicePanel
          invoiceId={invoiceId}
          invoice={invoice}
          onLoadInvoice={async (id) => {
            const inv = await fetchInvoice(id);
            if (inv) setInvoice(inv);
            return inv;
          }}
          onEmailReceipt={() => toast.info("Receipt will be emailed")}
        />
        <div className="flex gap-4">
          <Link to="/dashboard">
            <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
              Go to dashboard
            </button>
          </Link>
          <Link to="/dashboard/profile/billing">
            <button className="rounded-md border border-white/10 px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors">
              View billing
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Checkout</h1>
        <p className="text-muted-foreground">
          Select a plan, enter payment details, and confirm your subscription
        </p>
      </div>

      <ProgressStepper currentStep={step} />

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <section aria-labelledby="plan-heading">
            <h2 id="plan-heading" className="sr-only">
              Select plan
            </h2>
            <PlanSelector
              plans={plans}
              selectedPlanId={selectedPlanId}
              cadence={cadence}
              onSelect={handlePlanSelect}
              onCadenceChange={handleCadenceChange}
              prorationNotice={
                priceBreakdown?.totalDueToday
                  ? `First charge: $${(priceBreakdown?.totalDueToday ?? 0).toFixed(2)} today`
                  : undefined
              }
              isLoading={plansLoading}
            />
          </section>

          <section aria-labelledby="billing-heading">
            <h2 id="billing-heading" className="mb-4 text-lg font-semibold">
              Billing details
            </h2>
            <BillingForm
              onPaymentMethodReady={(t) => {
                setPaymentToken(t);
                setPaymentValid(!!t);
              }}
              onValidationChange={(valid) => {
                setPaymentValid(valid);
                if (!valid) setPaymentToken("");
              }}
              onPromoApply={handlePromoApply}
              promoValidating={promoStatus === "validating"}
              promoApplied={promoStatus === "valid"}
              promoMessage={promoMessage}
            />
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <SummaryPanel
            planName={planName ?? undefined}
            priceBreakdown={priceBreakdown}
            nextBillingDate={nextBillingDate}
            prorationNotes={
              priceBreakdown?.totalDueToday
                ? [`Total due today: $${(priceBreakdown?.totalDueToday ?? 0).toFixed(2)}`]
                : []
            }
            onConfirm={handleConfirm}
            isSubmitting={createIntent.isPending || confirmPayment.isPending}
            disabled={!selectedPlanId || !paymentValid}
          />
        </aside>
      </div>
    </div>
  );
}
