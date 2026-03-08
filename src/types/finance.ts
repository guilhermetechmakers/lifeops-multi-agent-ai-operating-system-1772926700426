/**
 * Finance Dashboard data models — aligned with API contracts.
 */

export type TransactionStatus = "pending" | "posted" | "flagged";

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  currency: string;
  categoryId: string | null;
  status: TransactionStatus;
  notes: string;
  userId: string;
  merchant: string;
  metadata?: Record<string, unknown>;
}

export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  color: string;
}

export type SubscriptionStatus = "active" | "paused" | "canceled";

export interface Subscription {
  id: string;
  userId: string;
  provider: string;
  plan: string;
  amount: number;
  currency: string;
  nextBillingDate: string;
  status: SubscriptionStatus;
  churnRiskScore: number;
  isTracked: boolean;
}

export type AnomalySeverity = "low" | "medium" | "high";

export interface Anomaly {
  id: string;
  transactionId: string;
  detectedBy: string;
  severity: AnomalySeverity;
  rationale: string;
  status: "open" | "closed";
}

export interface Forecast {
  id: string;
  horizon: string;
  series: string;
  value: number;
  confidence: number;
}

export type MonthlyCloseTaskStatus = "open" | "in_progress" | "done";

export interface MonthlyCloseTask {
  id: string;
  name: string;
  dueDate: string;
  ownerId: string;
  status: MonthlyCloseTaskStatus;
  relatedRuns: string[];
}

export interface AgentRecommendation {
  id: string;
  context: string;
  action: string;
  expectedROI: number;
  confidence: number;
}

export interface FinanceDashboardData {
  balances: { total: number; currency: string };
  spend: { monthly: number; currency: string; trend?: number };
  forecast: { value: number; currency: string; horizon: string };
  opportunities: { amount: number; count: number };
  transactions: Transaction[];
  subscriptions: Subscription[];
  anomalies: Anomaly[];
  forecastData: Forecast[];
  monthlyCloseItems: MonthlyCloseTask[];
  recommendations: AgentRecommendation[];
}

export interface CategorizationRule {
  id: string;
  name: string;
  pattern: string;
  categoryId: string;
  isActive: boolean;
}

/** Transactions & Categorization — enriched transaction model */
export type TransactionCategorizationStatus =
  | "ingested"
  | "enriched"
  | "categorized"
  | "exception";

export interface TransactionEnriched {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  accountId: string;
  rawCategory?: string | null;
  categorizedCategory?: string | null;
  category?: string | null;
  subcategory?: string | null;
  status: TransactionCategorizationStatus;
  subscriptionId?: string | null;
  reconciliationId?: string | null;
  createdAt: string;
  updatedAt: string;
  /** Enrichment: inferred category confidence 0–1 */
  confidence?: number | null;
  /** Enrichment: subscription indicator */
  isSubscription?: boolean | null;
  currency?: string;
  notes?: string | null;
}

/** Categorization rule (full spec for rules editor) */
export interface CategorizationRuleFull {
  id: string;
  name: string;
  pattern: string;
  conditions: Record<string, unknown>;
  targetCategory: string;
  targetSubcategory?: string | null;
  priority: number;
  enabled: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionException {
  id: string;
  transactionId: string;
  reason: string;
  notes?: string | null;
  reviewedBy?: string | null;
  status: "open" | "resolved";
  createdAt: string;
}

export interface AuditTrailEntry {
  id: string;
  entityType: "transaction" | "rule" | "exception";
  entityId: string;
  action: string;
  actor: string;
  timestamp: string;
  details: string;
}

export interface IngestionRun {
  id: string;
  status: "pending" | "running" | "completed" | "failed";
  startedAt: string;
  completedAt?: string | null;
  newCount: number;
  updatedCount: number;
  error?: string | null;
}

/** Subscriptions & Billing — full spec aligned with API contracts */
export type SubscriptionCadence = "monthly" | "quarterly" | "yearly";

export interface SubscriptionBilling {
  id: string;
  vendor: string;
  cadence: SubscriptionCadence;
  amount: number;
  currency: string;
  status: "active" | "paused" | "canceled";
  startDate: string;
  endDate?: string | null;
  isTracked: boolean;
  nextChargeDate?: string | null;
  spendLimit?: number | null;
  globalCap?: number | null;
  createdAt: string;
  updatedAt: string;
  /** Churn risk 0–1; optional for backward compat */
  churnRiskScore?: number | null;
}

export type ConnectorType = "Stripe" | "PayPal" | "Other";

export type ConnectorStatus = "connected" | "disconnected" | "error";

export interface Connector {
  id: string;
  type: ConnectorType;
  status: ConnectorStatus;
  lastSync?: string | null;
  connectedAt?: string | null;
  config?: Record<string, unknown>;
}

export interface TransactionSubscription {
  id: string;
  subscriptionId?: string | null;
  amount: number;
  category?: string | null;
  date: string;
  status: "completed" | "pending" | "failed";
}

export interface ForecastSubscription {
  id: string;
  subscriptionId?: string | null;
  period: string;
  projectedAmount: number;
}

export interface AuditTrailSubscription {
  id: string;
  action: string;
  entityId: string;
  changes: Record<string, unknown>;
  actor: string;
  timestamp: string;
}

export interface ForecastSubscriptionsResponse {
  lines?: ForecastSubscription[];
  totalProjected?: number;
  period?: string;
}

/** Agent recommendation for subscriptions & billing */
export interface AgentRecommendationBilling {
  id: string;
  context: string;
  action: string;
  expectedROI?: number;
  confidence?: number;
  type?: "spend_optimization" | "churn_reduction" | "subscription_adjustment";
}

/** Monthly close step for subscriptions context */
export interface MonthlyCloseStepBilling {
  id: string;
  name: string;
  status: "open" | "in_progress" | "done";
  dueDate?: string | null;
  relatedSubscriptionIds?: string[];
}

/** Ingestion status for Finance Automation sync */
export interface IngestionStatusBilling {
  status: "idle" | "running" | "completed" | "failed";
  lastRun?: string | null;
  newCount: number;
  updatedCount: number;
  error?: string | null;
}

/** Notification for imminent charges, limit advisories, churn risk */
export interface NotificationItemBilling {
  id: string;
  type: "imminent_charge" | "limit_advisory" | "churn_risk";
  title: string;
  message: string;
  timestamp: string;
  actionUrl?: string | null;
}
