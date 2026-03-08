/**
 * ForecastGraph — Rolling forecast with scenario overlays, confidence bands, tooltips.
 */

import { useMemo } from "react";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

const COLORS = {
  baseline: "#00C2A8",
  scenarioA: "#8B5CF6",
  scenarioB: "#FFB020",
  scenarioC: "#FF3B30",
  confidence: "rgba(0, 194, 168, 0.15)",
};

interface ForecastGraphProps {
  dates: string[];
  baseline: number[];
  scenarios: Array<{ id: string; name: string; values: number[] }>;
  confidence: number[];
  selectedScenarioIds: Set<string>;
  showConfidence?: boolean;
  isLoading?: boolean;
  className?: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function ForecastGraph({
  dates,
  baseline,
  scenarios,
  confidence,
  selectedScenarioIds,
  showConfidence = true,
  isLoading,
  className,
}: ForecastGraphProps) {
  const chartData = useMemo(() => {
    const d = dates ?? [];
    const b = baseline ?? [];
    const maxLen = Math.max(d.length, b.length, ...(scenarios ?? []).map((s) => (s.values ?? []).length));
    return Array.from({ length: maxLen }, (_, i) => {
      const point: Record<string, string | number> = {
        date: d[i] ?? `M${i + 1}`,
        baseline: b[i] ?? 0,
      };
      (scenarios ?? []).forEach((s) => {
        if (selectedScenarioIds.has(s.id)) {
          const vals = s.values ?? [];
          point[`scenario_${s.id}`] = vals[i] ?? 0;
        }
      });
      if (showConfidence && Array.isArray(confidence)) {
        const c = confidence[i] ?? 0.9;
        const v = b[i] ?? 0;
        const band = Math.abs(v) * (1 - c) * 0.15;
        point.confidenceLow = Math.round(v - band);
        point.confidenceHigh = Math.round(v + band);
      }
      return point;
    });
  }, [dates, baseline, scenarios, confidence, selectedScenarioIds, showConfidence]);

  const scenarioColors = ["#8B5CF6", "#FFB020", "#FF3B30"];

  if (isLoading) {
    return (
      <div
        className={cn(
          "h-[320px] animate-pulse rounded-lg bg-secondary/50",
          className
        )}
        aria-busy="true"
      />
    );
  }

  return (
    <div
      className={cn("h-[320px] w-full", className)}
      role="img"
      aria-label="Forecast chart with baseline and scenario overlays"
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-white/5" />
          <XAxis
            dataKey="date"
            className="text-xs text-muted-foreground"
            tick={{ fill: "rgb(157 163 166)" }}
          />
          <YAxis
            className="text-xs text-muted-foreground"
            tick={{ fill: "rgb(157 163 166)" }}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgb(21 23 24)",
              border: "1px solid rgba(255,255,255,0.03)",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "rgb(255 255 255)" }}
            formatter={(value: number) => [formatCurrency(value), ""]}
            labelFormatter={(label) => `Period: ${label}`}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px" }}
            formatter={(value) => <span className="text-muted-foreground">{value}</span>}
          />
          {showConfidence && selectedScenarioIds.has("baseline") && (
            <Area
              type="monotone"
              dataKey="baseline"
              stroke="none"
              fill={COLORS.confidence}
              fillOpacity={0.4}
              name="Confidence band"
              connectNulls
            />
          )}
          {selectedScenarioIds.has("baseline") && (
            <Line
              type="monotone"
              dataKey="baseline"
              stroke={COLORS.baseline}
              strokeWidth={2}
              dot={false}
              name="Baseline"
              connectNulls
            />
          )}
          {(scenarios ?? []).map((s, idx) =>
            selectedScenarioIds.has(s.id) ? (
              <Line
                key={s.id}
                type="monotone"
                dataKey={`scenario_${s.id}`}
                stroke={scenarioColors[idx % scenarioColors.length]}
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
                name={s.name}
                connectNulls
              />
            ) : null
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
