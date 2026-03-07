import { Link } from "react-router-dom";
import { Clock, CheckSquare, AlertCircle, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedPage } from "@/components/animated-page";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const runData = [
  { name: "Mon", runs: 12, success: 10 },
  { name: "Tue", runs: 18, success: 17 },
  { name: "Wed", runs: 15, success: 14 },
  { name: "Thu", runs: 22, success: 20 },
  { name: "Fri", runs: 14, success: 13 },
];

export default function DashboardMaster() {
  return (
    <AnimatedPage className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Master Dashboard</h1>
        <Link to="/dashboard/cronjobs/new">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            New cronjob
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/[0.03] bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active cronjobs
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">8</div>
            <p className="text-xs text-muted-foreground">3 running now</p>
          </CardContent>
        </Card>
        <Card className="border-white/[0.03] bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending approvals
            </CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">2</div>
            <Link to="/dashboard/approvals" className="text-xs text-primary hover:underline">
              Review queue
            </Link>
          </CardContent>
        </Card>
        <Card className="border-white/[0.03] bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Agent health
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="success">All healthy</Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/[0.03] bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Runs (7d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">81</div>
            <p className="text-xs text-muted-foreground">94% success rate</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/[0.03] bg-card">
        <CardHeader>
          <CardTitle>Run activity</CardTitle>
          <p className="text-sm text-muted-foreground">Last 5 days</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={runData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-white/5" />
              <XAxis dataKey="name" className="text-xs text-muted-foreground" />
              <YAxis className="text-xs text-muted-foreground" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgb(21 23 24)",
                  border: "1px solid rgba(255,255,255,0.03)",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="runs"
                stroke="rgb(255 59 48)"
                strokeWidth={2}
                name="Runs"
              />
              <Line
                type="monotone"
                dataKey="success"
                stroke="#00C2A8"
                strokeWidth={2}
                name="Success"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-white/[0.03] bg-card">
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Link to="/dashboard/cronjobs/new">
              <Button variant="outline" size="sm">
                Create cronjob
              </Button>
            </Link>
            <Link to="/dashboard/approvals">
              <Button variant="outline" size="sm">
                Approvals queue
              </Button>
            </Link>
            <Link to="/dashboard/cronjobs">
              <Button variant="outline" size="sm">
                View all cronjobs
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="border-white/[0.03] bg-card">
          <CardHeader>
            <CardTitle>Recent runs</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>PR triage — success (2 min ago)</li>
              <li>Daily digest — success (1 hr ago)</li>
              <li>Monthly close — pending approval</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  );
}
