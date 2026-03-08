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

/** Transactions & Categorization — enriched transaction with full spec fields */
export type TransactionStatusEnriched =
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
  status: TransactionStatusEnriched;
  subscriptionId?: string | null;
  reconciliationId?: string | null;
  createdAt: string;
  updatedAt: string;
  /** Inferred category from automation (for display) */
  inferredCategory?: string | null;
  /** Confidence 0–1 for auto-categorization */
  confidence?: number | null;
  /** Subscription hint from enrichment */
  subscriptionHint?: boolean | null;
}

/** Categorization rule with full spec (pattern, conditions, priority) */
export interface CategorizationRuleEnriched {
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
  notes?: string;
  reviewedBy?: string;
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

export interface IngestionJob {
  id: string;
  status: "pending" | "running" | "completed" | "failed";
  newCount: number;
  updatedCount: number;
  startedAt?: string;
  completedAt?: string;
  error?: string;
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
