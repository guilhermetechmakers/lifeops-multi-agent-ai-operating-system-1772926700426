/**
 * TimeSeriesChart — Reusable line/bar chart with teal/amber/purple accents.
 * Tooltips, legends, responsive; dark theme.
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
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const COLORS = ["#00C2A8", "#FFB020", "#8B5CF6"] as const;

const tooltipStyle = {
  backgroundColor: "rgb(21 23 24)",
  border: "1px solid rgba(255,255,255,0.03)",
  borderRadius: "8px",
  padding: "8px 12px",
  color: "rgb(255 255 255)",
};

export interface TimeSeriesSeries {
  dataKey: string;
  name: string;
  colorIndex?: number;
}

export interface TimeSeriesChartProps {
  title?: string;
  type?: "line" | "bar";
  data: Array<Record<string, string | number>>;
  series: TimeSeriesSeries[];
  categories?: string[];
  xKey?: string;
  height?: number;
  className?: string;
}

export function TimeSeriesChart({
  title,
  type = "line",
  data,
  series,
  categories,
  xKey,
  height = 240,
  className,
}: TimeSeriesChartProps) {
  const chartData = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const seriesList = useMemo(() => (Array.isArray(series) ? series : []), [series]);
  const xAxisKey = xKey ?? categories?.[0] ?? "date";

  if (chartData.length === 0) {
    return (
      <Card className={cn("card-health", className)}>
        {title && (
          <CardHeader>
            <CardTitle className="text-base">{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div
            className="flex items-center justify-center rounded-lg bg-secondary/30 text-muted-foreground text-sm"
            style={{ height }}
            aria-label="Chart empty"
          >
            No data
          </div>
        </CardContent>
      </Card>
    );
  }

  const chart = (
    <ResponsiveContainer width="100%" height={height}>
      {type === "line" ? (
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-white/5" />
          <XAxis
            dataKey={xAxisKey}
            tick={{ fill: "rgb(157 163 166)", fontSize: 12 }}
          />
          <YAxis tick={{ fill: "rgb(157 163 166)", fontSize: 12 }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend />
          {seriesList.map((s, idx) => (
            <Line
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              name={s.name}
              stroke={COLORS[s.colorIndex ?? idx % COLORS.length]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      ) : (
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-white/5" />
          <XAxis
            dataKey={xAxisKey}
            tick={{ fill: "rgb(157 163 166)", fontSize: 12 }}
          />
          <YAxis tick={{ fill: "rgb(157 163 166)", fontSize: 12 }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend />
          {seriesList.map((s, idx) => (
            <Bar
              key={s.dataKey}
              dataKey={s.dataKey}
              name={s.name}
              fill={COLORS[s.colorIndex ?? idx % COLORS.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      )}
    </ResponsiveContainer>
  );

  return (
    <Card className={cn("card-health", className)}>
      {title && (
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div role="img" aria-label={title ? `${title} chart` : "Time series chart"}>
          {chart}
        </div>
      </CardContent>
    </Card>
  );
}
