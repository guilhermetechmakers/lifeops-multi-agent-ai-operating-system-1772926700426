/**
 * Cronjobs Management & Approvals — List (next run, last outcome), trigger, approvals queue.
 * Guards: (cronjobs ?? []), (approvals ?? [])
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminCronjobs, useTriggerAdminCronjob, useApprovals } from "@/hooks/use-admin";
import { Play } from "lucide-react";
import { Link } from "react-router-dom";

const EMPTY_CRON: { id: string; name: string; enabled: boolean; schedule: string; timezone: string }[] = [];
const EMPTY_APPROVALS: { id: string; type: string; description: string; status: string }[] = [];

export function CronjobsApprovalsPanel() {
  const { cronjobs, data: cronData, isLoading: cronLoading } = useAdminCronjobs();
  const { approvals, data: appData, isLoading: appLoading } = useApprovals();
  const triggerCronjob = useTriggerAdminCronjob();

  const list = cronjobs ?? cronData ?? EMPTY_CRON;
  const approvalList = approvals ?? appData ?? EMPTY_APPROVALS;
  const pendingApprovals = (approvalList ?? []).filter((a) => a.status === "pending");

  return (
    <div className="space-y-6">
      <Card className="card-health">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Cronjobs</CardTitle>
          <Button asChild size="sm" variant="outline">
            <Link to="/dashboard/cronjobs">Open Cronjobs</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {cronLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : list.length === 0 ? (
            <p className="text-sm text-muted-foreground">No cronjobs in admin scope.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-white/[0.03]">
              <table className="w-full text-sm" role="grid">
                <thead>
                  <tr className="border-b border-white/[0.03] bg-secondary/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Schedule</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="w-20 px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {(list ?? []).map((cj) => (
                    <tr key={cj.id} className="border-b border-white/[0.03] hover:bg-secondary/30">
                      <td className="px-4 py-3 font-medium">{cj.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{cj.schedule} ({cj.timezone})</td>
                      <td className="px-4 py-3">
                        <Badge variant={cj.enabled ? "default" : "secondary"}>{cj.enabled ? "On" : "Off"}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => triggerCronjob.mutate(cj.id)}
                          disabled={triggerCronjob.isPending}
                          aria-label="Run now"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="card-health">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Approvals queue</CardTitle>
          <Button asChild size="sm" variant="outline">
            <Link to="/dashboard/approvals">Open Approvals</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {appLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : pendingApprovals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No items awaiting approval.</p>
          ) : (
            <ul className="space-y-2">
              {(pendingApprovals ?? []).map((a) => (
                <li key={a.id} className="flex items-center justify-between rounded-md border border-white/[0.03] p-3 text-sm">
                  <span>{a.description}</span>
                  <Badge variant="secondary">{a.type}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
