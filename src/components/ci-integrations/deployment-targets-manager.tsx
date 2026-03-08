/**
 * DeploymentTargetsManager — define and edit deployment environments.
 */

import { Server, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DeploymentTarget } from "@/types/integrations";

export interface DeploymentTargetsManagerProps {
  targets: DeploymentTarget[];
  onActivate?: (targetId: string) => void;
  className?: string;
}

export function DeploymentTargetsManager({
  targets = [],
  onActivate: _onActivate,
  className,
}: DeploymentTargetsManagerProps) {
  const list = Array.isArray(targets) ? targets : [];

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Server className="h-5 w-5 text-muted-foreground" />
          Deployment targets
        </CardTitle>
      </CardHeader>
      <CardContent>
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No deployment targets configured.
          </p>
        ) : (
          <div className="space-y-2">
            {(list as DeploymentTarget[]).map((target) => (
              <div
                key={target.id}
                className="flex items-center justify-between gap-2 rounded-md border border-white/[0.03] bg-secondary/30 px-3 py-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Server className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{target.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {target.environment} · {target.cluster} · {target.region}
                    </p>
                  </div>
                </div>
                <Badge variant={target.isActive ? "success" : "secondary"}>
                  {target.isActive ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Active
                    </span>
                  ) : (
                    "Inactive"
                  )}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
