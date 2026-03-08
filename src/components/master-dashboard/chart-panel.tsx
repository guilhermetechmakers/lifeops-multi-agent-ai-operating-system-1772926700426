/**
 * ChartPanel: Reusable charts for cronjob success rate, run duration, and alert trends.
 * Minimalist axes, muted gridlines, accent colors from design system.
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCronjobMetrics, useAlertTrends } from "@/hooks/use-master-dashboard";

const CHART_COLORS = {
  success: "#00C2A8",
  failed: "#FF3B30",
  teal: "#00C2A8",
  amber: "#FFB020",
  purple: "#8B5CF6",
  info: "#00C2A8",
  warning: "#FFB020",
  critical: "#FF3B30",
  error: "#FF3B30",
};

const GRID_STROKE = "rgba(255,255,255,0.06)";
const AXIS_STROKE = "rgba(157,163,166,0.6)";

export interface ChartCardProps {
  title: string;
  data: Record<string, string | number>[];
  valueKey?: string;
  nameKey: string;
  dataKeys?: string[];
  type: "pie" | "bar";
  height: number;
  isLoading: boolean;
  emptyMessage: string;
}

export function ChartCard({
  title,
  data,
  valueKey = "count",
  nameKey,
  dataKeys = ["count"],
  type,
  height,
  isLoading,
  emptyMessage,
}: ChartCardProps) {
  if (isLoading) {
    return (
      <Card className="border-white/[0.03] bg-card">
        <CardHeader>
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full rounded-md" />
        </CardContent>
      </Card>
    );
  }
  const hasData = Array.isArray(data) && data.length > 0;
  return (
    <Card className="border-white/[0.03] bg-card transition-all duration-200 hover:shadow-card-hover">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="w-full" style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
              {type === "pie" ? (
                <PieChart>
                  <Pie
                    data={data}
                    dataKey={valueKey}
                    nameKey={nameKey}
                    cx="50%"
                    cy="50%"
                    innerRadius={height * 0.25}
                    outerRadius={height * 0.4}
                    paddingAngle={2}
                    label={({ [nameKey]: nameVal, [valueKey]: val }: Record<string, string | number>) =>
                      `${nameVal}: ${val}`
                    }
                  >
                    {data.map((_, i) => {
                      const colors = [
                        CHART_COLORS.info,
                        CHART_COLORS.warning,
                        CHART_COLORS.critical,
                        CHART_COLORS.teal,
                      ];
                      return <Cell key={i} fill={colors[i % colors.length]} />;
                    })}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "rgb(21 23 24)",
                      border: "1px solid rgba(255,255,255,0.03)",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              ) : (
                <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                  <XAxis
                    dataKey={nameKey}
                    tick={{ fill: "rgb(157 163 166)", fontSize: 10 }}
                    stroke={AXIS_STROKE}
                  />
                  <YAxis
                    tick={{ fill: "rgb(157 163 166)", fontSize: 10 }}
                    stroke={AXIS_STROKE}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgb(21 23 24)",
                      border: "1px solid rgba(255,255,255,0.03)",
                      borderRadius: "8px",
                    }}
                  />
                  {dataKeys.map((key, i) => {
                    const colors = [CHART_COLORS.teal, CHART_COLORS.failed, CHART_COLORS.amber];
                    return (
                      <Bar
                        key={key}
                        dataKey={key}
                        fill={colors[i % colors.length]}
                        radius={[2, 2, 0, 0]}
                      />
                    );
                  })}
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground py-8 text-center">{emptyMessage}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function ChartPanel() {
  const metrics = useCronjobMetrics();
  const trends = useAlertTrends();

  const metricsData = metrics.data ?? {
    successRate: 0,
    totalRuns: 0,
    successCount: 0,
    failedCount: 0,
    byDay: [] as Array<{ day: string; success: number; failed: number }>,
    durationDistribution: [] as Array<{ bucket: string; count: number }>,
  };

  const trendsData = trends.data ?? {
    bySeverity: [] as Array<{ severity: string; count: number }>,
    byDay: [] as Array<{ day: string; count: number }>,
  };

  const byDay = Array.isArray(metricsData.byDay) ? metricsData.byDay : [];
  const durationData = Array.isArray(metricsData.durationDistribution)
    ? metricsData.durationDistribution
    : [];
  const severityData = Array.isArray(trendsData.bySeverity) ? trendsData.bySeverity : [];
  const alertByDay = Array.isArray(trendsData.byDay) ? trendsData.byDay : [];

  const isLoading = metrics.isLoading || trends.isLoading;

  if (isLoading) {
    return (
      <Card className="border-white/[0.03] bg-card">
        <CardHeader>
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full rounded-md" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Cronjob success rate */}
      <Card className="border-white/[0.03] bg-card transition-all duration-200 hover:shadow-card-hover">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Cronjob success rate
          </CardTitle>
          <p className="text-2xl font-bold text-foreground">
            {metricsData.successRate}%
          </p>
          <p className="text-xs text-muted-foreground">
            {metricsData.successCount} success · {metricsData.failedCount} failed
          </p>
        </CardHeader>
        <CardContent>
          {byDay.length > 0 ? (
            <div className="h-[160px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={byDay}
                  margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: "rgb(157 163 166)", fontSize: 10 }}
                    stroke={AXIS_STROKE}
                  />
                  <YAxis
                    tick={{ fill: "rgb(157 163 166)", fontSize: 10 }}
                    stroke={AXIS_STROKE}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgb(21 23 24)",
                      border: "1px solid rgba(255,255,255,0.03)",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "rgb(255 255 255)" }}
                  />
                  <Bar dataKey="success" fill={CHART_COLORS.success} radius={[2, 2, 0, 0]} />
                  <Bar dataKey="failed" fill={CHART_COLORS.failed} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-8 text-center">
              No run data yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Run duration distribution */}
      <Card className="border-white/[0.03] bg-card transition-all duration-200 hover:shadow-card-hover">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Run duration
          </CardTitle>
        </CardHeader>
        <CardContent>
          {durationData.length > 0 ? (
            <div className="h-[160px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={durationData}
                  layout="vertical"
                  margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                  <XAxis
                    type="number"
                    tick={{ fill: "rgb(157 163 166)", fontSize: 10 }}
                    stroke={AXIS_STROKE}
                  />
                  <YAxis
                    type="category"
                    dataKey="bucket"
                    width={50}
                    tick={{ fill: "rgb(157 163 166)", fontSize: 10 }}
                    stroke={AXIS_STROKE}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgb(21 23 24)",
                      border: "1px solid rgba(255,255,255,0.03)",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" fill={CHART_COLORS.teal} radius={[0, 2, 2, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-8 text-center">
              No duration data yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Alert trends by severity */}
      <Card className="border-white/[0.03] bg-card transition-all duration-200 hover:shadow-card-hover md:col-span-2 lg:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Alert trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          {severityData.length > 0 ? (
            <div className="h-[160px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    dataKey="count"
                    nameKey="severity"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={2}
                    label={({ severity, count }) => `${severity}: ${count}`}
                  >
                    {severityData.map((entry, i) => {
                      const colors = [
                        CHART_COLORS.info,
                        CHART_COLORS.warning,
                        CHART_COLORS.critical,
                        CHART_COLORS.error,
                      ];
                      return <Cell key={entry.severity} fill={colors[i % colors.length]} />;
                    })}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "rgb(21 23 24)",
                      border: "1px solid rgba(255,255,255,0.03)",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : alertByDay.length > 0 ? (
            <div className="h-[160px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={alertByDay}
                  margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: "rgb(157 163 166)", fontSize: 10 }}
                    stroke={AXIS_STROKE}
                  />
                  <YAxis
                    tick={{ fill: "rgb(157 163 166)", fontSize: 10 }}
                    stroke={AXIS_STROKE}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgb(21 23 24)",
                      border: "1px solid rgba(255,255,255,0.03)",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" fill={CHART_COLORS.amber} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-8 text-center">
              No alert data yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
