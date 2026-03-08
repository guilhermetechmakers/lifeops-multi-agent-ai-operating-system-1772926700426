/**
 * Billing History hooks — consolidated invoices, payments, subscription changes, usage.
 * All array returns are safe: (data ?? []). Validation on API response shapes.
 */

import { useQuery } from "@tanstack/react-query";
import * as api from "@/api/billing-history";
import type { BillingHistoryFilters } from "@/types/billing-history";

const QUERY_KEYS = {
  history: (filters?: BillingHistoryFilters) => ["billing", "history", filters] as const,
};

export function useBillingHistory(filters?: BillingHistoryFilters) {
  const query = useQuery({
    queryKey: QUERY_KEYS.history(filters),
    queryFn: () => api.getBillingHistory(filters),
  });
  const data = query.data;
  const invoices = Array.isArray(data?.invoices) ? data.invoices : [];
  const payments = Array.isArray(data?.payments) ? data.payments : [];
  const changes = Array.isArray(data?.changes) ? data.changes : [];
  const usageEntries = Array.isArray(data?.usageEntries) ? data.usageEntries : [];
  const receipts = Array.isArray(data?.receipts) ? data.receipts : [];
  return {
    ...query,
    invoices,
    payments,
    changes,
    usageEntries,
    receipts,
  };
}
