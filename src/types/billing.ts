/**
 * Billing & Payments — data models for subscriptions, plans, usage, invoices,
 * payments, admin (enterprise, roles, compliance). All arrays/objects guarded at runtime.
 */

export type BillingInterval = "monthly" | "yearly";

export interface Plan {
  id: string;
  name: string;
  description?: string;
  interval: BillingInterval;
  price: number;
  currency: string;
  features: string[];
  trialPeriodDays?: number;
}

export interface PlanPrice {
  id: string;
  planId: string;
  interval: BillingInterval;
  amount: number;
  currency: string;
  trialPeriodDays?: number;
}

export interface PromoCode {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  expiresAt: string;
  usageLimit: number;
  redeemedCount: number;
}

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "incomplete_expired";

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  quantity: number;
  trialEnd?: string | null;
  stripeSubscriptionId?: string | null;
}

export interface UsageRecord {
  id: string;
  subscriptionId: string;
  timestamp: string;
  amount: number;
  unit: string;
  productId?: string | null;
}

export type InvoiceStatus = "draft" | "open" | "paid" | "void" | "uncollectible";

export interface Invoice {
  id: string;
  subscriptionId: string;
  amountDue: number;
  amountPaid: number;
  status: InvoiceStatus;
  pdfUrl?: string | null;
  issuedAt: string;
  dueDate: string;
  stripeInvoiceId?: string | null;
}

export type PaymentStatus = "succeeded" | "pending" | "failed" | "refunded";

export interface Payment {
  id: string;
  subscriptionId: string;
  method: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  stripePaymentIntentId?: string | null;
  capturedAt?: string | null;
}

export interface WebhookLog {
  id: string;
  eventType: string;
  payload: Record<string, unknown>;
  receivedAt: string;
  processedAt?: string | null;
  status: "pending" | "processed" | "failed";
}

export interface AuditTrail {
  id: string;
  action: string;
  actorId: string;
  targetId?: string | null;
  timestamp: string;
  details: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  enterpriseId?: string | null;
}

export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  enterpriseId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Enterprise {
  id: string;
  name: string;
  billingAddress?: string | null;
  taxId?: string | null;
  planLimit?: number | null;
  createdAt: string;
  updatedAt: string;
}

export type IntegrationStatus = "connected" | "disconnected" | "error";

export interface Integration {
  id: string;
  name: string;
  type: string;
  config: Record<string, unknown>;
  status: IntegrationStatus;
}

export interface ComplianceReport {
  id: string;
  scope: string;
  status: string;
  generatedAt: string;
  data: Record<string, unknown>;
}

/** API response shapes with guarded arrays */
export interface PlansResponse {
  data: Plan[];
}

export interface SubscriptionResponse {
  data: Subscription;
}

export interface UsageSummaryResponse {
  subscriptionId: string;
  period: string;
  totalUsage: number;
  unit: string;
  records: UsageRecord[];
}

export interface InvoicesResponse {
  data: Invoice[];
  total: number;
}

export interface PaymentsResponse {
  data: Payment[];
}
