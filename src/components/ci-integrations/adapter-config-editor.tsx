/**
 * AdapterConfigEditor — map events to agent workflows, templates, scope, permissions.
 */

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AdapterConfig } from "@/types/integrations";

export interface AdapterConfigEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adapters: AdapterConfig[];
  onSave: (adapters: Partial<AdapterConfig>[]) => Promise<void>;
  isLoading?: boolean;
}

const DEFAULT_ADAPTER: Partial<AdapterConfig> = {
  eventName: "",
  workflowName: "",
  payloadTemplate: "{}",
  scope: "project",
  requiredPermissions: [],
};

export function AdapterConfigEditor({
  open,
  onOpenChange,
  adapters = [],
  onSave,
  isLoading = false,
}: AdapterConfigEditorProps) {
  const [items, setItems] = useState<Partial<AdapterConfig>[]>([]);
  const [saving, setSaving] = useState(false);

  const list = Array.isArray(adapters) ? adapters : [];

  useEffect(() => {
    if (open) setItems(list.map((a) => ({ ...a })));
  }, [open, adapters]);

  const handleOpen = (isOpen: boolean) => {
    onOpenChange(isOpen);
  };

  const displayItems = items.length > 0 ? items : list.map((a) => ({ ...a }));

  const addRow = () => {
    setItems((prev) => [...prev, { ...DEFAULT_ADAPTER }]);
  };

  const removeRow = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateRow = (idx: number, field: keyof AdapterConfig, value: unknown) => {
    setItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const toSave = items.length > 0 ? items : list.map((a) => ({ ...a }));
      await onSave(toSave);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const rows = displayItems;

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent
        className="max-w-xl max-h-[85vh] flex flex-col border-white/[0.03] bg-card"
        showClose={true}
      >
        <DialogHeader>
          <DialogTitle>Adapter configuration</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Map project events to agent workflows. Events trigger runbooks with the specified payload.
        </p>
        <ScrollArea className="flex-1 min-h-[200px]">
          <div className="space-y-4 py-2">
            {rows.map((row, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-white/[0.03] bg-secondary/20 p-4 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Mapping {idx + 1}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeRow(idx)}
                    aria-label="Remove mapping"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-2">
                  <Label>Event name</Label>
                  <Input
                    value={row.eventName ?? ""}
                    onChange={(e) => updateRow(idx, "eventName", e.target.value)}
                    placeholder="e.g. PR Created"
                    className="border-white/[0.03]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Workflow name</Label>
                  <Input
                    value={row.workflowName ?? ""}
                    onChange={(e) => updateRow(idx, "workflowName", e.target.value)}
                    placeholder="e.g. pr-summary"
                    className="border-white/[0.03]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Payload template (JSON)</Label>
                  <Input
                    value={row.payloadTemplate ?? "{}"}
                    onChange={(e) => updateRow(idx, "payloadTemplate", e.target.value)}
                    placeholder='{"prId": "{{pr.id}}"}'
                    className="font-mono text-xs border-white/[0.03]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Scope</Label>
                  <Input
                    value={row.scope ?? "project"}
                    onChange={(e) => updateRow(idx, "scope", e.target.value)}
                    placeholder="project | repo"
                    className="border-white/[0.03]"
                  />
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex justify-between items-center pt-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-white/[0.03]"
            onClick={addRow}
            aria-label="Add mapping"
          >
            <Plus className="h-4 w-4" />
            Add mapping
          </Button>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || isLoading}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
