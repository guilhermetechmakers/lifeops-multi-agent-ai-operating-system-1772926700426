/**
 * IntegrationsDashboard — main page container with header, filters, integration cards.
 */

import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Search, Plug } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IntegrationCard } from "./integration-card";
import { LogsPanel } from "./logs-panel";
import { RunHistoryPanel } from "./run-history-panel";
import { AdapterConfigEditor } from "./adapter-config-editor";
import { RepoLinksManager } from "./repo-links-manager";
import { DeploymentTargetsManager } from "./deployment-targets-manager";
import { ActivityAuditTrail } from "./activity-audit-trail";
import {
  useIntegrationsList,
  useTriggerRun,
  useIntegrationLogs,
  useIntegrationRuns,
  useAdapters,
  useSaveAdapters,
  useDeploymentTargets,
  useRepoLinks,
  useSaveRepoLink,
  useIntegrationAudit,
} from "@/hooks/use-integrations";
import { useProject } from "@/hooks/use-projects";
import { cn } from "@/lib/utils";
import type { Integration, IntegrationType, IntegrationStatus } from "@/types/integrations";

export interface IntegrationsDashboardProps {
  projectId: string;
  className?: string;
}

type SortBy = "lastRun" | "name" | "health";

export function IntegrationsDashboard({ projectId, className }: IntegrationsDashboardProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<IntegrationType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<IntegrationStatus | "all">("all");
  const [sortBy, setSortBy] = useState<SortBy>("lastRun");
  const [logsOpen, setLogsOpen] = useState(false);
  const [runHistoryOpen, setRunHistoryOpen] = useState(false);
  const [adapterEditorOpen, setAdapterEditorOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [selectedRun, setSelectedRun] = useState<{
    run: import("@/types/integrations").RunRecord;
    integration: Integration;
  } | null>(null);

  const { data: project } = useProject(projectId);
  const { items: integrations, isLoading } = useIntegrationsList(projectId);
  const { items: deploymentTargets } = useDeploymentTargets(projectId);
  const { items: repoLinks } = useRepoLinks(projectId);
  const saveRepoLink = useSaveRepoLink(projectId);
  const { items: auditEntries } = useIntegrationAudit(projectId);

  const intId = selectedIntegration?.id ?? null;
  const { items: logs, isLoading: logsLoading } = useIntegrationLogs(
    intId,
    undefined,
    logsOpen && Boolean(intId)
  );
  const { items: runs } = useIntegrationRuns(intId, logsOpen || runHistoryOpen);
  const { items: adapters } = useAdapters(intId, adapterEditorOpen && Boolean(intId));
  const triggerRun = useTriggerRun(intId ?? "");
  const saveAdapters = useSaveAdapters(intId ?? "");

  const filteredAndSorted = useMemo(() => {
    let list = (integrations ?? []).filter((i) => {
      if (typeFilter !== "all" && i.type !== typeFilter) return false;
      if (statusFilter !== "all" && i.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !i.name.toLowerCase().includes(q) &&
          !i.provider.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "health") return b.healthScore - a.healthScore;
      const aTime = a.lastRunAt ? new Date(a.lastRunAt).getTime() : 0;
      const bTime = b.lastRunAt ? new Date(b.lastRunAt).getTime() : 0;
      return bTime - aTime;
    });
    return list;
  }, [integrations, typeFilter, statusFilter, search, sortBy]);

  const handleViewLogs = useCallback((integration: Integration) => {
    setSelectedIntegration(integration);
    setLogsOpen(true);
  }, []);

  const handleEdit = useCallback((integration: Integration) => {
    setSelectedIntegration(integration);
    setAdapterEditorOpen(true);
  }, []);

  const handleTriggerRun = useCallback(
    (integration: Integration) => {
      setSelectedIntegration(integration);
      triggerRun.mutate();
    },
    [triggerRun]
  );

  const handleSaveAdapters = useCallback(
    async (items: Partial<import("@/types/integrations").AdapterConfig>[]) => {
      if (intId) await saveAdapters.mutateAsync(items);
    },
    [intId, saveAdapters]
  );

  const handleSaveRepoLink = useCallback(
    async (data: Partial<import("@/types/integrations").RepoLink>) => {
      await saveRepoLink.mutateAsync(data);
    },
    [saveRepoLink]
  );

  return (
    <div className={cn("space-y-6", className)}>
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/dashboard/projects" className="hover:text-foreground transition-colors">
          Projects
        </Link>
        <ChevronRight className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
        <Link
          to={`/dashboard/projects/${projectId}`}
          className="hover:text-foreground transition-colors truncate max-w-[180px] md:max-w-none"
        >
          {project?.name ?? "Project"}
        </Link>
        <ChevronRight className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
        <span className="text-foreground font-medium">CI & Integrations</span>
      </nav>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/50">
            <Plug className="h-5 w-5 text-muted-foreground" aria-hidden />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">CI & Integrations</h1>
            <p className="text-sm text-muted-foreground">
              Manage repository links, CI/CD connectors, and deployment targets
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search integrations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-white/[0.03]"
            aria-label="Search integrations"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as IntegrationType | "all")}>
            <SelectTrigger className="w-[130px] border-white/[0.03]" aria-label="Filter by type">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="git">Git</SelectItem>
              <SelectItem value="ci">CI</SelectItem>
              <SelectItem value="deploy">Deploy</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as IntegrationStatus | "all")}>
            <SelectTrigger className="w-[130px] border-white/[0.03]" aria-label="Filter by status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="unknown">Unknown</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
            <SelectTrigger className="w-[130px] border-white/[0.03]" aria-label="Sort by">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lastRun">Last run</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="health">Health</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <div className="rounded-lg border border-white/[0.03] bg-card p-8 text-center text-muted-foreground">
              Loading integrations…
            </div>
          ) : filteredAndSorted.length === 0 ? (
            <div className="rounded-lg border border-white/[0.03] bg-card p-8 text-center">
              <Plug className="h-12 w-12 mx-auto text-muted-foreground mb-4" aria-hidden />
              <h3 className="text-lg font-semibold text-foreground">No integrations</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add repository links and CI/CD connectors to get started.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredAndSorted.map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onTestTrigger={() => handleTriggerRun(integration)}
                  onViewLogs={() => handleViewLogs(integration)}
                  onRerun={() => handleTriggerRun(integration)}
                  onEdit={() => handleEdit(integration)}
                  onViewRunHistory={() => {
                    setSelectedIntegration(integration);
                    setRunHistoryOpen(true);
                  }}
                  isRunning={
                    selectedIntegration?.id === integration.id && triggerRun.isPending
                  }
                />
              ))}
            </div>
          )}
        </div>
        <div className="space-y-6">
          <RepoLinksManager
            repoLinks={repoLinks ?? []}
            onSave={handleSaveRepoLink}
          />
          <DeploymentTargetsManager targets={deploymentTargets ?? []} />
          <ActivityAuditTrail entries={auditEntries ?? []} />
        </div>
      </div>

      <LogsPanel
        open={logsOpen}
        onOpenChange={setLogsOpen}
        integrationName={selectedIntegration?.name}
        logs={logs ?? []}
        isLoading={logsLoading}
        runId={undefined}
      />

      <RunHistoryPanel
        open={runHistoryOpen}
        onOpenChange={(open) => {
          setRunHistoryOpen(open);
          if (!open) setSelectedRun(null);
        }}
        run={selectedRun?.run ?? (selectedIntegration && runs?.[0] ? runs[0] : null)}
        integrationName={selectedRun?.integration?.name ?? selectedIntegration?.name}
      />

      <AdapterConfigEditor
        open={adapterEditorOpen}
        onOpenChange={setAdapterEditorOpen}
        adapters={adapters ?? []}
        onSave={handleSaveAdapters}
        isLoading={saveAdapters.isPending}
      />
    </div>
  );
}
