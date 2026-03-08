/**
 * ComplianceReportsPanel — compliance reports list with link to full reports.
 * Uses billing API; arrays guarded.
 */

import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileCheck } from "lucide-react";
import { getComplianceReports } from "@/api/billing";
import { useQuery } from "@tanstack/react-query";

const COMPLIANCE_QUERY_KEY = ["admin", "compliance", "reports"];

export function ComplianceReportsPanel() {
  const { data: reports, isLoading } = useQuery({
    queryKey: COMPLIANCE_QUERY_KEY,
    queryFn: () => getComplianceReports(),
    staleTime: 60 * 1000,
  });

  const list = Array.isArray(reports) ? reports : [];

  return (
    <Card className="card-health">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Compliance reports</CardTitle>
        <FileCheck className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : list.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reports yet.</p>
        ) : (
          <ul className="space-y-2">
            {list.slice(0, 5).map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="font-medium text-foreground">{r.scope ?? r.id}</span>
                <div className="flex items-center gap-2">
                  <Badge variant={r.status === "completed" ? "secondary" : "outline"}>
                    {r.status ?? "—"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {r.generatedAt
                      ? format(new Date(r.generatedAt), "MMM d, yyyy")
                      : "—"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
        <Link
          to="/dashboard/admin/compliance"
          className="inline-block text-sm font-medium text-primary hover:underline mt-3"
        >
          View all reports →
        </Link>
      </CardContent>
    </Card>
  );
}
