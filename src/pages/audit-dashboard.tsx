/**
 * Audit Dashboard (page_admin_dashboard_028) — Audit & Reversibility.
 * Overview tiles: total audits, reversible actions, pending approvals, recent runs, throughput.
 * Filters, audit timeline, export panel, approvals queue.
 */

import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { AnimatedPage } from "@/components/animated-page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KPICard } from "@/components/admin/kpi-card";
import { AuditTimeline, RevertConsole, AuditExportPanel } from "@/components/audit";
import {
  useAuditEvents,
  useAuditOverview,
  useRecentRuns,
  usePendingApprovals,
  useRevertPrepare,
  useRevertExecute,
  useAuditExport,
} from "@/hooks/use-audit";
import type { AuditEventFilters, AuditEvent, AuditEventStatus } from "@/types/audit";
import {
  History,
  RotateCcw,
  CheckSquare,
  Activity,
  TrendingUp,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "__all__", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" },
  { value: "REVERTED", label: "Reverted" },
];

export default function AuditDashboardPage() {
  const [filters, setFilters] = useState<AuditEventFilters>({
    limit: 50,
    page: 1,
  });
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [revertRationale, setRevertRationale] = useState("");
  const [runIdInput, setRunIdInput] = useState("");
  const [statusInput, setStatusInput] = useState<string>("__all__");
  const [revertibleInput, setRevertibleInput] = useState<string>("__all__");

  const { data: overview, isLoading: overviewLoading } = useAuditOverview();
  const { runs: recentRuns, isLoading: runsLoading } = useRecentRuns(10);
  const { items: pendingApprovals, isLoading: approvalsLoading } = usePendingApprovals();
  const { events, isLoading: eventsLoading } = useAuditEvents(filters);

  const revertPrepare = useRevertPrepare();
  const revertExecute = useRevertExecute();
  const exportMutation = useAuditExport();

  const handleSelectEvent = useCallback(
    (event: AuditEvent) => {
      setSelectedEvent(event);
      if (event.revertible) {
        revertPrepare.mutate({ eventId: event.id, runId: event.runId ?? undefined });
      }
    },
    [revertPrepare]
  );

  const handleRevertClick = useCallback(
    (event: AuditEvent) => {
      setSelectedEvent(event);
      setRevertRationale("");
      if (event.revertible) {
        revertPrepare.mutate({ eventId: event.id, runId: event.runId ?? undefined });
      }
    },
    [revertPrepare]
  );

  const handleConfirmRevert = useCallback(() => {
    if (selectedEvent?.id == null) return;
    const prep = revertPrepare.data?.eventId === selectedEvent.id ? revertPrepare.data : null;
    revertExecute.mutate(
      {
        eventId: selectedEvent.id,
        payload: {
          rationale: revertRationale || "User-initiated revert",
          confirmations: prep?.requiredApprovals,
        },
      },
      {
        onSuccess: () => {
          setSelectedEvent(null);
          setRevertRationale("");
        },
      }
    );
  }, [selectedEvent, revertRationale, revertPrepare.data, revertExecute]);

  const handleExport = useCallback(
    (exportFilters: { format: "csv" | "json"; from?: string; to?: string }) => {
      exportMutation.mutate(exportFilters);
    },
    [exportMutation]
  );

  const preview =
    selectedEvent != null && revertPrepare.data?.eventId === selectedEvent.id
      ? revertPrepare.data
      : null;
  const metrics = overview ?? {
    totalAudits: 0,
    reversibleCount: 0,
    pendingApprovals: 0,
    recentRunsCount: 0,
    throughputLast24h: 0,
  };

  return (
    <AnimatedPage className="space-y-6 animate-fade-in-up">
      <header>
        <h1 className="text-xl font-semibold text-foreground">Audit & Reversibility</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Immutable audit trail, reversible actions, approvals, and export for compliance.
        </p>
      </header>

      {/* Overview tiles */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5" aria-label="Audit metrics">
        {overviewLoading ? (
          <>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-lg border border-white/[0.06] bg-secondary/30"
              />
            ))}
          </>
        ) : (
          <>
            <KPICard
              title="Total audits"
              value={metrics.totalAudits}
              icon={History}
            />
            <KPICard
              title="Reversible actions"
              value={metrics.reversibleCount}
              icon={RotateCcw}
            />
            <KPICard
              title="Pending approvals"
              value={metrics.pendingApprovals}
              icon={CheckSquare}
            />
            <KPICard
              title="Recent runs"
              value={metrics.recentRunsCount}
              icon={Activity}
            />
            <KPICard
              title="Throughput (24h)"
              value={metrics.throughputLast24h}
              icon={TrendingUp}
              trendLabel="Events in last 24 hours"
            />
          </>
        )}
      </section>

      {/* Filters */}
      <Card className="border-white/[0.06] bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Filters</CardTitle>
          <p className="text-sm text-muted-foreground">
            Filter by run, status, and reversibility.
          </p>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <label htmlFor="filter-run-id" className="text-xs font-medium text-muted-foreground">
              Run ID
            </label>
            <Input
              id="filter-run-id"
              placeholder="run-abc"
              value={runIdInput}
              onChange={(e) => setRunIdInput(e.target.value)}
              className="w-40 border-white/[0.06] bg-background font-mono text-sm"
              aria-label="Filter by run ID"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="filter-status" className="text-xs font-medium text-muted-foreground">
              Status
            </label>
            <Select value={statusInput} onValueChange={setStatusInput}>
              <SelectTrigger id="filter-status" className="w-36 border-white/[0.06]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label htmlFor="filter-revertible" className="text-xs font-medium text-muted-foreground">
              Reversible
            </label>
            <Select value={revertibleInput} onValueChange={setRevertibleInput}>
              <SelectTrigger id="filter-revertible" className="w-32 border-white/[0.06]">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Any</SelectItem>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-white/[0.06]"
            onClick={() => {
              setFilters((prev) => ({
                ...prev,
                page: 1,
                runId: runIdInput.trim() || undefined,
                status: statusInput !== "__all__" ? (statusInput as AuditEventStatus) : undefined,
                revertible: revertibleInput === "__all__" ? undefined : revertibleInput === "true",
              }));
            }}
            aria-label="Apply filters"
          >
            Apply
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Audit timeline + Revert console */}
        <div className="lg:col-span-2 space-y-4">
          <AuditTimeline
            events={events}
            isLoading={eventsLoading}
            onSelectEvent={handleSelectEvent}
            onRevertClick={handleRevertClick}
          />
          {selectedEvent != null && selectedEvent.revertible && (
            <RevertConsole
              preview={preview ?? null}
              isLoading={revertPrepare.isPending && preview == null}
              rationale={revertRationale}
              onRationaleChange={setRevertRationale}
              onConfirm={handleConfirmRevert}
              onCancel={() => {
                setSelectedEvent(null);
                setRevertRationale("");
              }}
              isExecuting={revertExecute.isPending}
              confirmLabel="Confirm revert"
            />
          )}
        </div>

        {/* Sidebar: Export, Recent runs, Approvals */}
        <div className="space-y-4">
          <AuditExportPanel
            onExport={handleExport}
            isExporting={exportMutation.isPending}
          />

          <Card className="border-white/[0.06] bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recent runs</CardTitle>
              <p className="text-sm text-muted-foreground">
                Quick link to run details
              </p>
            </CardHeader>
            <CardContent>
              {runsLoading ? (
                <div className="flex items-center justify-center py-6 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                </div>
              ) : (recentRuns ?? []).length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No recent runs
                </p>
              ) : (
                <ul className="space-y-2" role="list">
                  {(recentRuns ?? []).map((run) => (
                    <li key={run.id}>
                      <Link
                        to={`/dashboard/runs/${run.id}`}
                        className={cn(
                          "flex items-center justify-between rounded-md border border-white/[0.06] px-3 py-2 text-sm transition-colors",
                          "hover:bg-secondary/50 hover:text-foreground text-muted-foreground"
                        )}
                      >
                        <span className="truncate font-mono">{run.id}</span>
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/[0.06] bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Pending approvals</CardTitle>
              <p className="text-sm text-muted-foreground">
                Actions awaiting human review
              </p>
            </CardHeader>
            <CardContent>
              {approvalsLoading ? (
                <div className="flex items-center justify-center py-6 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                </div>
              ) : (pendingApprovals ?? []).length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No pending approvals
                </p>
              ) : (
                <ul className="space-y-2" role="list">
                  {(pendingApprovals ?? []).map((item) => (
                    <li
                      key={item.id}
                      className="rounded-md border border-white/[0.06] bg-secondary/20 p-3 text-sm"
                    >
                      <p className="font-medium text-foreground">{item.actionType}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Run: {item.runId} · {item.requestedBy}
                      </p>
                      <div className="mt-2 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => toast.success(`Approved ${item.id}`)}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-muted-foreground"
                          onClick={() => toast.info(`Rejected ${item.id}`)}
                        >
                          Reject
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AnimatedPage>
  );
}
