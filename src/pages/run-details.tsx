/**
 * Run Details page — inspect a single run with artifacts, trace, logs.
 * LifeOps design system; artifacts section for run outputs.
 */

import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedPage } from "@/components/animated-page";
import { ArtifactManagerPanel } from "@/components/artifacts";
import { ArrowLeft, FileText, Activity } from "lucide-react";

export default function RunDetailsPage() {
  const { runId } = useParams<{ runId: string }>();

  return (
    <AnimatedPage className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/cronjobs">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-foreground">Run details</h1>
          <p className="text-sm text-muted-foreground">Run ID: {runId}</p>
        </div>
        <Badge variant="success">Success</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-white/[0.03] bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" />
              Message trace
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Trace viewer placeholder — agent-to-agent messages
            </p>
          </CardContent>
        </Card>
        <Card className="border-white/[0.03] bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Logs & events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Logs placeholder — run events and timestamps
            </p>
          </CardContent>
        </Card>
      </div>

      <ArtifactManagerPanel compact />
    </AnimatedPage>
  );
}
