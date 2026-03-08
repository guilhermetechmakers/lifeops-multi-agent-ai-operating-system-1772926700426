/**
 * AdminComplianceHintCard — Reminds about org-level settings, retention policies, audit exports.
 * Links to Admin Dashboard and Compliance.
 */

import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, FileCheck, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdminComplianceHintCardProps {
  className?: string;
}

export function AdminComplianceHintCard({ className }: AdminComplianceHintCardProps) {
  return (
    <Card className={cn("card-health border-amber/20 bg-amber/5", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="h-4 w-4 text-amber" aria-hidden />
          Admin & compliance
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Org-level settings, data retention policies, and audit exports are managed in Admin.
        </p>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <Button variant="outline" size="sm" className="gap-2 border-white/10" asChild>
          <Link to="/dashboard/admin">
            <Shield className="h-4 w-4" />
            Admin dashboard
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="gap-2 border-white/10" asChild>
          <Link to="/dashboard/admin/compliance">
            <FileCheck className="h-4 w-4" />
            Compliance & audit
            <ExternalLink className="h-3 w-3" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
