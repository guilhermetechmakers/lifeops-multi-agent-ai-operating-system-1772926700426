/**
 * Compliance & Audit Exporter — Exports queue, create export (format/scope), download.
 * Guards: (exports ?? []).map
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useComplianceExports, useCreateComplianceExport } from "@/hooks/use-admin";
import { FileDown, Download, Loader2 } from "lucide-react";

const EMPTY_EXPORTS: { id: string; status: string; format: string; scope: string; createdAt: string }[] = [];

export function ComplianceAuditExporter() {
  const [createOpen, setCreateOpen] = useState(false);
  const [format, setFormat] = useState<"CSV" | "JSON" | "XML">("CSV");
  const [scope, setScope] = useState("organization-wide");

  const { exports: exportList, data, isLoading } = useComplianceExports();
  const createExport = useCreateComplianceExport();

  const list = exportList ?? data ?? EMPTY_EXPORTS;

  const handleCreate = () => {
    createExport.mutate(
      { format, scope },
      { onSuccess: () => setCreateOpen(false) }
    );
  };

  return (
    <div className="space-y-6">
      <Card className="card-health">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
          <CardTitle>Audit exports</CardTitle>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <FileDown className="mr-2 h-4 w-4" />
            New export
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">Loading...</div>
          ) : list.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center gap-2 text-muted-foreground">
              <p>No exports yet.</p>
              <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
                Create export
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-white/[0.03]">
              <table className="w-full text-sm" role="grid">
                <thead>
                  <tr className="border-b border-white/[0.03] bg-secondary/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Format</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Scope</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
                    <th className="w-24 px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {(list ?? []).map((ex) => (
                    <tr key={ex.id} className="border-b border-white/[0.03] hover:bg-secondary/30">
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            ex.status === "completed"
                              ? "default"
                              : ex.status === "failed"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {ex.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">{ex.format}</td>
                      <td className="px-4 py-3 text-muted-foreground">{ex.scope}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(ex.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        {ex.status === "completed" && (
                          <Button variant="ghost" size="sm" aria-label="Download">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        {ex.status === "processing" && (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New audit export</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Format</Label>
              <Select value={format} onValueChange={(v) => setFormat(v as "CSV" | "JSON" | "XML")}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CSV">CSV</SelectItem>
                  <SelectItem value="JSON">JSON</SelectItem>
                  <SelectItem value="XML">XML</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="scope">Scope</Label>
              <Input
                id="scope"
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                className="mt-1"
                placeholder="organization-wide, per-user, per-data-type"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createExport.isPending}>
              Start export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
