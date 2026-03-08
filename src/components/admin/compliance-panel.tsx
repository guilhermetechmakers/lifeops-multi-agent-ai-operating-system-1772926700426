/**
 * CompliancePanel — Export queue, run controls, download artifacts.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileCheck, Download, FileDown } from "lucide-react";
import { useComplianceExports, useCreateComplianceExport } from "@/hooks/use-admin";
import { AnimatedPage } from "@/components/animated-page";
import { cn } from "@/lib/utils";

export function CompliancePanel() {
  const { exports: exportsList, isLoading } = useComplianceExports();
  const createExport = useCreateComplianceExport();
  const [format, setFormat] = useState<"CSV" | "JSON" | "XML">("CSV");
  const [scope, setScope] = useState("org-wide");

  const handleCreateExport = () => {
    createExport.mutate({ format, scope });
  };

  return (
    <AnimatedPage className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <h2 className="text-lg font-semibold">Compliance & audit exports</h2>
        <div className="flex flex-wrap gap-2">
          <Select value={format} onValueChange={(v) => setFormat(v as "CSV" | "JSON" | "XML")}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CSV">CSV</SelectItem>
              <SelectItem value="JSON">JSON</SelectItem>
              <SelectItem value="XML">XML</SelectItem>
            </SelectContent>
          </Select>
          <Select value={scope} onValueChange={setScope}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="org-wide">Organization-wide</SelectItem>
              <SelectItem value="per-user">Per user</SelectItem>
              <SelectItem value="per-data-type">Per data type</SelectItem>
            </SelectContent>
          </Select>
          <Button
            className="gap-2"
            onClick={handleCreateExport}
            disabled={createExport.isPending}
          >
            <FileDown className="h-4 w-4" />
            New export
          </Button>
        </div>
      </div>

      <Card className="border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B]">
        <CardHeader>
          <CardTitle>Export queue</CardTitle>
          <p className="text-sm text-muted-foreground">
            Pending, processing, completed, failed — download artifacts
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              Loading...
            </div>
          ) : (exportsList ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-white/[0.03] bg-secondary/30 px-6 py-12 text-center">
              <FileCheck className="h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No exports yet.</p>
              <Button className="mt-4" onClick={handleCreateExport}>
                Create export
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {(exportsList ?? []).map((e) => (
                <div
                  key={e?.id ?? ""}
                  className="flex items-center justify-between rounded-lg border border-white/[0.03] px-4 py-3 transition-colors hover:bg-secondary/30"
                >
                  <div className="flex items-center gap-3">
                    <FileCheck className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {e?.format ?? "—"} · {e?.scope ?? "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {e?.createdAt ? new Date(e.createdAt).toLocaleString() : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={cn(
                        e?.status === "completed" && "bg-teal/20 text-teal",
                        e?.status === "processing" && "bg-amber/20 text-amber",
                        e?.status === "failed" && "bg-[#FF3B30]/20 text-[#FF3B30]",
                        e?.status === "pending" && "bg-muted text-muted-foreground"
                      )}
                    >
                      {e?.status ?? "—"}
                    </Badge>
                    {e?.status === "completed" && e?.downloadUrl && (
                      <Button variant="outline" size="sm" className="gap-1" asChild>
                        <a href={e.downloadUrl} download>
                          <Download className="h-4 w-4" />
                          Download
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AnimatedPage>
  );
}
