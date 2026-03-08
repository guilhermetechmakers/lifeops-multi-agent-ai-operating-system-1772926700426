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
