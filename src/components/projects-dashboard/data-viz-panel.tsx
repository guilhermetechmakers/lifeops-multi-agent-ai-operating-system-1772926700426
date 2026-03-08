/**
 * DataVizPanel — sparklines and lightweight charts for CI trends, velocity.
 */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectCI } from "@/hooks/use-projects";
import { cn } from "@/lib/utils";

export interface DataVizPanelProps {
  projectId: string;
  className?: string;
}

const MOCK_DATA = [
  { name: "Mon", success: 4, total: 5 },
  { name: "Tue", success: 3, total: 4 },
  { name: "Wed", success: 5, total: 5 },
  { name: "Thu", success: 2, total: 4 },
  { name: "Fri", success: 4, total: 5 },
  { name: "Sat", success: 1, total: 2 },
  { name: "Sun", success: 3, total: 3 },
];

export function DataVizPanel({ projectId, className }: DataVizPanelProps) {
  const { isLoading } = useProjectCI(projectId);

  if (isLoading) {
    return (
      <Card className={cn("border-white/[0.03] bg-card", className)}>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-white/[0.03] bg-card transition-all hover:shadow-card-hover", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          CI Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00C2A8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00C2A8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#56595B" />
              <YAxis hide domain={[0, "auto"]} />
              <Tooltip
                contentStyle={{
                  background: "#151718",
                  border: "1px solid rgba(255,255,255,0.03)",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#9DA3A6" }}
              />
              <Area
                type="monotone"
                dataKey="success"
                stroke="#00C2A8"
                fillOpacity={1}
                fill="url(#colorSuccess)"
                strokeWidth={1.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
