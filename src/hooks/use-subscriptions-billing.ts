/**
 * Subscriptions & Billing hooks — unified data-fetch with null-safety.
 * Uses mock when VITE_API_URL is not set or VITE_USE_MOCK_FINANCE is true.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "@/api/subscriptions-billing";
import {
  getMockSubscriptionsBilling,
  getMockConnectors,
  getMockForecastSubscriptions,
  getMockAuditSubscriptions,
  getMockRecommendationsBilling,
  getMockMonthlyCloseBilling,
  getMockIngestionStatus,
  getMockNotifications,
} from "@/api/subscriptions-billing-mock";
import type { SubscriptionBilling } from "@/types/finance";

const USE_MOCK =
  !import.meta.env.VITE_API_URL || import.meta.env.VITE_USE_MOCK_FINANCE === "true";

const QUERY_KEYS = {
  subscriptions: ["subscriptions-billing", "subscriptions"] as const,
  connectors: ["subscriptions-billing", "connectors"] as const,
  forecast: ["subscriptions-billing", "forecast"] as const,
  audit: (id?: string | null) => ["subscriptions-billing", "audit", id ?? "recent"] as const,
  recommendations: ["subscriptions-billing", "recommendations"] as const,
  monthlyClose: ["subscriptions-billing", "monthly-close"] as const,
  ingestionStatus: ["subscriptions-billing", "ingestion-status"] as const,
  notifications: ["subscriptions-billing", "notifications"] as const,
};

export function useSubscriptionsBilling(params?: { own?: boolean; tracked?: boolean }) {
  const query = useQuery({
    queryKey: [...QUERY_KEYS.subscriptions, params],
    queryFn: () =>
      USE_MOCK
        ? Promise.resolve({ data: getMockSubscriptionsBilling(), meta: { total: 4 } })
        : api.fetchSubscriptions(params),
    placeholderData: { data: [], meta: { total: 0 } },
  });
  const data = query.data?.data ?? [];
  const items = Array.isArray(data) ? data : [];
  return { ...query, items, total: query.data?.meta?.total ?? items.length };
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subscriptions });
      toast.success("Subscription created");
    },
    onError: () => toast.error("Failed to create subscription"),
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<SubscriptionBilling> }) =>
      api.updateSubscription(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subscriptions });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.audit(undefined) });
      toast.success("Subscription updated");
    },
    onError: () => toast.error("Failed to update subscription"),
  });
}

export function useSetSpendLimit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      subscriptionId,
      limit,
      currency,
    }: {
      subscriptionId: string;
      limit: number;
      currency?: string;
    }) => api.setSpendLimit(subscriptionId, { limit, currency }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subscriptions });
      toast.success("Spend limit updated");
    },
    onError: () => toast.error("Failed to update spend limit"),
  });
}

export function useConnectors() {
  const query = useQuery({
    queryKey: QUERY_KEYS.connectors,
    queryFn: () =>
      USE_MOCK ? Promise.resolve(getMockConnectors()) : api.fetchConnectors(),
    placeholderData: [],
  });
  const items = Array.isArray(query.data) ? query.data : [];
  return { ...query, items };
}

export function useConnectConnector() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.connectConnector,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.connectors });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subscriptions });
      toast.success("Billing processor connected");
    },
    onError: () => toast.error("Failed to connect billing processor"),
  });
}

export function useDisconnectConnector() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.disconnectConnector,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.connectors });
      toast.success("Billing processor disconnected");
    },
    onError: () => toast.error("Failed to disconnect"),
  });
}

export function useForecastSubscriptions() {
  const query = useQuery({
    queryKey: QUERY_KEYS.forecast,
    queryFn: () =>
      USE_MOCK
        ? Promise.resolve(getMockForecastSubscriptions())
        : api.fetchForecastSubscriptions(),
    placeholderData: { lines: [], totalProjected: 0, period: "" },
  });
  const lines = Array.isArray(query.data?.lines) ? query.data.lines : [];
  const totalProjected = query.data?.totalProjected ?? 0;
  const period = query.data?.period ?? "";
  return { ...query, lines, totalProjected, period };
}

export function useAuditSubscriptions(subscriptionId?: string | null) {
  const query = useQuery({
    queryKey: QUERY_KEYS.audit(subscriptionId),
    queryFn: () =>
      USE_MOCK
        ? Promise.resolve(getMockAuditSubscriptions())
        : api.fetchAuditSubscriptions(subscriptionId),
    placeholderData: [],
  });
  const items = Array.isArray(query.data) ? query.data : [];
  return { ...query, items };
}

export function useRecommendationsBilling() {
  const query = useQuery({
    queryKey: QUERY_KEYS.recommendations,
    queryFn: () =>
      USE_MOCK
        ? Promise.resolve(getMockRecommendationsBilling())
        : api.fetchRecommendationsBilling(),
    placeholderData: [],
  });
  const items = Array.isArray(query.data) ? query.data : [];
  return { ...query, items };
}

export function useMonthlyCloseBilling() {
  const query = useQuery({
    queryKey: QUERY_KEYS.monthlyClose,
    queryFn: () =>
      USE_MOCK
        ? Promise.resolve(getMockMonthlyCloseBilling())
        : api.fetchMonthlyCloseBilling(),
    placeholderData: [],
  });
  const items = Array.isArray(query.data) ? query.data : [];
  return { ...query, items };
}

export function useIngestionStatusBilling() {
  const query = useQuery({
    queryKey: QUERY_KEYS.ingestionStatus,
    queryFn: () =>
      USE_MOCK
        ? Promise.resolve(getMockIngestionStatus())
        : api.fetchIngestionStatus(),
    placeholderData: { status: "idle" as const, newCount: 0, updatedCount: 0 },
  });
  return query;
}

export function useNotificationsBilling() {
  const query = useQuery({
    queryKey: QUERY_KEYS.notifications,
    queryFn: () =>
      USE_MOCK
        ? Promise.resolve({ items: getMockNotifications() })
        : api.fetchNotifications(),
    placeholderData: { items: [] },
  });
  const items = Array.isArray(query.data?.items) ? query.data.items : [];
  return { ...query, items };
}
