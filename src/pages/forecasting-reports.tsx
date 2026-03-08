/**
 * Forecasting & Reports — Cash flow forecasts, scenario planning, report exports.
 */

import { useCallback, useMemo, useState } from "react";
import { AnimatedPage } from "@/components/animated-page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ForecastGraph } from "@/components/forecasting/forecast-graph";
import { ScenarioBuilder } from "@/components/forecasting/scenario-builder";
import { ReportsExportPanel } from "@/components/forecasting/reports-export-panel";
import { AgentInsightsPanel } from "@/components/forecasting/agent-insights-panel";
import {
  useForecastingBaseline,
  useForecastingState,
  useReportsHistory,
  useInsights,
  useExportReport,
} from "@/hooks/use-forecasting";
import { applyScenarioInputs } from "@/api/forecasting-mock";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function getDefaultPeriod(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getPeriodOptions(): Array<{ value: string; label: string }> {
  const opts: Array<{ value: string; label: string }> = [];
  const d = new Date();
  for (let i = 0; i < 18; i++) {
    const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
    const value = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}`;
    opts.push({
      value,
      label: m.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    });
  }
  return opts;
}

export default function ForecastingReportsPage() {
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);

  const state = useForecastingState();
  const {
    period,
    setPeriod,
    scenarios,
    selectedScenarioIds,
    showConfidence,
    setShowConfidence,
    addScenario,
    updateScenario,
    removeScenario,
    toggleScenario,
    duplicateScenario,
    resetToBaseline,
  } = state;

  const effectivePeriod = period ?? getDefaultPeriod();

  const { baseline, dates, isLoading: baselineLoading } =
    useForecastingBaseline(effectivePeriod);

  const { artifacts, isLoading: reportsLoading } =
    useReportsHistory(effectivePeriod);

  const { items: insights, isLoading: insightsLoading } =
    useInsights(effectivePeriod);

  const exportMutation = useExportReport();

  const chartScenarios = useMemo(() => {
    const base = baseline ?? [];
    const sc = scenarios ?? [];
    return sc.map((s) => ({
      id: s.id,
      name: s.name,
      values: applyScenarioInputs(base, s.inputs),
    }));
  }, [baseline, scenarios]);

  const kpis = useMemo(() => {
    const b = baseline ?? [];
    const last = b[b.length - 1] ?? 0;
    const first = b[0] ?? 0;
    const inflow = 4200 * (b.length || 1);
    const outflow = 1850 * (b.length || 1);
    const net = last - first;
    const runwayMonths = outflow > 0 ? Math.floor(last / (outflow / (b.length || 1))) : 0;
    return {
      endingCash: last,
      netCash: net,
      totalInflow: inflow,
      totalOutflow: outflow,
      runwayMonths,
    };
  }, [baseline]);

  const periodOptions = useMemo(() => getPeriodOptions(), []);
  const activeScenario = activeScenarioId
    ? (scenarios ?? []).find((s) => s.id === activeScenarioId)
    : null;

  const handleApplyInsight = useCallback(
    (id: string) => {
      const item = (insights ?? []).find((i) => i.id === id);
      if (!item?.suggestedAction) return;
      if (!activeScenarioId || !activeScenario) {
        toast.info("Select a scenario in Scenario Builder to apply this recommendation.");
        return;
      }
      const current = activeScenario.inputs ?? {};
      if (id === "ins-1") {
        updateScenario(activeScenarioId, {
          inputs: {
            ...current,
            revenueGrowth: Math.max(-0.2, (current.revenueGrowth ?? 0) - 0.02),
          },
        });
        toast.success("Revenue growth reduced in scenario.");
      } else if (id === "ins-2") {
        updateScenario(activeScenarioId, {
          inputs: {
            ...current,
            subscriptionDelta: (current.subscriptionDelta ?? 0) + 500,
          },
        });
        toast.success("Subscription delta applied to scenario.");
      }
    },
    [insights, activeScenarioId, activeScenario, updateScenario]
  );

  return (
    <AnimatedPage className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">
              Forecasting & Reports
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Cash flow forecasts, scenario planning, and month-end report exports
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="forecast-period" className="text-xs text-muted-foreground whitespace-nowrap">
              Forecast period
            </label>
            <Select
              value={effectivePeriod}
              onValueChange={(v) => setPeriod(v)}
            >
              <SelectTrigger id="forecast-period" className="w-[140px] h-9">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* KPI banner */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-white/[0.03] bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Wallet className="h-4 w-4" />
              <span className="text-xs">Ending cash</span>
            </div>
            <p className="mt-1 text-lg font-semibold text-foreground">
              ${((kpis.endingCash ?? 0) / 1000).toFixed(1)}k
            </p>
          </CardContent>
        </Card>
        <Card className="border-white/[0.03] bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Total inflow</span>
            </div>
            <p className="mt-1 text-lg font-semibold text-teal">
              ${((kpis.totalInflow ?? 0) / 1000).toFixed(1)}k
            </p>
          </CardContent>
        </Card>
        <Card className="border-white/[0.03] bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingDown className="h-4 w-4" />
              <span className="text-xs">Total outflow</span>
            </div>
            <p className="mt-1 text-lg font-semibold text-amber">
              ${((kpis.totalOutflow ?? 0) / 1000).toFixed(1)}k
            </p>
          </CardContent>
        </Card>
        <Card className="border-white/[0.03] bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Net cash</span>
            </div>
            <p className="mt-1 text-lg font-semibold text-foreground">
              ${((kpis.netCash ?? 0) / 1000).toFixed(1)}k
            </p>
          </CardContent>
        </Card>
        <Card className="border-white/[0.03] bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-xs">Runway</span>
            </div>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {kpis.runwayMonths} mo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart + scenario toggles */}
      <Card className="border-white/[0.03] bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold">
            Rolling Forecast
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => toggleScenario("baseline")}
              className={cn(
                "rounded px-2 py-1 text-xs font-medium transition-colors",
                selectedScenarioIds.has("baseline")
                  ? "bg-teal/20 text-teal"
                  : "text-muted-foreground hover:bg-secondary"
              )}
              aria-pressed={selectedScenarioIds.has("baseline")}
              aria-label="Toggle baseline series"
            >
              Baseline
            </button>
            <button
              type="button"
              onClick={() => setShowConfidence(!showConfidence)}
              className={cn(
                "rounded px-2 py-1 text-xs font-medium transition-colors",
                showConfidence
                  ? "bg-teal/20 text-teal"
                  : "text-muted-foreground hover:bg-secondary"
              )}
              aria-pressed={showConfidence}
              aria-label="Toggle confidence band"
            >
              Confidence
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <ForecastGraph
            dates={dates}
            baseline={baseline}
            scenarios={chartScenarios}
            confidence={(baseline ?? []).map(() => 0.88)}
            selectedScenarioIds={selectedScenarioIds}
            showConfidence={showConfidence}
            isLoading={baselineLoading}
          />
        </CardContent>
      </Card>

      {/* Two-column: ScenarioBuilder + Reports + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ScenarioBuilder
            scenarios={scenarios}
            selectedScenarioIds={selectedScenarioIds}
            onAddScenario={addScenario}
            onUpdateScenario={updateScenario}
            onRemoveScenario={removeScenario}
            onToggleScenario={toggleScenario}
            onDuplicateScenario={duplicateScenario}
            onResetToBaseline={resetToBaseline}
            activeScenarioId={activeScenarioId}
            onSetActiveScenario={setActiveScenarioId}
          />
          <AgentInsightsPanel
            items={insights}
            isLoading={insightsLoading}
            onApply={handleApplyInsight}
          />
        </div>
        <div>
          <ReportsExportPanel
            period={effectivePeriod}
            onPeriodChange={setPeriod}
            artifacts={artifacts}
            isLoading={reportsLoading}
            onExport={(p) => exportMutation.mutate(p)}
            isExporting={exportMutation.isPending}
          />
        </div>
      </div>
    </AnimatedPage>
  );
}
