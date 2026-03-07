import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedPage } from "@/components/animated-page";
import { ArrowLeft, Play } from "lucide-react";

export default function CronjobDetail() {
  const { id } = useParams<{ id: string }>();
  const name = "PR triage";
  const schedule = "0 9 * * 1-5";
  const enabled = true;

  return (
    <AnimatedPage className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/cronjobs">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-foreground">{name}</h1>
          <p className="text-sm text-muted-foreground">ID: {id}</p>
        </div>
        <Badge variant={enabled ? "success" : "secondary"}>
          {enabled ? "Enabled" : "Disabled"}
        </Badge>
        <Link to={`/dashboard/cronjobs/${id}/edit`}>
          <Button variant="outline">Edit</Button>
        </Link>
        <Button className="bg-primary hover:bg-primary/90">
          <Play className="mr-2 h-4 w-4" />
          Run now
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-white/[0.03] bg-card">
          <CardHeader>
            <CardTitle className="text-base">Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-sm text-foreground">{schedule}</p>
            <p className="text-xs text-muted-foreground mt-1">Mon–Fri 09:00 (UTC)</p>
          </CardContent>
        </Card>
        <Card className="border-white/[0.03] bg-card">
          <CardHeader>
            <CardTitle className="text-base">Automation level</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">Approval required</Badge>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/[0.03] bg-card">
        <CardHeader>
          <CardTitle>Recent runs</CardTitle>
          <p className="text-sm text-muted-foreground">Last 10 runs</p>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Run 1 — success (2 min ago)</li>
            <li>Run 2 — success (1 day ago)</li>
          </ul>
        </CardContent>
      </Card>
    </AnimatedPage>
  );
}
