/**
 * DataVizTinyCharts — lightweight sparkline views for project metrics.
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
import { useProjectTickets, useProjectCI } from "@/hooks/use-projects";
import { cn } from "@/lib/utils";

export interface DataVizTinyChartsProps {
  projectId: string;
  className?: string;
}

export function DataVizTinyCharts({ projectId, className }: DataVizTinyChartsProps) {
  const { items: tickets } = useProjectTickets(projectId);
  const { items: ciJobs } = useProjectCI(projectId);

  const ticketList = tickets ?? [];
  const ciList = ciJobs ?? [];

  const ticketByStatus = [
    { name: "Backlog", count: ticketList.filter((t) => t.status === "backlog").length },
    { name: "In Progress", count: ticketList.filter((t) => t.status === "in_progress").length },
    { name: "In Review", count: ticketList.filter((t) => t.status === "in_review").length },
    { name: "Done", count: ticketList.filter((t) => t.status === "done").length },
  ];

  const ciByStatus = [
    { name: "Success", count: ciList.filter((c) => c.status === "success").length },
    { name: "Failure", count: ciList.filter((c) => c.status === "failure").length },
    { name: "Running", count: ciList.filter((c) => c.status === "running").length },
    { name: "Pending", count: ciList.filter((c) => c.status === "pending").length },
  ];

  return (
    <Card className={cn("card-project-detail", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Tickets by status</p>
            <div className="h-[80px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ticketByStatus}>
                  <defs>
                    <linearGradient id="ticketGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgb(0 194 168)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="rgb(0 194 168)" stopOpacity={0} />
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
                    dataKey="count"
                    stroke="#00C2A8"
                    fill="url(#ticketGrad)"
                    strokeWidth={1.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">CI status</p>
            <div className="h-[80px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ciByStatus}>
                  <defs>
                    <linearGradient id="ciGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgb(139 92 246)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="rgb(139 92 246)" stopOpacity={0} />
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
                    dataKey="count"
                    stroke="#8B5CF6"
                    fill="url(#ciGrad)"
                    strokeWidth={1.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
