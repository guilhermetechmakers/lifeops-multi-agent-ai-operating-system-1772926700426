/**
 * DataRetentionPolicySync — Displays org data retention policy from Admin & Compliance.
 * Read-only; reflects policy constraints on user data lifecycle.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrgPolicy } from "@/hooks/use-admin";
import { FileCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DataRetentionPolicySyncProps {
  orgId: string | null;
  orgName?: string | null;
  className?: string;
}

export function DataRetentionPolicySync({
  orgId,
  orgName,
  className,
}: DataRetentionPolicySyncProps) {
  const { data: policyData, isLoading } = useOrgPolicy(orgId);

  const retentionPolicy = policyData?.retentionPolicy;
  const retentionDays = retentionPolicy?.retentionDays ?? null;
  const policyName = retentionPolicy?.policyName ?? "—";
  const scope = retentionPolicy?.scope ?? "org";

  return (
    <Card
      className={cn(
        "border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B] transition-shadow duration-200 hover:shadow-card-hover",
        className
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
          <FileCheck className="h-4 w-4 text-muted-foreground" aria-hidden />
          Data retention
          {orgName && (
            <span className="font-normal text-muted-foreground">· {orgName}</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!orgId ? (
          <p className="text-sm text-muted-foreground">No organization selected</p>
        ) : isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Loading policy…
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Policy</span>
              <span className="font-medium text-foreground">{policyName}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Retention</span>
              <span className="font-medium text-foreground">
                {retentionDays != null ? `${retentionDays} days` : "—"}
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Scope</span>
              <span className="font-medium text-foreground capitalize">{scope}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
