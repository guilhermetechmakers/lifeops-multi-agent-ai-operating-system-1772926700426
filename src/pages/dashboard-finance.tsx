import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedPage } from "@/components/animated-page";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", balance: 4200 },
  { month: "Feb", balance: 4800 },
  { month: "Mar", balance: 5100 },
  { month: "Apr", balance: 4900 },
  { month: "May", balance: 5500 },
];

export default function DashboardFinance() {
  return (
    <AnimatedPage className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Finance</h1>
        <p className="text-sm text-muted-foreground">
          Snapshot, transactions, subscriptions, anomaly alerts
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/[0.03] bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">$5,500</div>
          </CardContent>
        </Card>
        <Card className="border-white/[0.03] bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Income (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal">+$2,100</div>
          </CardContent>
        </Card>
        <Card className="border-white/[0.03] bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">8</div>
          </CardContent>
        </Card>
        <Card className="border-white/[0.03] bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">No anomalies</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/[0.03] bg-card">
        <CardHeader>
          <CardTitle>Cash flow</CardTitle>
          <p className="text-sm text-muted-foreground">Last 5 months</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-white/5" />
              <XAxis dataKey="month" className="text-xs text-muted-foreground" />
              <YAxis className="text-xs text-muted-foreground" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgb(21 23 24)",
                  border: "1px solid rgba(255,255,255,0.03)",
                  borderRadius: "8px",
                }}
              />
              <Area type="monotone" dataKey="balance" stroke="#00C2A8" fill="#00C2A8/20" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </AnimatedPage>
  );
}
