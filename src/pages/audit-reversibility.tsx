/**
 * Audit & Reversibility — Admin Dashboard Extensions (page_admin_dashboard_028).
 * Global audit controls, export, retention, approvals, overview tiles, filters.
 */

import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  History,
  RotateCcw,
  CheckSquare,
  Clock,
  TrendingUp,
  Download,
  FileText,
  Filter,
} from "lucide-react";
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
import { AnimatedPage } from "@/components/animated-page";
import { AuditTimeline, RevertConsole } from "@/components/audit";
import {
  useAuditEvents,
  useRevertPrepare,
  useRevertExecute,
  useAuditExport,
} from "@/hooks/use-audit";
import type { AuditEvent, AuditEventFilters } from "@/types/audit";

const EVENT_TYPES = [
  { value: "__all__", label: "All types" },
  { value: "RUN_START", label: "Run start" },
  { value: "RUN_COMPLETE", label: "Run complete" },
  { value: "ACTION_REVERT_REQUEST", label: "Revert request" },
  { value: "REVERT_COMPLETE", label: "Revert complete" },
  { value: "APPROVAL_REQUEST", label: "Approval request" },
];

const STATUS_OPTIONS = [
  { value: "__all__", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" },
  { value: "REVERTED", label: "Reverted" },
];

export default function AuditReversibilityPage() {
  const [filters, setFilters] = useState<AuditEventFilters>({
    limit: 50,
    page: 1,
  });
  const [runIdFilter, setRunIdFilter] = useState("");
  const [cronJobFilter, setCronJobFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("__all__");
  const [statusFilter, setStatusFilter] = useState("__all__");
  const [revertibleFilter, setRevertibleFilter] = useState<string>("__all__");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [revertRationale, setRevertRationale] = useState("");
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv");

  const effectiveFilters: AuditEventFilters = {
    ...filters,
    ...(runIdFilter ? { runId: runIdFilter } : {}),
    ...(cronJobFilter ? { cronJobId: cronJobFilter } : {}),
    ...(typeFilter !== "__all__" ? { type: typeFilter } : {}),
    ...(statusFilter !== "__all__" ? { status: statusFilter as import("@/types/audit").AuditEventStatus } : {}),
    ...(revertibleFilter === "true" ? { revertible: true } : {}),
    ...(revertibleFilter === "false" ? { revertible: false } : {}),
    ...(fromDate ? { from: fromDate } : {}),
    ...(toDate ? { to: toDate } : {}),
  };

  const { events, count, isLoading } = useAuditEvents(effectiveFilters);
  const revertPrepare = useRevertPrepare();
  const revertExecute = useRevertExecute();
  const exportMutation = useAuditExport();

  const reversibleCount = (events ?? []).filter((e) => e.revertible && e.status === "COMPLETED").length;
  const pendingCount = (events ?? []).filter((e) => e.status === "PENDING").length;

  const handleApplyFilters = useCallback(() => {
    setFilters((prev) => ({ ...prev, ...effectiveFilters }));
  }, [effectiveFilters]);

  const handleRevertClick = useCallback((ev: AuditEvent) => {
    setSelectedEvent(ev);
    setRevertRationale("");
    revertPrepare.mutate({ eventId: ev.id, runId: ev.runId ?? undefined });
  }, [revertPrepare]);

  const handleExecuteRevert = useCallback(() => {
    if (!selectedEvent) return;
    const preview =
      revertPrepare.data?.eventId === selectedEvent.id ? revertPrepare.data : null;
    revertExecute.mutate({
      eventId: selectedEvent.id,
      payload: {
        rationale: revertRationale || "User-initiated revert",
        confirmations: preview?.requiredApprovals,
      },
    });
    setSelectedEvent(null);
    setRevertRationale("");
  }, [selectedEvent, revertRationale, revertPrepare.data, revertExecute]);

  const handleCancelRevert = useCallback(() => {
    setSelectedEvent(null);
    setRevertRationale("");
  }, []);

  const handleExport = useCallback(() => {
    exportMutation.mutate({
      format: exportFormat,
      from: fromDate || undefined,
      to: toDate || undefined,
      runId: runIdFilter || undefined,
      cronJobId: cronJobFilter || undefined,
      eventType: typeFilter !== "__all__" ? typeFilter : undefined,
      status: statusFilter !== "__all__" ? statusFilter : undefined,
    });
  }, [
    exportFormat,
    fromDate,
    toDate,
    runIdFilter,
    cronJobFilter,
    typeFilter,
    statusFilter,
    exportMutation,
  ]);

  return (
    <AnimatedPage className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Audit & Reversibility
        </h1>
        <p className="text-sm text-muted-foreground">
          Global audit controls, export, retention policies, and revert approvals
        </p>
      </div>

      {/* Overview tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B] transition-shadow duration-200 hover:shadow-card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total audits
            </CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{count}</div>
            <p className="text-xs text-muted-foreground">Events in scope</p>
          </CardContent>
        </Card>
        <Card className="border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B] transition-shadow duration-200 hover:shadow-card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Reversible
            </CardTitle>
            <RotateCcw className="h-4 w-4 text-teal" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal">{reversibleCount}</div>
            <p className="text-xs text-muted-foreground">Can be reverted</p>
          </CardContent>
        </Card>
        <Card className="border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B] transition-shadow duration-200 hover:shadow-card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending approvals
            </CardTitle>
            <CheckSquare className="h-4 w-4 text-amber" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber">{pendingCount}</div>
            <Link
              to="/dashboard/approvals"
              className="text-xs text-primary hover:underline"
            >
              Review queue
            </Link>
          </CardContent>
        </Card>
        <Card className="border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B] transition-shadow duration-200 hover:shadow-card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recent runs
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {(events ?? []).filter((e) => e.runId).length}
            </div>
            <Link
              to="/dashboard/cronjobs"
              className="text-xs text-primary hover:underline"
            >
              View cronjobs
            </Link>
          </CardContent>
        </Card>
        <Card className="border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B] transition-shadow duration-200 hover:shadow-card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Throughput
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {count > 0 ? Math.round(count / 7) : 0}
            </div>
            <p className="text-xs text-muted-foreground">Events / week (est.)</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Export */}
      <Card className="border-white/[0.03] bg-card">
        <CardHeader className="p-4 md:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="h-4 w-4 text-muted-foreground" />
              Filters & Export
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as "csv" | "json")}>
                <SelectTrigger className="w-[100px] border-white/[0.03]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleExport}
                disabled={exportMutation.isPending}
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="Run ID"
              value={runIdFilter}
              onChange={(e) => setRunIdFilter(e.target.value)}
              className="w-[140px] border-white/[0.03]"
            />
            <Input
              placeholder="Cronjob ID"
              value={cronJobFilter}
              onChange={(e) => setCronJobFilter(e.target.value)}
              className="w-[140px] border-white/[0.03]"
            />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px] border-white/[0.03]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] border-white/[0.03]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={revertibleFilter} onValueChange={setRevertibleFilter}>
              <SelectTrigger className="w-[130px] border-white/[0.03]">
                <SelectValue placeholder="Reversible" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All</SelectItem>
                <SelectItem value="true">Reversible only</SelectItem>
                <SelectItem value="false">Non-reversible</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              placeholder="From"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-[140px] border-white/[0.03]"
            />
            <Input
              type="date"
              placeholder="To"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-[140px] border-white/[0.03]"
            />
            <Button size="sm" onClick={handleApplyFilters}>
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main content: Audit Timeline + Revert Console */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AuditTimeline
            events={events}
            onRevertClick={handleRevertClick}
          />
        </div>
        <div>
          {selectedEvent ? (
            <RevertConsole
              preview={
                revertPrepare.data?.eventId === selectedEvent.id
                  ? revertPrepare.data
                  : null
              }
              isLoading={revertPrepare.isPending}
              rationale={revertRationale}
              onRationaleChange={setRevertRationale}
              onConfirm={handleExecuteRevert}
              onCancel={handleCancelRevert}
              isExecuting={revertExecute.isPending}
            />
          ) : (
            <Card className="border-white/[0.03] bg-card">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Select a reversible event to preview and revert
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </AnimatedPage>
  );
}
