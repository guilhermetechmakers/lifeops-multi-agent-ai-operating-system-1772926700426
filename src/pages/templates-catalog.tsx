/**
 * Dashboard Agent Templates catalog: grid, filters, detail drawer, version, sandbox.
 * Route: /dashboard/templates
 * All array reads guarded with (data ?? []) and Array.isArray.
 */

import { useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  FileCode,
  FileText,
  Wallet,
  Heart,
  Eye,
  FlaskConical,
  Upload,
  Plus,
  MoreHorizontal,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AnimatedPage } from "@/components/animated-page";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useTemplates,
  useTemplate,
  useTemplateVersions,
  usePublishTemplate,
} from "@/hooks/use-templates";
import { TemplateDetailDrawer, SandboxRunnerPanel } from "@/components/templates";
import type {
  AgentTemplate,
  TemplateDomain,
  TemplateListParams,
} from "@/types/templates-personas";
import { cn } from "@/lib/utils";

const DOMAINS: { value: TemplateDomain | "all"; label: string }[] = [
  { value: "all", label: "All domains" },
  { value: "developer", label: "Developer Triage" },
  { value: "content", label: "Content Writer" },
  { value: "finance", label: "Finance Reconciler" },
  { value: "health", label: "Health Coach" },
];

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "deprecated", label: "Deprecated" },
];

const DOMAIN_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  developer: FileCode,
  content: FileText,
  finance: Wallet,
  health: Heart,
};

export default function TemplatesCatalogPage() {
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState<TemplateDomain | "all">("all");
  const [status, setStatus] = useState<string>("all");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [testPanelId, setTestPanelId] = useState<string | null>(null);

  const listParams = useMemo((): TemplateListParams => {
    return {
      search: search.trim() || undefined,
      domain: domain === "all" ? undefined : domain,
      status:
        status === "draft" || status === "published" || status === "deprecated"
          ? (status as TemplateListParams["status"])
          : undefined,
    };
  }, [search, domain, status]);

  const { items, isLoading, isError } = useTemplates(listParams);
  const { data: detailTemplate } = useTemplate(detailId);
  const { data: versions = [] } = useTemplateVersions(detailId);
  const publishMutation = usePublishTemplate();

  const versionsList = Array.isArray(versions) ? versions : [];
  const filteredItems = useMemo(() => items ?? [], [items]);

  const handlePreview = useCallback((t: AgentTemplate) => {
    setDetailId(t.id);
  }, []);

  const handleTest = useCallback((t: AgentTemplate) => {
    setTestPanelId(t.id);
  }, []);

  const handlePublish = useCallback(
    (id: string) => {
      publishMutation.mutate(id);
      setDetailId(null);
    },
    [publishMutation]
  );

  return (
    <AnimatedPage className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Agent template catalog
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Reusable agent templates — preview, test in sandbox, and publish.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/dashboard/cronjobs/new">
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New from template
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search templates…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary/50"
            aria-label="Search templates"
          />
        </div>
        <Select value={domain} onValueChange={(v) => setDomain(v as TemplateDomain | "all")}>
          <SelectTrigger className="w-[180px] bg-secondary/50">
            <SelectValue placeholder="Domain" />
          </SelectTrigger>
          <SelectContent>
            {DOMAINS.map((d) => (
              <SelectItem key={d.value} value={d.value}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[140px] bg-secondary/50">
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
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Failed to load templates.
        </div>
      )}

      {!isLoading && !isError && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((t) => {
            const Icon = DOMAIN_ICONS[t.domain] ?? FileCode;
            return (
              <Card
                key={t.id}
                className={cn(
                  "flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover cursor-pointer"
                )}
                onClick={() => handlePreview(t)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="rounded-md bg-primary/10 p-1.5">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <h2 className="text-base font-medium text-foreground truncate">
                        {t.name}
                      </h2>
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      v{t.version ?? 1}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-1 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {t.domain}
                    </Badge>
                    <Badge
                      variant={t.status === "published" ? "default" : "outline"}
                      className="text-xs"
                    >
                      {t.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 pt-0 flex flex-col">
                  <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                    {t.description || "No description."}
                  </p>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.03]">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreview(t);
                      }}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTest(t);
                      }}
                    >
                      <FlaskConical className="h-3 w-3 mr-1" />
                      Test
                    </Button>
                    {t.status !== "published" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePublish(t.id);
                        }}
                        disabled={publishMutation.isPending}
                      >
                        <Upload className="h-3 w-3 mr-1" />
                        Publish
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreview(t);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTest(t);
                          }}
                        >
                          <FlaskConical className="h-4 w-4 mr-2" />
                          Run sandbox test
                        </DropdownMenuItem>
                        <Link to={`/dashboard/cronjobs/new?template=${t.id}`}>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Plus className="h-4 w-4 mr-2" />
                            Use in cronjob
                          </DropdownMenuItem>
                        </Link>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!isLoading && !isError && filteredItems.length === 0 && (
        <div className="rounded-lg border border-white/[0.03] bg-secondary/30 px-6 py-12 text-center text-sm text-muted-foreground">
          No templates match your filters.
        </div>
      )}

      <TemplateDetailDrawer
        template={detailTemplate ?? null}
        open={Boolean(detailId)}
        onOpenChange={(open) => !open && setDetailId(null)}
        versions={versionsList}
        onPublish={handlePublish}
        onTest={(id) => setTestPanelId(id)}
      />

      {testPanelId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <Card className="w-full max-w-md border-white/[0.03] bg-card shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-sm font-medium">Sandbox test</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTestPanelId(null)}
                aria-label="Close"
              >
                ×
              </Button>
            </CardHeader>
            <CardContent>
              <SandboxRunnerPanel
                templateId={testPanelId}
                onClose={() => setTestPanelId(null)}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </AnimatedPage>
  );
}
