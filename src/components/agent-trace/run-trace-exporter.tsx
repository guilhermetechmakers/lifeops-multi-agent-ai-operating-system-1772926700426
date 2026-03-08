/**
 * RunTraceExporter — export trace to JSON or ZIP with scope selection.
 */

import { useState } from "react";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ExportOptions } from "@/types/agent-trace";

export interface RunTraceExporterProps {
  runId: string | null;
  onExport: (options: ExportOptions) => void;
  isExporting?: boolean;
  className?: string;
}

export function RunTraceExporter({
  runId,
  onExport,
  isExporting = false,
  className,
}: RunTraceExporterProps) {
  const [format, setFormat] = useState<"json" | "zip">("json");
  const [scope, setScope] = useState<"single" | "aggregate" | "workspace">("single");

  const handleExport = () => {
    if (!runId) return;
    onExport({
      format,
      scope,
      runIds: scope === "single" ? [runId] : undefined,
    });
  };

  return (
    <Card className={cn("rounded-lg border-white/[0.03] bg-card", className)}>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-medium">Export Trace</CardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">
          Download run inputs, message trace, memory snapshots, and logs
        </p>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Format</label>
            <Select value={format} onValueChange={(v) => setFormat(v as "json" | "zip")}>
              <SelectTrigger className="h-9 bg-secondary border-white/[0.03]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="zip">ZIP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Scope</label>
            <Select value={scope} onValueChange={(v) => setScope(v as "single" | "aggregate" | "workspace")}>
              <SelectTrigger className="h-9 bg-secondary border-white/[0.03]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single run</SelectItem>
                <SelectItem value="aggregate">Aggregate runs</SelectItem>
                <SelectItem value="workspace">Entire workspace</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full border-white/[0.03]"
          onClick={handleExport}
          disabled={!runId || isExporting}
          aria-label="Export trace"
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? "Exporting…" : "Export"}
        </Button>
      </CardContent>
    </Card>
  );
}
