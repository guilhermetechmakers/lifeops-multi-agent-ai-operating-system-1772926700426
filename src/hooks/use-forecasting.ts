/**
 * Forecasting & Reports hooks — data fetch with null-safety.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import * as api from "@/api/forecasting";
import {
  getMockBaseline,
  getMockComputeForecast,
  getMockForecastData,
  getMockReportsHistory,
  getMockInsights,
  mockExportReport,
} from "@/api/forecasting-mock";
import type { ScenarioInputs, Scenario, ReportArtifact, InsightItem } from "@/types/forecasting";

const USE_MOCK =
  !import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_USE_MOCK_FINANCE === "true";

const QUERY_KEYS = {
  baseline: (period: string) => ["forecasting", "baseline", period] as const,
  forecastData: (runId: string) => ["forecasting", "data", runId] as const,
  reportsHistory: (period: string) => ["forecasting", "reports", period] as const,
  insights: (period: string) => ["forecasting", "insights", period] as const,
};

function getDefaultPeriod(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function useForecastingBaseline(period?: string) {
  const p = period ?? getDefaultPeriod();
  const query = useQuery({
    queryKey: QUERY_KEYS.baseline(p),
    queryFn: () =>
      USE_MOCK ? Promise.resolve(getMockBaseline(p)) : api.fetchBaseline(p),
    placeholderData: { period: p, baseline: [], horizon: 12, status: "pending" },
  });
  const baseline = (query.data?.baseline ?? []) as number[];
  const mockData = query.data as { dates?: string[] } | undefined;
  const dates = (mockData?.dates ?? []) as string[];
  return {
    ...query,
    period: p,
    baseline: Array.isArray(baseline) ? baseline : [],
    dates: Array.isArray(dates) ? dates : [],
    horizon: query.data?.horizon ?? 12,
  };
}

export function useComputeForecast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      period: string;
      scenarios: ScenarioInputs[];
      horizon?: number;
    }) => {
      const { period, scenarios, horizon = 12 } = payload;
      if (USE_MOCK) {
        return Promise.resolve(getMockComputeForecast(period, scenarios));
      }
      return api.computeForecast({
        period,
        scenarios,
        horizon,
      });
    },
    onSuccess: (data) => {
      if (data?.runId) {
        queryClient.invalidateQueries({
          queryKey: ["forecasting", "data", data.runId],
        });
        toast.success("Forecast computed");
      }
    },
    onError: () => toast.error("Failed to compute forecast"),
  });
}

export function useForecastData(runId: string | null) {
  const query = useQuery({
    queryKey: QUERY_KEYS.forecastData(runId ?? ""),
    queryFn: () =>
      runId
        ? USE_MOCK
          ? Promise.resolve(getMockForecastData(runId))
          : api.fetchForecastData(runId)
        : Promise.resolve({
            dates: [],
            baseline: [],
            scenarios: [],
            confidence: [],
          }),
    enabled: !!runId,
    placeholderData: { dates: [], baseline: [], scenarios: [], confidence: [] },
  });
  const data = query.data ?? { dates: [], baseline: [], scenarios: [], confidence: [] };
  return {
    ...query,
    dates: Array.isArray(data.dates) ? data.dates : [],
    baseline: Array.isArray(data.baseline) ? data.baseline : [],
    scenarios: Array.isArray(data.scenarios) ? data.scenarios : [],
    confidence: Array.isArray(data.confidence) ? data.confidence : [],
  };
}

export function useReportsHistory(period?: string) {
  const p = period ?? getDefaultPeriod();
  const query = useQuery({
    queryKey: QUERY_KEYS.reportsHistory(p),
    queryFn: () =>
      USE_MOCK
        ? Promise.resolve(getMockReportsHistory(p))
        : api.fetchReportsHistory(p),
    placeholderData: [],
  });
  const artifacts = (query.data ?? []) as ReportArtifact[];
  return {
    ...query,
    artifacts: Array.isArray(artifacts) ? artifacts : [],
  };
}

export function useInsights(period?: string) {
  const p = period ?? getDefaultPeriod();
  const query = useQuery({
    queryKey: QUERY_KEYS.insights(p),
    queryFn: () =>
      USE_MOCK ? Promise.resolve(getMockInsights(p)) : api.fetchInsights(p),
    placeholderData: { id: "", period: p, items: [] },
  });
  const items = (query.data?.items ?? []) as InsightItem[];
  return {
    ...query,
    items: Array.isArray(items) ? items : [],
  };
}

export function useExportReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { period: string; format: "pdf" | "csv" }) => {
      if (USE_MOCK) {
        return mockExportReport(payload.period, payload.format);
      }
      return api.exportReport({
        period: payload.period,
        format: payload.format,
        includeAudit: true,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.reportsHistory(variables.period),
      });
      toast.success(`Report exported as ${variables.format.toUpperCase()}`);
    },
    onError: () => toast.error("Export failed"),
  });
}

export function useForecastingState() {
  const [period, setPeriod] = useState(getDefaultPeriod());
  const [runId, setRunId] = useState<string | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenarioIds, setSelectedScenarioIds] = useState<Set<string>>(
    new Set(["baseline"])
  );
  const [showConfidence, setShowConfidence] = useState(true);

  const addScenario = useCallback((name: string, inputs: ScenarioInputs) => {
    const id = `sc-${Date.now()}`;
    setScenarios((prev) => [
      ...prev,
      { id, name, inputs, createdAt: new Date().toISOString() },
    ]);
    setSelectedScenarioIds((prev) => new Set([...prev, id]));
    return id;
  }, []);

  const updateScenario = useCallback(
    (id: string, updates: Partial<{ name: string; inputs: ScenarioInputs }>) => {
      setScenarios((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
      );
    },
    []
  );

  const removeScenario = useCallback((id: string) => {
    setScenarios((prev) => prev.filter((s) => s.id !== id));
    setSelectedScenarioIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const toggleScenario = useCallback((id: string) => {
    setSelectedScenarioIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const duplicateScenario = useCallback((id: string) => {
    setScenarios((prev) => {
      const s = prev.find((x) => x.id === id);
      if (!s) return prev;
      const newId = `sc-${Date.now()}`;
      const newScenario: Scenario = {
        id: newId,
        name: `${s.name} (copy)`,
        inputs: { ...s.inputs },
        createdAt: new Date().toISOString(),
      };
      setSelectedScenarioIds((prevIds) => new Set([...prevIds, newId]));
      return [...prev, newScenario];
    });
  }, []);

  const resetToBaseline = useCallback(() => {
    setScenarios([]);
    setSelectedScenarioIds(new Set(["baseline"]));
  }, []);

  return {
    period,
    setPeriod,
    runId,
    setRunId,
    scenarios,
    selectedScenarioIds,
    setSelectedScenarioIds,
    showConfidence,
    setShowConfidence,
    addScenario,
    updateScenario,
    removeScenario,
    toggleScenario,
    duplicateScenario,
    resetToBaseline,
  };
}
