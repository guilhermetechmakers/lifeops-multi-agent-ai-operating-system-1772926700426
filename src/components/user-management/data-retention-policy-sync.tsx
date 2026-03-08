/**
 * DataRetentionPolicySync — Display org data retention settings.
 * Integrates with Admin & Compliance Tools.
 */

import { useOrgPolicy } from "@/hooks/use-admin";
import { Shield, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DataRetentionPolicySyncProps {
  orgId: string | null;
  className?: string;
}

export function DataRetentionPolicySync({ orgId, className }: DataRetentionPolicySyncProps) {
  const { data, isLoading } = useOrgPolicy(orgId);
  const policy = data?.retentionPolicy;
  const retentionDays = policy?.retentionDays ?? 365;
  const scope = policy?.scope ?? "org";

  if (!orgId) return null;

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2 rounded-md border border-white/[0.03] bg-secondary/30 px-3 py-2", className)}>
        <Shield className="h-4 w-4 animate-pulse text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading policy…</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border border-white/[0.03] bg-secondary/30 px-3 py-2",
        className
      )}
      role="status"
      aria-label={`Data retention: ${retentionDays} days, scope: ${scope}`}
    >
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-foreground">
        Retention: {retentionDays} days
      </span>
      <span className="text-xs text-muted-foreground">({scope})</span>
    </div>
  );
}
