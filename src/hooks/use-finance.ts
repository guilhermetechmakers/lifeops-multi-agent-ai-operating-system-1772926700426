/**
 * Finance Dashboard hooks — unified data-fetch with null-safety.
 * Uses mock when VITE_API_URL is not set or VITE_USE_MOCK_FINANCE is true.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "@/api/finance";
import { getMockFinanceDashboard } from "@/api/finance-mock";
import type { Transaction } from "@/types/finance";

const USE_MOCK =
  !import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_USE_MOCK_FINANCE === "true";

const QUERY_KEYS = {
  dashboard: ["finance", "dashboard"] as const,
  subscriptions: ["finance", "subscriptions"] as const,
  anomalies: ["finance", "anomalies"] as const,
  forecast: ["finance", "forecast"] as const,
  monthlyClose: ["finance", "monthly-close"] as const,
  recommendations: ["finance", "recommendations"] as const,
};

export function useFinanceDashboard() {
  const query = useQuery({
    queryKey: QUERY_KEYS.dashboard,
    queryFn: () =>
      USE_MOCK ? Promise.resolve(getMockFinanceDashboard()) : api.fetchFinanceDashboard(),
    placeholderData: {
      balances: { total: 0, currency: "USD" },
      spend: { monthly: 0, currency: "USD" },
      forecast: { value: 0, currency: "USD", horizon: "30d" },
      opportunities: { amount: 0, count: 0 },
      transactions: [],
      subscriptions: [],
      anomalies: [],
      forecastData: [],
      monthlyCloseItems: [],
      recommendations: [],
    },
  });
  const data = query.data;
  const transactions = (data?.transactions ?? []) as Transaction[];
  const subscriptions = data?.subscriptions ?? [];
  const anomalies = data?.anomalies ?? [];
  const forecastData = data?.forecastData ?? [];
  const monthlyCloseItems = data?.monthlyCloseItems ?? [];
  const recommendations = data?.recommendations ?? [];
  return {
    ...query,
    data,
    transactions: Array.isArray(transactions) ? transactions : [],
    subscriptions: Array.isArray(subscriptions) ? subscriptions : [],
    anomalies: Array.isArray(anomalies) ? anomalies : [],
    forecastData: Array.isArray(forecastData) ? forecastData : [],
    monthlyCloseItems: Array.isArray(monthlyCloseItems) ? monthlyCloseItems : [],
    recommendations: Array.isArray(recommendations) ? recommendations : [],
  };
}

export function useIngestTransactions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (transactions: Transaction[]) =>
      api.ingestTransactions(Array.isArray(transactions) ? transactions : []),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
      toast.success("Transactions ingested");
    },
    onError: () => toast.error("Failed to ingest transactions"),
  });
}

export function useCategorizeTransactions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ruleId, transactionIds }: { ruleId: string; transactionIds: string[] }) =>
      api.categorizeTransactions(ruleId, transactionIds ?? []),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
      toast.success("Transactions categorized");
    },
    onError: () => toast.error("Failed to categorize"),
  });
}

export function useSubscriptions() {
  const query = useQuery({
    queryKey: QUERY_KEYS.subscriptions,
    queryFn: () =>
      USE_MOCK
        ? Promise.resolve(getMockFinanceDashboard().subscriptions)
        : api.fetchSubscriptions(),
    placeholderData: [],
  });
  const items = Array.isArray(query.data) ? query.data : [];
  return { ...query, items };
}

export function useConnectBillingProcessor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ provider, credentials }: { provider: string; credentials: unknown }) =>
      api.connectBillingProcessor(provider, credentials),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subscriptions });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
      toast.success("Billing processor connected");
    },
    onError: () => toast.error("Failed to connect billing processor"),
  });
}

export function useAnomalies() {
  const query = useQuery({
    queryKey: QUERY_KEYS.anomalies,
    queryFn: () =>
      USE_MOCK
        ? Promise.resolve(getMockFinanceDashboard().anomalies)
        : api.fetchAnomalies(),
    placeholderData: [],
  });
  const items = Array.isArray(query.data) ? query.data : [];
  return { ...query, items };
}

export function useForecast() {
  const query = useQuery({
    queryKey: QUERY_KEYS.forecast,
    queryFn: () =>
      USE_MOCK
        ? Promise.resolve(getMockFinanceDashboard().forecastData)
        : api.fetchForecast(),
    placeholderData: [],
  });
  const items = Array.isArray(query.data) ? query.data : [];
  return { ...query, items };
}

export function useMonthlyClose() {
  const query = useQuery({
    queryKey: QUERY_KEYS.monthlyClose,
    queryFn: () =>
      USE_MOCK
        ? Promise.resolve(getMockFinanceDashboard().monthlyCloseItems)
        : api.fetchMonthlyClose(),
    placeholderData: [],
  });
  const items = Array.isArray(query.data) ? query.data : [];
  return { ...query, items };
}

export function useApproveCloseTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      approverId,
      notes,
    }: {
      taskId: string;
      approverId: string;
      notes?: string;
    }) => api.approveCloseTask(taskId, approverId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.monthlyClose });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
      toast.success("Task approved");
    },
    onError: () => toast.error("Failed to approve task"),
  });
}

export function useRecommendations() {
  const query = useQuery({
    queryKey: QUERY_KEYS.recommendations,
    queryFn: () =>
      USE_MOCK
        ? Promise.resolve(getMockFinanceDashboard().recommendations)
        : api.fetchRecommendations(),
    placeholderData: [],
  });
  const items = Array.isArray(query.data) ? query.data : [];
  return { ...query, items };
}
