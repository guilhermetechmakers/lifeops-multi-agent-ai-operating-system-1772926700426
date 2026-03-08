/**
 * Mock Transactions & Categorization API — returns realistic mock data for development.
 */

import type {
  TransactionEnriched,
  CategorizationRuleFull,
  TransactionException,
  AuditTrailEntry,
  IngestionRun,
} from "@/types/finance";
import type { TransactionFilters } from "./transactions-categorization";

const MOCK_TRANSACTIONS: TransactionEnriched[] = [
  {
    id: "tx-1",
    date: "2025-03-07T10:00:00Z",
    merchant: "Netflix",
    amount: -49.99,
    accountId: "acc-1",
    rawCategory: "Entertainment",
    categorizedCategory: "SaaS",
    category: "SaaS",
    subcategory: "Streaming",
    status: "categorized",
    subscriptionId: "sub-1",
    reconciliationId: null,
    createdAt: "2025-03-07T10:00:00Z",
    updatedAt: "2025-03-07T10:05:00Z",
    confidence: 0.95,
    isSubscription: true,
    currency: "USD",
  },
  {
    id: "tx-2",
    date: "2025-03-06T14:30:00Z",
    merchant: "Adobe Creative Cloud",
    amount: -129.0,
    accountId: "acc-1",
    rawCategory: "Software",
    categorizedCategory: "SaaS",
    category: "SaaS",
    subcategory: "Productivity",
    status: "categorized",
    subscriptionId: "sub-2",
    reconciliationId: null,
    createdAt: "2025-03-06T14:30:00Z",
    updatedAt: "2025-03-06T14:35:00Z",
    confidence: 0.92,
    isSubscription: true,
    currency: "USD",
  },
  {
    id: "tx-3",
    date: "2025-03-05T09:15:00Z",
    merchant: "Employer Inc",
    amount: 4200.0,
    accountId: "acc-1",
    rawCategory: "Payroll",
    categorizedCategory: "Income",
    category: "Income",
    subcategory: "Salary",
    status: "categorized",
    subscriptionId: null,
    reconciliationId: null,
    createdAt: "2025-03-05T09:15:00Z",
    updatedAt: "2025-03-05T09:15:00Z",
    confidence: 1.0,
    isSubscription: false,
    currency: "USD",
    notes: "Payroll",
  },
  {
    id: "tx-4",
    date: "2025-03-04T11:00:00Z",
    merchant: "Unknown Vendor",
    amount: -89.5,
    accountId: "acc-1",
    rawCategory: "Uncategorized",
    categorizedCategory: null,
    category: null,
    subcategory: null,
    status: "exception",
    subscriptionId: null,
    reconciliationId: null,
    createdAt: "2025-03-04T11:00:00Z",
    updatedAt: "2025-03-04T12:00:00Z",
    confidence: 0.2,
    isSubscription: false,
    currency: "USD",
    notes: "Unusual amount",
  },
  {
    id: "tx-5",
    date: "2025-03-03T16:00:00Z",
    merchant: "Spotify",
    amount: -15.99,
    accountId: "acc-1",
    rawCategory: "Music",
    categorizedCategory: "SaaS",
    category: "SaaS",
    subcategory: "Streaming",
    status: "categorized",
    subscriptionId: "sub-3",
    reconciliationId: null,
    createdAt: "2025-03-03T16:00:00Z",
    updatedAt: "2025-03-03T16:02:00Z",
    confidence: 0.98,
    isSubscription: true,
    currency: "USD",
  },
  {
    id: "tx-6",
    date: "2025-03-02T08:00:00Z",
    merchant: "AWS",
    amount: -234.5,
    accountId: "acc-1",
    rawCategory: "Cloud",
    categorizedCategory: null,
    category: null,
    subcategory: null,
    status: "enriched",
    subscriptionId: null,
    reconciliationId: null,
    createdAt: "2025-03-02T08:00:00Z",
    updatedAt: "2025-03-02T08:00:00Z",
    confidence: 0.75,
    isSubscription: false,
    currency: "USD",
  },
];

const MOCK_RULES: CategorizationRuleFull[] = [
  {
    id: "rule-1",
    name: "Netflix → SaaS",
    pattern: "Netflix",
    conditions: { merchantContains: "Netflix" },
    targetCategory: "SaaS",
    targetSubcategory: "Streaming",
    priority: 1,
    enabled: true,
    createdBy: "u1",
    createdAt: "2025-02-01T00:00:00Z",
    updatedAt: "2025-02-01T00:00:00Z",
  },
  {
    id: "rule-2",
    name: "Adobe → SaaS",
    pattern: "Adobe",
    conditions: { merchantContains: "Adobe" },
    targetCategory: "SaaS",
    targetSubcategory: "Productivity",
    priority: 2,
    enabled: true,
    createdBy: "u1",
    createdAt: "2025-02-01T00:00:00Z",
    updatedAt: "2025-02-01T00:00:00Z",
  },
];

const MOCK_EXCEPTIONS: TransactionException[] = [
  {
    id: "ex-1",
    transactionId: "tx-4",
    reason: "Unusual amount for merchant category",
    notes: "Transaction amount 2.5x above typical",
    reviewedBy: null,
    status: "open",
    createdAt: "2025-03-04T12:00:00Z",
  },
];

const MOCK_AUDIT: AuditTrailEntry[] = [
  {
    id: "audit-1",
    entityType: "transaction",
    entityId: "tx-4",
    action: "exception_added",
    actor: "u1",
    timestamp: "2025-03-04T12:00:00Z",
    details: "Flagged as exception: Unusual amount",
  },
  {
    id: "audit-2",
    entityType: "rule",
    entityId: "rule-1",
    action: "created",
    actor: "u1",
    timestamp: "2025-02-01T00:00:00Z",
    details: "Created rule: Netflix → SaaS",
  },
];

let mockIngestionRun: IngestionRun = {
  id: "ing-1",
  status: "completed",
  startedAt: "2025-03-07T09:00:00Z",
  completedAt: "2025-03-07T09:05:00Z",
  newCount: 2,
  updatedCount: 4,
};

/** In-memory store for mock mutations (dev only) */
let mockTransactionsStore = [...MOCK_TRANSACTIONS];
let mockRulesStore = [...MOCK_RULES];
let mockExceptionsStore = [...MOCK_EXCEPTIONS];
let mockAuditStore = [...MOCK_AUDIT];

export function getMockTransactions(filters?: TransactionFilters): TransactionEnriched[] {
  let out = [...mockTransactionsStore];
  if (filters?.merchant) {
    const q = (filters.merchant ?? "").toLowerCase();
    out = out.filter((t) => (t.merchant ?? "").toLowerCase().includes(q));
  }
  if (filters?.category) {
    out = out.filter(
      (t) => (t.category ?? t.categorizedCategory ?? "") === filters.category
    );
  }
  if (filters?.status) {
    out = out.filter((t) => t.status === filters.status);
  }
  if (filters?.dateFrom) {
    out = out.filter((t) => t.date >= (filters.dateFrom ?? ""));
  }
  if (filters?.dateTo) {
    out = out.filter((t) => t.date <= (filters.dateTo ?? ""));
  }
  return out;
}

export function getMockTransactionsStore(): TransactionEnriched[] {
  return mockTransactionsStore;
}

export function setMockTransactionsStore(tx: TransactionEnriched[]): void {
  mockTransactionsStore = tx;
}

export function getMockCategorizationRules(): CategorizationRuleFull[] {
  return [...mockRulesStore];
}

export function getMockRulesStore(): CategorizationRuleFull[] {
  return mockRulesStore;
}

export function setMockRulesStore(rules: CategorizationRuleFull[]): void {
  mockRulesStore = rules;
}

export function getMockExceptions(): TransactionException[] {
  return [...mockExceptionsStore];
}

export function getMockExceptionsStore(): TransactionException[] {
  return mockExceptionsStore;
}

export function setMockExceptionsStore(ex: TransactionException[]): void {
  mockExceptionsStore = ex;
}

export function addMockAuditEntry(entry: Omit<AuditTrailEntry, "id">): void {
  mockAuditStore = [
    {
      ...entry,
      id: `audit-${Date.now()}`,
    },
    ...mockAuditStore,
  ];
}

export function getMockAuditLogs(
  entityType?: string,
  entityId?: string
): AuditTrailEntry[] {
  let out = [...mockAuditStore];
  if (entityType) out = out.filter((e) => e.entityType === entityType);
  if (entityId) out = out.filter((e) => e.entityId === entityId);
  return out;
}

export function getMockAuditStore(): AuditTrailEntry[] {
  return mockAuditStore;
}

export function getMockIngestionRun(): IngestionRun {
  return { ...mockIngestionRun };
}

export function setMockIngestionRun(run: IngestionRun): void {
  mockIngestionRun = run;
}

/** Alias for hook compatibility */
export function getMockLatestIngestion(): IngestionRun {
  return getMockIngestionRun();
}
