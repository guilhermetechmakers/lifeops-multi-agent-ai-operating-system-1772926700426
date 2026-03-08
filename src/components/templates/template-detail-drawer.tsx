/**
 * Template detail drawer: metadata, connectors, permissions, version history, sandbox test.
 * All array reads guarded with (data ?? []) and Array.isArray.
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plug,
  Shield,
  History as HistoryIcon,
  FileCode,
  FileText,
  Wallet,
  Heart,
} from "lucide-react";
import { SandboxRunnerPanel } from "./sandbox-runner-panel";
import type { AgentTemplate, TemplateVersion } from "@/types/templates-personas";

const DOMAIN_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  developer: FileCode,
  content: FileText,
  finance: Wallet,
  health: Heart,
};

export interface TemplateDetailDrawerProps {
  template: AgentTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  versions: TemplateVersion[];
  onPublish?: (id: string) => void;
  onTest?: (id: string) => void;
}

export function TemplateDetailDrawer({
  template,
  open,
  onOpenChange,
  versions,
  onPublish: _onPublish,
  onTest: _onTest,
}: TemplateDetailDrawerProps) {
  if (!template) return null;

  const connectors = template.connectors ?? [];
  const permissions = template.permissions ?? [];
  const DomainIcon = DOMAIN_ICONS[template.domain] ?? FileCode;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0"
        showClose={true}
      >
        <DialogHeader className="p-4 pb-0 shrink-0">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <DomainIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-lg font-semibold text-foreground">
                {template.name}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {template.domain}
                </Badge>
                <Badge
                  variant={template.status === "published" ? "default" : "outline"}
                  className="text-xs"
                >
                  {template.status}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  v{template.version ?? 1}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">
          <TabsList className="mx-4 mt-2 shrink-0 w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="connectors">Connectors</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="versions">Versions</TabsTrigger>
            <TabsTrigger value="test">Sandbox test</TabsTrigger>
          </TabsList>
          <ScrollArea className="flex-1 min-h-0">
            <TabsContent value="overview" className="mt-4 px-4 pb-4">
              <p className="text-sm text-muted-foreground">
                {template.description || "No description."}
              </p>
              {(template.tags ?? []).length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {(template.tags ?? []).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-3 text-xs text-muted-foreground">
                Updated {template.updatedAt}
              </div>
            </TabsContent>
            <TabsContent value="connectors" className="mt-4 px-4 pb-4">
              {Array.isArray(connectors) && connectors.length > 0 ? (
                <ul className="space-y-2">
                  {connectors.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center gap-2 rounded-md border border-white/[0.03] bg-secondary/30 px-3 py-2"
                    >
                      <Plug className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{c.connectorName}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No connectors configured.</p>
              )}
            </TabsContent>
            <TabsContent value="permissions" className="mt-4 px-4 pb-4">
              {Array.isArray(permissions) && permissions.length > 0 ? (
                <ul className="space-y-2">
                  {permissions.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center gap-2 rounded-md border border-white/[0.03] bg-secondary/30 px-3 py-2"
                    >
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{p.role}</span>
                      <span className="text-xs text-muted-foreground">— {p.scope}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No permissions defined.</p>
              )}
            </TabsContent>
            <TabsContent value="versions" className="mt-4 px-4 pb-4">
              {Array.isArray(versions) && versions.length > 0 ? (
                <ul className="space-y-2">
                  {versions.map((v) => (
                    <li
                      key={v.id}
                      className="flex items-center gap-2 rounded-md border border-white/[0.03] bg-secondary/30 px-3 py-2"
                    >
                      <HistoryIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">v{v.versionNumber}</span>
                      <span className="text-xs text-muted-foreground">{v.changes}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {v.createdAt}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No version history.</p>
              )}
            </TabsContent>
            <TabsContent value="test" className="mt-4 px-4 pb-4">
              <SandboxRunnerPanel
                templateId={template.id}
                templateName={template.name}
              />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
