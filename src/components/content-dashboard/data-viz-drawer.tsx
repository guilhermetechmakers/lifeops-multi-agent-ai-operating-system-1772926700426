/**
 * DataVizDrawer — lightweight sparkline and KPI visualizations.
 */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BarChart3 } from "lucide-react";
import { useContentItems } from "@/hooks/use-content-dashboard";

const MOCK_SPARKLINE = [
  { name: "Mon", views: 1200 },
  { name: "Tue", views: 1800 },
  { name: "Wed", views: 1500 },
  { name: "Thu", views: 2200 },
  { name: "Fri", views: 1900 },
  { name: "Sat", views: 1400 },
  { name: "Sun", views: 1100 },
];

export interface DataVizDrawerProps {
  className?: string;
}

export function DataVizDrawer({ className }: DataVizDrawerProps) {
  const { data } = useContentItems({ limit: 100 });
  const items = data?.items ?? [];
  const published = items.filter((i) => i.status === "published");
  const draftCount = items.filter(
    (i) =>
      ["idea", "research", "draft", "edit", "ready-to-publish"].includes(
        i.status
      )
  ).length;

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple" aria-hidden />
          Content Metrics
        </CardTitle>
        <p className="text-xs text-muted-foreground" id="content-metrics-desc">
          Views trend, draft count. KPI summary for content pipeline health.
        </p>
      </CardHeader>
      <CardContent aria-describedby="content-metrics-desc">
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Drafts</span>
            <span className="text-lg font-semibold text-foreground" aria-label={`${draftCount} drafts in progress`}>
              {draftCount}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Published (30d)</span>
            <span className="text-lg font-semibold text-foreground" aria-label={`${published.length} published items`}>
              {published.length}
            </span>
          </div>
          <div className="h-[80px]" role="img" aria-label="Views trend sparkline for the last 7 days">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_SPARKLINE} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="contentVizGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: "rgb(21 23 24)",
                    border: "1px solid rgba(255,255,255,0.03)",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#8B5CF6"
                  fill="url(#contentVizGrad)"
                  strokeWidth={1.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
