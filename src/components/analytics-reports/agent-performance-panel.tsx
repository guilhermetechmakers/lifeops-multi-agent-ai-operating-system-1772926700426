/**
 * AgentPerformancePanel — Bar/line charts, error type distribution, sortable tables.
 */

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAgentPerformance } from "@/hooks/use-analytics";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

const COLORS = ["#00C2A8", "#FFB020", "#8B5CF6", "#FF3B30"] as const;

const tooltipStyle = {
  backgroundColor: "rgb(21 23 24)",
  border: "1px solid rgba(255,255,255,0.03)",
  borderRadius: "8px",
  padding: "8px 12px",
  color: "rgb(255 255 255)",
};

export interface AgentPerformancePanelProps {
  orgId?: string;
  range?: string;
}

export function AgentPerformancePanel({ orgId, range }: AgentPerformancePanelProps) {
  const { agents = [], isLoading } = useAgentPerformance({ orgId, range });

  const list = Array.isArray(agents) ? agents : [];

  const errorTypeData = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of list) {
      const types = a.errorTypes ?? [];
      if (Array.isArray(types)) {
        for (const t of types) {
          const key = typeof t === "string" ? t : (t as { type?: string; count?: number })?.type ?? "unknown";
          const count = typeof t === "object" && t != null && "count" in t
            ? (t as { count: number }).count
            : 1;
          map.set(key, (map.get(key) ?? 0) + count);
        }
      }
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [list]);

  const tableData = useMemo(() => {
    return list.map((a) => {
      const total = (a.successCount ?? 0) + (a.failureCount ?? 0);
      const successRate = total > 0 ? Math.round(((a.successCount ?? 0) / total) * 100) : 0;
      return {
        name: a.name,
        successRate,
        avgRuntimeMs: a.avgRuntimeMs ?? 0,
        successCount: a.successCount ?? 0,
        failureCount: a.failureCount ?? 0,
      };
    });
  }, [list]);

  if (isLoading) {
    return (
      <Card className="card-health">
        <CardHeader>
          <CardTitle className="text-base">Agent performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 animate-pulse rounded-lg bg-secondary/50" aria-hidden />
        </CardContent>
      </Card>
    );
  }

  if (list.length === 0) {
    return (
      <Card className="card-health">
        <CardHeader>
          <CardTitle className="text-base">Agent performance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No agent data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="card-health">
        <CardHeader>
          <CardTitle className="text-base">Agent performance</CardTitle>
          <p className="text-sm text-muted-foreground">
            Success rate, avg runtime, error type breakdown
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Agent performance table">
              <thead>
                <tr className="border-b border-white/[0.03]">
                  <th className="pb-4 text-left font-medium">Agent</th>
                  <th className="pb-4 text-right font-medium">Success rate</th>
                  <th className="pb-4 text-right font-medium">Avg runtime</th>
                  <th className="pb-4 text-right font-medium">Success</th>
                  <th className="pb-4 text-right font-medium">Failure</th>
                </tr>
              </thead>
              <tbody>
                {(tableData ?? []).map((row, i) => (
                  <tr
                    key={row.name ?? i}
                    className="border-b border-white/[0.03] transition-colors hover:bg-secondary/30"
                  >
                    <td className="py-3">{row.name}</td>
                    <td className="py-3 text-right">
                      <span
                        className={cn(
                          row.successRate >= 95 && "text-teal",
                          row.successRate < 95 && row.successRate >= 80 && "text-amber",
                          row.successRate < 80 && "text-destructive"
                        )}
                      >
                        {row.successRate}%
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {(row.avgRuntimeMs / 1000).toFixed(2)}s
                    </td>
                    <td className="py-3 text-right">{row.successCount}</td>
                    <td className="py-3 text-right">{row.failureCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {errorTypeData.length > 0 && (
        <Card className="card-health">
          <CardHeader>
            <CardTitle className="text-base">Error type distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48" role="img" aria-label="Error type distribution chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={errorTypeData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {errorTypeData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={COLORS[i % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
