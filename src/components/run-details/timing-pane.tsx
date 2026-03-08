/**
 * TimingPane — per-step timing, latency, backoffs, retries; sparkline-style display with tooltips.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import type { TimingSection } from "@/types/run-details";

const COLORS = ["rgb(0, 194, 168)", "rgb(255, 176, 32)", "rgb(139, 92, 246)"];

export interface TimingPaneProps {
  timing: TimingSection[];
  durationMs?: number;
  className?: string;
}

export function TimingPane({ timing, durationMs, className }: TimingPaneProps) {
  const list = Array.isArray(timing) ? timing : [];
  const total = durationMs ?? list.reduce((acc, t) => acc + (t.durationMs ?? 0), 0);
  const chartData = list.map((t, i) => ({
    name: t.name,
    durationMs: t.durationMs ?? 0,
    fill: COLORS[i % COLORS.length],
  }));

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="p-4 md:p-5">
        <CardTitle className="text-base">Timing & Performance</CardTitle>
        <p className="text-sm text-muted-foreground">
          Per-step breakdown: agent processing, messaging latency, I/O, retries.
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        {list.length === 0 ? (
          <p className="rounded-md border border-white/[0.06] bg-secondary/20 p-4 text-sm text-muted-foreground">
            No timing data. Step durations and latency will appear here.
          </p>
        ) : (
          <div className="space-y-4">
            {total > 0 && (
              <p className="text-sm text-muted-foreground">
                Total duration: <span className="font-medium text-foreground">{total}ms</span>
              </p>
            )}
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "rgb(157, 163, 166)" }}
                    stroke="rgba(255,255,255,0.03)"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "rgb(157, 163, 166)" }}
                    stroke="rgba(255,255,255,0.03)"
                    tickFormatter={(v) => `${v}ms`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgb(21, 23, 24)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "rgb(255,255,255)" }}
                    formatter={(value: number) => [`${value}ms`, "Duration"]}
                  />
                  <Bar dataKey="durationMs" radius={[4, 4, 0, 0]}>
                    {(chartData ?? []).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-2">
              {list.map((t, i) => (
                <li
                  key={t.name + String(i)}
                  className="flex items-center justify-between rounded-md border border-white/[0.06] bg-secondary/20 px-3 py-2 text-sm"
                >
                  <span className="text-foreground">{t.name}</span>
                  <span className="font-mono text-muted-foreground">
                    {t.durationMs}ms
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
