/**
 * DataVizChart — Reusable chart for lines/bars with minimal, high-contrast styling.
 * Uses teal/amber/purple accents; gridlines subtle; tooltips enabled.
 */

import { useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

const COLORS = {
  teal: "#00C2A8",
  amber: "#FFB020",
  purple: "#8B5CF6",
};

export interface DataVizSeries {
  dataKey: string;
  name: string;
  color?: keyof typeof COLORS;
}

export interface DataVizChartProps {
  type: "line" | "bar";
  data: Array<Record<string, string | number>>;
  categories: string[];
  series: DataVizSeries[];
  width?: number | string;
  height?: number;
  className?: string;
}

const tooltipStyle = {
  backgroundColor: "rgb(21 23 24)",
  border: "1px solid rgba(255,255,255,0.03)",
  borderRadius: "8px",
  padding: "8px 12px",
};

export function DataVizChart({
  type,
  data,
  categories,
  series,
  height = 200,
  className,
}: DataVizChartProps) {
  const chartData = useMemo(() => {
    const d = data ?? [];
    return Array.isArray(d) ? d : [];
  }, [data]);

  const seriesList = useMemo(() => {
    const s = series ?? [];
    return Array.isArray(s) ? s : [];
  }, [series]);

  if (chartData.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-lg bg-secondary/30 text-muted-foreground text-sm",
          className
        )}
        style={{ height }}
        aria-label="Chart empty"
      >
        No data
      </div>
    );
  }

  const content = (
    <ResponsiveContainer width="100%" height={height}>
      {type === "line" ? (
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-white/5" />
          <XAxis
            dataKey={categories[0] ?? "name"}
            className="text-xs text-muted-foreground"
            tick={{ fill: "rgb(157 163 166)" }}
          />
          <YAxis
            className="text-xs text-muted-foreground"
            tick={{ fill: "rgb(157 163 166)" }}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={{ color: "rgb(255 255 255)" }}
          />
          {seriesList.map((s, idx) => (
            <Line
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              name={s.name}
              stroke={s.color ? COLORS[s.color] : [COLORS.teal, COLORS.amber, COLORS.purple][idx % 3]}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          ))}
        </LineChart>
      ) : (
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-white/5" />
          <XAxis
            dataKey={categories[0] ?? "name"}
            className="text-xs text-muted-foreground"
            tick={{ fill: "rgb(157 163 166)" }}
          />
          <YAxis
            className="text-xs text-muted-foreground"
            tick={{ fill: "rgb(157 163 166)" }}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={{ color: "rgb(255 255 255)" }}
          />
          {seriesList.map((s, idx) => (
            <Bar
              key={s.dataKey}
              dataKey={s.dataKey}
              name={s.name}
              fill={s.color ? COLORS[s.color] : [COLORS.teal, COLORS.amber, COLORS.purple][idx % 3]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      )}
    </ResponsiveContainer>
  );

  return (
    <div
      className={cn("w-full", className)}
      role="img"
      aria-label={`${type} chart`}
    >
      {content}
    </div>
  );
}
