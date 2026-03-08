/**
 * Transactions & Categorization hooks — data fetching with null-safety.
 * Uses mock when VITE_API_URL is not set or VITE_USE_MOCK_FINANCE is true.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "@/api/transactions-categorization";
import {
  getMockTransactions,
  getMockCategorizationRules,
  getMockExceptions,
  getMockAuditLogs,
  getMockLatestIngestion,
} from "@/api/transactions-categorization-mock";
import type { TransactionFilters } from "@/api/transactions-categorization";

const USE_MOCK =
  !import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_USE_MOCK_FINANCE === "true";

const QUERY_KEYS = {
  transactions: ["finance", "transactions"] as const,
  transaction: (id: string) => ["finance", "transaction", id] as const,
  rules: ["finance", "categorization-rules"] as const,
  exceptions: ["finance", "exceptions"] as const,
  audit: (entityType?: string, entityId?: string) =>
    ["finance", "audit", entityType, entityId] as const,
  ingestion: ["finance", "ingestion"] as const,
};

export function useTransactions(filters?: TransactionFilters) {
  const query = useQuery({
    queryKey: [...QUERY_KEYS.transactions, filters],
    queryFn: () =>
      USE_MOCK
        ? Promise.resolve(getMockTransactions(filters))
        : api.fetchTransactions(filters),
    placeholderData: [],
  });
  const items = Array.isArray(query.data) ? query.data : [];
  return { ...query, transactions: items };
}

export function useCategorizationRules() {
  const query = useQuery({
    queryKey: QUERY_KEYS.rules,
    queryFn: () =>
      USE_MOCK
        ? Promise.resolve(getMockCategorizationRules())
        : api.fetchCategorizationRules(),
    placeholderData: [],
  });
  const items = Array.isArray(query.data) ? query.data : [];
  return { ...query, rules: items };
}

export function useExceptions() {
  const query = useQuery({
    queryKey: QUERY_KEYS.exceptions,
    queryFn: async () => {
      if (USE_MOCK) return getMockExceptions();
      const tx = await api.fetchTransactions({ status: "exception" });
      const exList: Array<{ id: string; transactionId: string; reason: string; notes?: string; reviewedBy?: string; status: "open" | "resolved"; createdAt: string }> = [];
      for (const t of tx ?? []) {
        exList.push({
          id: `ex-${t.id}`,
          transactionId: t.id,
          reason: "Exception",
          status: "open",
          createdAt: t.updatedAt,
        });
      }
      return exList;
    },
    placeholderData: [],
  });
  const items = Array.isArray(query.data) ? query.data : [];
  return { ...query, exceptions: items };
}

export function useAuditLogs(entityType?: string, entityId?: string) {
  const query = useQuery({
    queryKey: QUERY_KEYS.audit(entityType, entityId),
    queryFn: () =>
      USE_MOCK
        ? Promise.resolve(getMockAuditLogs(entityType, entityId))
        : api.fetchAuditLogs(entityType, entityId),
    placeholderData: [],
  });
  const items = Array.isArray(query.data) ? query.data : [];
  return { ...query, logs: items };
}

export function useLatestIngestion() {
  const query = useQuery({
    queryKey: QUERY_KEYS.ingestion,
    queryFn: () =>
      USE_MOCK
        ? Promise.resolve(getMockLatestIngestion())
        : api.getLatestIngestion(),
  });
  return { ...query, ingestion: query.data ?? null };
}

export function useTriggerIngestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      USE_MOCK
        ? Promise.resolve({ jobId: "mock-job", status: "pending" })
        : api.triggerIngestion(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ingestion });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions });
      toast.success("Ingestion triggered");
    },
    onError: () => toast.error("Failed to trigger ingestion"),
  });
}

export function useCreateCategorizationRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof api.createCategorizationRule>[0]) =>
      USE_MOCK
        ? Promise.resolve({
            ...payload,
            id: `rule-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as Awaited<ReturnType<typeof api.createCategorizationRule>>)
        : api.createCategorizationRule(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.rules });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions });
      toast.success("Rule created");
    },
    onError: () => toast.error("Failed to create rule"),
  });
}

export function useUpdateCategorizationRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof api.updateCategorizationRule>[1] }) =>
      USE_MOCK
        ? Promise.resolve({ id, ...payload } as Awaited<ReturnType<typeof api.updateCategorizationRule>>)
        : api.updateCategorizationRule(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.rules });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions });
      toast.success("Rule updated");
    },
    onError: () => toast.error("Failed to update rule"),
  });
}

export function useDeleteCategorizationRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      USE_MOCK ? Promise.resolve() : api.deleteCategorizationRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.rules });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions });
      toast.success("Rule deleted");
    },
    onError: () => toast.error("Failed to delete rule"),
  });
}

export function useCategorizeTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, category, subcategory }: { id: string; category: string; subcategory?: string }) =>
      USE_MOCK ? Promise.resolve() : api.categorizeTransaction(id, category, subcategory),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.exceptions });
      toast.success("Transaction categorized");
    },
    onError: () => toast.error("Failed to categorize"),
  });
}

export function useBulkCategorize() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      transactionIds,
      category,
      subcategory,
    }: {
      transactionIds: string[];
      category: string;
      subcategory?: string;
    }) =>
      USE_MOCK
        ? Promise.resolve()
        : api.bulkCategorize(transactionIds ?? [], category, subcategory),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions });
      toast.success("Transactions categorized");
    },
    onError: () => toast.error("Failed to categorize"),
  });
}

export function useAddTransactionException() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason, notes }: { id: string; reason: string; notes?: string }) =>
      USE_MOCK
        ? Promise.resolve({
            id: `ex-${id}`,
            transactionId: id,
            reason,
            notes,
            status: "open" as const,
            createdAt: new Date().toISOString(),
          })
        : api.addTransactionException(id, reason, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.exceptions });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.audit() });
      toast.success("Exception added");
    },
    onError: () => toast.error("Failed to add exception"),
  });
}

export function useReconcileMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      transactionId,
      subscriptionId,
      invoiceId,
    }: {
      transactionId: string;
      subscriptionId?: string | null;
      invoiceId?: string | null;
    }) =>
      USE_MOCK
        ? Promise.resolve()
        : api.reconcileMatch(
            transactionId,
            subscriptionId ?? undefined,
            invoiceId ?? undefined
          ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions });
      toast.success("Transaction matched");
    },
    onError: () => toast.error("Failed to match"),
  });
}
