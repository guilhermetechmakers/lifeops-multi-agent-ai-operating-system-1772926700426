/**
 * Mock Finance API — returns realistic mock data when backend is unavailable.
 * Used for development and when VITE_API_URL points to a mock server.
 */

import type {
  FinanceDashboardData,
  Transaction,
  Subscription,
  Anomaly,
  Forecast,
  MonthlyCloseTask,
  AgentRecommendation,
} from "@/types/finance";

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    date: "2025-03-07T10:00:00Z",
    amount: -49.99,
    currency: "USD",
    categoryId: "cat-saas",
    status: "posted",
    notes: "",
    userId: "u1",
    merchant: "Netflix",
  },
  {
    id: "tx-2",
    date: "2025-03-06T14:30:00Z",
    amount: -129.0,
    currency: "USD",
    categoryId: "cat-saas",
    status: "posted",
    notes: "",
    userId: "u1",
    merchant: "Adobe Creative Cloud",
  },
  {
    id: "tx-3",
    date: "2025-03-05T09:15:00Z",
    amount: 4200.0,
    currency: "USD",
    categoryId: "cat-income",
    status: "posted",
    notes: "Payroll",
    userId: "u1",
    merchant: "Employer Inc",
  },
  {
    id: "tx-4",
    date: "2025-03-04T11:00:00Z",
    amount: -89.5,
    currency: "USD",
    categoryId: null,
    status: "flagged",
    notes: "Unusual amount",
    userId: "u1",
    merchant: "Unknown Vendor",
  },
  {
    id: "tx-5",
    date: "2025-03-03T16:00:00Z",
    amount: -15.99,
    currency: "USD",
    categoryId: "cat-saas",
    status: "posted",
    notes: "",
    userId: "u1",
    merchant: "Spotify",
  },
];

const MOCK_SUBSCRIPTIONS: Subscription[] = [
  {
    id: "sub-1",
    userId: "u1",
    provider: "Netflix",
    plan: "Premium",
    amount: 49.99,
    currency: "USD",
    nextBillingDate: "2025-04-07",
    status: "active",
    churnRiskScore: 0.1,
    isTracked: true,
  },
  {
    id: "sub-2",
    userId: "u1",
    provider: "Adobe",
    plan: "All Apps",
    amount: 129.0,
    currency: "USD",
    nextBillingDate: "2025-04-06",
    status: "active",
    churnRiskScore: 0.35,
    isTracked: true,
  },
  {
    id: "sub-3",
    userId: "u1",
    provider: "Spotify",
    plan: "Family",
    amount: 15.99,
    currency: "USD",
    nextBillingDate: "2025-04-03",
    status: "active",
    churnRiskScore: 0.05,
    isTracked: true,
  },
];

const MOCK_ANOMALIES: Anomaly[] = [
  {
    id: "an-1",
    transactionId: "tx-4",
    detectedBy: "anomaly-agent",
    severity: "medium",
    rationale: "Transaction amount 2.5x above typical for this merchant category.",
    status: "open",
  },
];

const MOCK_FORECASTS: Forecast[] = [
  { id: "f1", horizon: "30d", series: "revenue", value: 4200, confidence: 0.92 },
  { id: "f2", horizon: "30d", series: "expense", value: -1850, confidence: 0.88 },
  { id: "f3", horizon: "60d", series: "revenue", value: 8400, confidence: 0.85 },
  { id: "f4", horizon: "60d", series: "expense", value: -3700, confidence: 0.82 },
];

const MOCK_MONTHLY_CLOSE: MonthlyCloseTask[] = [
  {
    id: "mc-1",
    name: "Reconcile bank statements",
    dueDate: "2025-03-10",
    ownerId: "u1",
    status: "in_progress",
    relatedRuns: ["run-1"],
  },
  {
    id: "mc-2",
    name: "Approve expense reports",
    dueDate: "2025-03-12",
    ownerId: "u1",
    status: "open",
    relatedRuns: [],
  },
  {
    id: "mc-3",
    name: "Close books",
    dueDate: "2025-03-15",
    ownerId: "u1",
    status: "open",
    relatedRuns: [],
  },
];

const MOCK_RECOMMENDATIONS: AgentRecommendation[] = [
  {
    id: "rec-1",
    context: "Duplicate SaaS subscriptions detected",
    action: "Consolidate Adobe and Figma to single team plan",
    expectedROI: 0.25,
    confidence: 0.88,
  },
  {
    id: "rec-2",
    context: "Unused subscription",
    action: "Cancel Spotify Family — low usage in 90 days",
    expectedROI: 0.15,
    confidence: 0.72,
  },
];

export function getMockFinanceDashboard(): FinanceDashboardData {
  return {
    balances: { total: 5500, currency: "USD" },
    spend: { monthly: 1850, currency: "USD", trend: 0.05 },
    forecast: { value: 2350, currency: "USD", horizon: "30d" },
    opportunities: { amount: 420, count: 2 },
    transactions: MOCK_TRANSACTIONS,
    subscriptions: MOCK_SUBSCRIPTIONS,
    anomalies: MOCK_ANOMALIES,
    forecastData: MOCK_FORECASTS,
    monthlyCloseItems: MOCK_MONTHLY_CLOSE,
    recommendations: MOCK_RECOMMENDATIONS,
  };
}
