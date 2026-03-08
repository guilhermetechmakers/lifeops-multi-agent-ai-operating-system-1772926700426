/**
 * AuditExportPanel — CSV/JSON export with date range and scope selectors.
 */

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuditExportFilters } from "@/types/audit";

export interface AuditExportPanelProps {
  onExport: (filters: AuditExportFilters) => void;
  isExporting?: boolean;
  className?: string;
}

const FORMAT_OPTIONS: { value: "csv" | "json"; label: string }[] = [
  { value: "csv", label: "CSV" },
  { value: "json", label: "JSON" },
];

export function AuditExportPanel({
  onExport,
  isExporting = false,
  className,
}: AuditExportPanelProps) {
  const [format, setFormat] = useState<"csv" | "json">("csv");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const handleExport = useCallback(() => {
    const filters: AuditExportFilters = {
      format,
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
    };
    onExport(filters);
  }, [format, from, to, onExport]);

  return (
    <Card className={cn("border-white/[0.06] bg-card transition-shadow duration-200 hover:shadow-card-hover", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-foreground">Export audit trail</CardTitle>
        <p className="text-sm text-muted-foreground">
          Export events to CSV or JSON with optional date range.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="export-format">Format</Label>
            <Select value={format} onValueChange={(v) => setFormat(v as "csv" | "json")}>
              <SelectTrigger id="export-format" className="border-white/[0.06]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORMAT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="export-from">From date</Label>
            <Input
              id="export-from"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="border-white/[0.06] bg-background"
              aria-label="Export from date"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="export-to">To date</Label>
          <Input
            id="export-to"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border-white/[0.06] bg-background"
            aria-label="Export to date"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-white/[0.06]"
          onClick={handleExport}
          disabled={isExporting}
          aria-label="Export audit trail"
        >
          <Download className="h-4 w-4" aria-hidden />
          {isExporting ? "Exporting…" : "Export"}
        </Button>
      </CardContent>
    </Card>
  );
}
