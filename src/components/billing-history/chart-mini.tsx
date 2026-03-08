/**
 * ChartMini — minimal line/bar chart using Recharts with teal/amber/purple accents.
 */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { cn } from "@/lib/utils";

const COLORS = {
  teal: "#00C2A8",
  amber: "#FFB020",
  purple: "#8B5CF6",
};

export interface ChartMiniProps {
  data: Array<Record<string, string | number>>;
  dataKey: string;
  xAxisKey: string;
  color?: keyof typeof COLORS;
  className?: string;
  height?: number;
}

export function ChartMini({
  data,
  dataKey,
  xAxisKey,
  color = "teal",
  className,
  height = 120,
}: ChartMiniProps) {
  const safeData = Array.isArray(data) ? data : [];
  const fillColor = COLORS[color] ?? COLORS.teal;

  return (
    <div className={cn("w-full", className)} style={{ height }} role="img" aria-label="Mini chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={safeData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`chartMini-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={fillColor} stopOpacity={0.3} />
              <stop offset="100%" stopColor={fillColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey={xAxisKey}
            tick={{ fontSize: 10, fill: "rgb(157, 163, 166)" }}
            axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "rgb(157, 163, 166)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => (typeof v === "number" ? String(v) : v)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgb(21, 23, 24)",
              border: "1px solid rgba(255,255,255,0.03)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            labelStyle={{ color: "rgb(255,255,255)" }}
            formatter={(value: number) => [value, ""]}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={fillColor}
            fill={`url(#chartMini-${color})`}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
