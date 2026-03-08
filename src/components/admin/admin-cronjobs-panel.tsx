/**
 * AdminCronjobsPanel — Cronjobs list with trigger, run details link.
 */

import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Play } from "lucide-react";
import { useAdminCronjobs, useTriggerAdminCronjob } from "@/hooks/use-admin";
import { AnimatedPage } from "@/components/animated-page";

export function AdminCronjobsPanel() {
  const { cronjobs, isLoading } = useAdminCronjobs();
  const triggerCronjob = useTriggerAdminCronjob();

  return (
    <AnimatedPage className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Cronjobs & approvals</h2>
        <Link to="/dashboard/cronjobs">
          <Button variant="outline" className="gap-2">
            <Clock className="h-4 w-4" />
            Manage cronjobs
          </Button>
        </Link>
      </div>

      <Card className="border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B]">
        <CardHeader>
          <CardTitle>Cronjob schedule</CardTitle>
          <p className="text-sm text-muted-foreground">
            Next run, last run outcome, quick actions
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              Loading...
            </div>
          ) : (cronjobs ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-white/[0.03] bg-secondary/30 px-6 py-12 text-center">
              <Clock className="h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No cronjobs.</p>
              <Link to="/dashboard/cronjobs/new">
                <Button className="mt-4">Create cronjob</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {(cronjobs ?? []).map((c) => (
                <div
                  key={c?.id ?? ""}
                  className="flex items-center justify-between rounded-lg border border-white/[0.03] px-4 py-3 transition-colors hover:bg-secondary/30"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{c?.name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {c?.schedule ?? "—"} · {c?.timezone ?? "UTC"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={c?.enabled ? "default" : "secondary"}>
                      {c?.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                    <Link to={`/dashboard/cronjobs/${c?.id ?? ""}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => triggerCronjob.mutate(c?.id ?? "")}
                      disabled={triggerCronjob.isPending}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AnimatedPage>
  );
}
