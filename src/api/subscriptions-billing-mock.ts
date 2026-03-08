/**
 * Mock Subscriptions & Billing API — returns realistic data when backend is unavailable.
 */

import type {
  SubscriptionBilling,
  Connector,
  ForecastSubscription,
  ForecastSubscriptionsResponse,
  AuditTrailSubscription,
  AgentRecommendationBilling,
  MonthlyCloseStepBilling,
  IngestionStatusBilling,
  NotificationItemBilling,
} from "@/types/finance";

const MOCK_SUBSCRIPTIONS: SubscriptionBilling[] = [
  {
    id: "sub-1",
    vendor: "Netflix",
    cadence: "monthly",
    amount: 49.99,
    currency: "USD",
    status: "active",
    startDate: "2024-01-15",
    endDate: null,
    isTracked: true,
    nextChargeDate: "2025-04-07",
    spendLimit: 60,
    globalCap: null,
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2025-03-01T00:00:00Z",
    churnRiskScore: 0.1,
  },
  {
    id: "sub-2",
    vendor: "Adobe",
    cadence: "monthly",
    amount: 129,
    currency: "USD",
    status: "active",
    startDate: "2024-02-01",
    endDate: null,
    isTracked: true,
    nextChargeDate: "2025-04-06",
    spendLimit: 150,
    globalCap: null,
    createdAt: "2024-02-01T00:00:00Z",
    updatedAt: "2025-03-01T00:00:00Z",
    churnRiskScore: 0.35,
  },
  {
    id: "sub-3",
    vendor: "Spotify",
    cadence: "monthly",
    amount: 15.99,
    currency: "USD",
    status: "active",
    startDate: "2023-06-01",
    endDate: null,
    isTracked: true,
    nextChargeDate: "2025-04-03",
    spendLimit: null,
    globalCap: null,
    createdAt: "2023-06-01T00:00:00Z",
    updatedAt: "2025-03-01T00:00:00Z",
    churnRiskScore: 0.05,
  },
  {
    id: "sub-4",
    vendor: "Figma",
    cadence: "yearly",
    amount: 150,
    currency: "USD",
    status: "active",
    startDate: "2024-03-01",
    endDate: null,
    isTracked: true,
    nextChargeDate: "2026-03-01",
    spendLimit: 200,
    globalCap: null,
    createdAt: "2024-03-01T00:00:00Z",
    updatedAt: "2025-03-01T00:00:00Z",
    churnRiskScore: 0.22,
  },
];

const MOCK_CONNECTORS: Connector[] = [
  {
    id: "conn-1",
    type: "Stripe",
    status: "connected",
    lastSync: "2025-03-07T10:00:00Z",
    connectedAt: "2024-01-10T00:00:00Z",
    config: {},
  },
  {
    id: "conn-2",
    type: "PayPal",
    status: "disconnected",
    lastSync: null,
    connectedAt: null,
    config: {},
  },
];

const MOCK_FORECAST: ForecastSubscriptionsResponse = {
  lines: [
    { id: "f1", subscriptionId: "sub-1", period: "2025-04", projectedAmount: 49.99 },
    { id: "f2", subscriptionId: "sub-2", period: "2025-04", projectedAmount: 129 },
    { id: "f3", subscriptionId: "sub-3", period: "2025-04", projectedAmount: 15.99 },
    { id: "f4", subscriptionId: "sub-4", period: "2026-03", projectedAmount: 150 },
  ] as ForecastSubscription[],
  totalProjected: 344.98,
  period: "2025-04",
};

const MOCK_AUDIT: AuditTrailSubscription[] = [
  {
    id: "aud-1",
    action: "subscription.updated",
    entityId: "sub-2",
    changes: { spendLimit: { from: 120, to: 150 } },
    actor: "user@example.com",
    timestamp: "2025-03-07T14:30:00Z",
  },
  {
    id: "aud-2",
    action: "connector.connected",
    entityId: "conn-1",
    changes: { status: "connected" },
    actor: "user@example.com",
    timestamp: "2025-03-06T09:00:00Z",
  },
];

const MOCK_RECOMMENDATIONS: AgentRecommendationBilling[] = [
  {
    id: "rec-1",
    context: "Duplicate SaaS subscriptions detected",
    action: "Consolidate Adobe and Figma to single team plan",
    expectedROI: 0.25,
    confidence: 0.88,
    type: "spend_optimization",
  },
  {
    id: "rec-2",
    context: "Adobe churn risk elevated",
    action: "Offer annual discount to reduce churn",
    expectedROI: 0.15,
    confidence: 0.72,
    type: "churn_reduction",
  },
];

const MOCK_MONTHLY_CLOSE: MonthlyCloseStepBilling[] = [
  {
    id: "mc-1",
    name: "Reconcile subscription charges",
    status: "in_progress",
    dueDate: "2025-03-10",
    relatedSubscriptionIds: ["sub-1", "sub-2", "sub-3"],
  },
  {
    id: "mc-2",
    name: "Verify spend limits vs actual",
    status: "open",
    dueDate: "2025-03-12",
    relatedSubscriptionIds: [],
  },
  {
    id: "mc-3",
    name: "Close subscription books",
    status: "open",
    dueDate: "2025-03-15",
    relatedSubscriptionIds: [],
  },
];

const MOCK_INGESTION: IngestionStatusBilling = {
  status: "completed",
  lastRun: "2025-03-07T10:00:00Z",
  newCount: 3,
  updatedCount: 2,
  error: null,
};

const MOCK_NOTIFICATIONS: NotificationItemBilling[] = [
  {
    id: "n1",
    type: "imminent_charge",
    title: "Netflix charge in 2 days",
    message: "USD 49.99 on Apr 7",
    timestamp: "2025-03-07T00:00:00Z",
    actionUrl: "/dashboard/finance/subscriptions",
  },
  {
    id: "n2",
    type: "limit_advisory",
    title: "Adobe approaching spend limit",
    message: "Current: $129, limit: $150",
    timestamp: "2025-03-06T00:00:00Z",
  },
  {
    id: "n3",
    type: "churn_risk",
    title: "Adobe churn risk: Medium",
    message: "Consider retention offer",
    timestamp: "2025-03-05T00:00:00Z",
    actionUrl: "/dashboard/finance/subscriptions",
  },
];

export function getMockSubscriptionsBilling(): SubscriptionBilling[] {
  return [...MOCK_SUBSCRIPTIONS];
}

export function getMockConnectors(): Connector[] {
  return [...MOCK_CONNECTORS];
}

export function getMockForecastSubscriptions(): ForecastSubscriptionsResponse {
  return { ...MOCK_FORECAST };
}

export function getMockAuditSubscriptions(): AuditTrailSubscription[] {
  return [...MOCK_AUDIT];
}

export function getMockRecommendationsBilling(): AgentRecommendationBilling[] {
  return [...MOCK_RECOMMENDATIONS];
}

export function getMockMonthlyCloseBilling(): MonthlyCloseStepBilling[] {
  return [...MOCK_MONTHLY_CLOSE];
}

export function getMockIngestionStatus(): IngestionStatusBilling {
  return { ...MOCK_INGESTION };
}

export function getMockNotifications(): NotificationItemBilling[] {
  return [...MOCK_NOTIFICATIONS];
}
