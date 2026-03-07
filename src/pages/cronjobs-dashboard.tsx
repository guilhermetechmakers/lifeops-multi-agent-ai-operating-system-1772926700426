import { Link } from "react-router-dom";
import { Plus, Clock, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedPage } from "@/components/animated-page";

const cronjobs = [
  { id: "1", name: "PR triage", schedule: "0 9 * * 1-5", enabled: true, lastRun: "2 min ago" },
  { id: "2", name: "Daily digest", schedule: "0 8 * * *", enabled: true, lastRun: "1 hr ago" },
  { id: "3", name: "Monthly close", schedule: "0 0 L * *", enabled: true, lastRun: "Pending" },
  { id: "4", name: "Content publish", schedule: "0 10 * * 2,4", enabled: false, lastRun: "—" },
];

export default function CronjobsDashboard() {
  return (
    <AnimatedPage className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Cronjobs</h1>
          <p className="text-sm text-muted-foreground">
            Manage scheduled and event-triggered automations
          </p>
        </div>
        <Link to="/dashboard/cronjobs/new">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Create cronjob
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-white/[0.03] bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">4</div>
          </CardContent>
        </Card>
        <Card className="border-white/[0.03] bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Enabled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">3</div>
          </CardContent>
        </Card>
        <Card className="border-white/[0.03] bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Next run
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">~15 min</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/[0.03] bg-card">
        <CardHeader>
          <CardTitle>Cronjob list</CardTitle>
          <p className="text-sm text-muted-foreground">Click to edit or view runs</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {cronjobs.map((cj) => (
              <Link
                key={cj.id}
                to={`/dashboard/cronjobs/${cj.id}`}
                className="flex items-center justify-between rounded-lg border border-white/[0.03] bg-secondary/50 p-4 transition-colors hover:bg-secondary"
              >
                <div className="flex items-center gap-4">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">{cj.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {cj.schedule} · Last: {cj.lastRun}
                    </p>
                  </div>
                  <Badge variant={cj.enabled ? "success" : "secondary"}>
                    {cj.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </AnimatedPage>
  );
}
