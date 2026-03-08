/**
 * Transactions & Categorization API — transactions, rules, exceptions, audit, ingestion.
 * Uses native fetch via src/lib/api.ts. All responses validated with safe array/object guards.
 */

import { api, safeArray } from "@/lib/api";
import type {
  TransactionEnriched,
  CategorizationRuleFull,
  TransactionException,
  AuditTrailEntry,
  IngestionRun,
} from "@/types/finance";

const BASE = "/finance/transactions";

export interface TransactionFilters {
  dateFrom?: string;
  dateTo?: string;
  merchant?: string;
  category?: string;
  status?: string;
  accountId?: string;
}

function asTransactions(data: unknown): TransactionEnriched[] {
  return safeArray<TransactionEnriched>(data);
}

function asRules(data: unknown): CategorizationRuleFull[] {
  return safeArray<CategorizationRuleFull>(data);
}

function asAuditLogs(data: unknown): AuditTrailEntry[] {
  return safeArray<AuditTrailEntry>(data);
}

export async function fetchTransactions(
  filters?: TransactionFilters
): Promise<TransactionEnriched[]> {
  const params = new URLSearchParams();
  if (filters?.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters?.dateTo) params.set("dateTo", filters.dateTo);
  if (filters?.merchant) params.set("merchant", filters.merchant);
  if (filters?.category) params.set("category", filters.category);
  if (filters?.status) params.set("status", filters.status);
  if (filters?.accountId) params.set("accountId", filters.accountId);
  const qs = params.toString();
  const raw = await api.get<TransactionEnriched[] | { data?: TransactionEnriched[] }>(
    `${BASE}${qs ? `?${qs}` : ""}`
  );
  const data = Array.isArray(raw) ? raw : (raw as { data?: TransactionEnriched[] })?.data;
  return asTransactions(data);
}

export async function fetchTransaction(id: string): Promise<TransactionEnriched | null> {
  const raw = await api.get<TransactionEnriched | { data?: TransactionEnriched }>(
    `${BASE}/${id}`
  );
  const data = typeof raw === "object" && raw !== null && "id" in raw
    ? (raw as TransactionEnriched)
    : (raw as { data?: TransactionEnriched })?.data ?? null;
  return data ?? null;
}

export async function triggerIngestion(): Promise<{ jobId: string; status: string }> {
  const res = await api.post<{ jobId?: string; status?: string }>(`${BASE}/ingest`, {});
  return {
    jobId: res?.jobId ?? "",
    status: res?.status ?? "pending",
  };
}

export async function fetchCategorizationRules(): Promise<CategorizationRuleFull[]> {
  const raw = await api.get<
    CategorizationRuleFull[] | { data?: CategorizationRuleFull[] }
  >("/finance/categorization/rules");
  const data = Array.isArray(raw) ? raw : (raw as { data?: CategorizationRuleFull[] })?.data;
  return asRules(data);
}

export async function createCategorizationRule(
  payload: Omit<CategorizationRuleFull, "id" | "createdAt" | "updatedAt">
): Promise<CategorizationRuleFull> {
  const res = await api.post<CategorizationRuleFull | { data?: CategorizationRuleFull }>(
    "/finance/categorization/rules",
    payload
  );
  const data = typeof res === "object" && res !== null && "id" in res
    ? (res as CategorizationRuleFull)
    : (res as { data?: CategorizationRuleFull })?.data;
  if (!data) throw new Error("Failed to create rule");
  return data;
}

export async function updateCategorizationRule(
  id: string,
  payload: Partial<Omit<CategorizationRuleFull, "id" | "createdAt" | "updatedAt">>
): Promise<CategorizationRuleFull> {
  const res = await api.put<CategorizationRuleFull | { data?: CategorizationRuleFull }>(
    `/finance/categorization/rules/${id}`,
    payload
  );
  const data = typeof res === "object" && res !== null && "id" in res
    ? (res as CategorizationRuleFull)
    : (res as { data?: CategorizationRuleFull })?.data;
  if (!data) throw new Error("Failed to update rule");
  return data;
}

export async function deleteCategorizationRule(id: string): Promise<void> {
  await api.delete(`/finance/categorization/rules/${id}`);
}

export async function categorizeTransaction(
  id: string,
  category: string,
  subcategory?: string
): Promise<void> {
  await api.post(`${BASE}/${id}/categorize`, { category, subcategory });
}

export async function bulkCategorize(
  transactionIds: string[],
  category: string,
  subcategory?: string
): Promise<void> {
  const ids = Array.isArray(transactionIds) ? transactionIds : [];
  await api.post(`${BASE}/bulk-categorize`, {
    transactionIds: ids,
    category,
    subcategory,
  });
}

export async function addTransactionException(
  id: string,
  reason: string,
  notes?: string
): Promise<TransactionException> {
  const res = await api.post<TransactionException | { data?: TransactionException }>(
    `${BASE}/${id}/exception`,
    { reason, notes }
  );
  const data = typeof res === "object" && res !== null && "id" in res
    ? (res as TransactionException)
    : (res as { data?: TransactionException })?.data;
  if (!data) throw new Error("Failed to add exception");
  return data;
}

export async function reconcileMatch(
  transactionId: string,
  subscriptionId?: string,
  invoiceId?: string
): Promise<void> {
  await api.post("/finance/reconcile/match", {
    transactionId,
    subscriptionId: subscriptionId ?? null,
    invoiceId: invoiceId ?? null,
  });
}

export async function fetchAuditLogs(
  entityType?: string,
  entityId?: string
): Promise<AuditTrailEntry[]> {
  const params = new URLSearchParams();
  if (entityType) params.set("entityType", entityType);
  if (entityId) params.set("entityId", entityId);
  const qs = params.toString();
  const raw = await api.get<AuditTrailEntry[] | { data?: AuditTrailEntry[] }>(
    `/finance/audit/logs${qs ? `?${qs}` : ""}`
  );
  const data = Array.isArray(raw) ? raw : (raw as { data?: AuditTrailEntry[] })?.data;
  return asAuditLogs(data);
}

export async function getLatestIngestion(): Promise<IngestionRun | null> {
  const raw = await api.get<IngestionRun | { data?: IngestionRun }>(
    `${BASE}/ingestion/latest`
  );
  const data = typeof raw === "object" && raw !== null && "id" in raw
    ? (raw as IngestionRun)
    : (raw as { data?: IngestionRun })?.data ?? null;
  return data ?? null;
}
