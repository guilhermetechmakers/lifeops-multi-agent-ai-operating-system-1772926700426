/**
 * Checkout / Payment types for LifeOps subscription flows.
 * All arrays and nested objects use optional chaining and guards.
 */

export interface Plan {
  id: string;
  name: string;
  tier: "starter" | "pro" | "team" | "enterprise";
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
}

export interface PriceBreakdown {
  planPrice: number;
  discount: number;
  tax: number;
  usageEstimate: number;
  totalDueToday: number;
  currency: string;
}

export interface PlanSelectResponse {
  success: boolean;
  subscriptionId?: string;
  priceBreakdown: PriceBreakdown;
  nextBillingDate: string;
  prorations?: { amount: number; description: string }[];
}

export interface PaymentIntentResponse {
  clientSecret: string;
  status: string;
  paymentIntentId?: string;
}

export interface PaymentConfirmResponse {
  status: string;
  invoiceId?: string;
}

export interface PromoValidateResponse {
  valid: boolean;
  discountAmount: number;
  newTotal: number;
  message: string;
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  date: string;
  pdfUrl?: string;
  status?: string;
}

/** Single recommendation item within workload or plan change */
export interface WorkloadRecommendationItem {
  id: string;
  changeDescription: string;
  impact: string;
  confidence: number;
}

export interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface SavedPaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}
