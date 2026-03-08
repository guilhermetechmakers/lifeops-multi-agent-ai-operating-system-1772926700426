/**
 * BulkActionsToolbar — Categorize, Export, Flag for Review, Add Note.
 * Bulk selection support with keyboard shortcuts.
 */

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tag, Download, Flag, StickyNote, X } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "SaaS", name: "SaaS" },
  { id: "Income", name: "Income" },
  { id: "Other", name: "Other" },
];

export interface BulkActionsToolbarProps {
  selectedIds: string[];
  onClearSelection: () => void;
  onCategorize: (ids: string[], category: string, subcategory?: string) => void;
  onExport: (ids: string[], format: "csv" | "json") => void;
  onFlagForReview: (ids: string[], notes?: string) => void;
  onAddNote: (ids: string[], note: string) => void;
  /** When provided, Ctrl/Cmd+A selects all filtered transactions (e.g. pass ids of current filtered list). */
  onSelectAllFiltered?: () => void;
  className?: string;
}

type ModalMode = "categorize" | "flag" | "note" | null;

export function BulkActionsToolbar({
  selectedIds,
  onClearSelection,
  onCategorize,
  onExport,
  onFlagForReview,
  onAddNote,
  onSelectAllFiltered,
  className,
}: BulkActionsToolbarProps) {
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [notes, setNotes] = useState("");
  const [flagNotes, setFlagNotes] = useState("");

  const count = (selectedIds ?? []).length;
  const hasSelection = count > 0;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClearSelection();
      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        const target = e.target as HTMLElement;
        const isInput = /^(INPUT|TEXTAREA|SELECT)$/.test(target?.tagName ?? "");
        if (!isInput && onSelectAllFiltered) {
          e.preventDefault();
          onSelectAllFiltered();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClearSelection, onSelectAllFiltered]);

  const handleCategorize = useCallback(() => {
    if (category.trim() && count > 0) {
      onCategorize(selectedIds, category.trim(), subcategory.trim() || undefined);
      setModalMode(null);
      setCategory("");
      setSubcategory("");
      onClearSelection();
    }
  }, [category, subcategory, selectedIds, count, onCategorize, onClearSelection]);

  const handleFlag = useCallback(() => {
    if (count > 0) {
      onFlagForReview(selectedIds, flagNotes.trim() || undefined);
      setModalMode(null);
      setFlagNotes("");
      onClearSelection();
    }
  }, [selectedIds, count, flagNotes, onFlagForReview, onClearSelection]);

  const handleNote = useCallback(() => {
    if (notes.trim() && count > 0) {
      onAddNote(selectedIds, notes.trim());
      setModalMode(null);
      setNotes("");
      onClearSelection();
    }
  }, [selectedIds, count, notes, onAddNote, onClearSelection]);

  const handleExport = useCallback(
    (format: "csv" | "json") => {
      if (count > 0) {
        onExport(selectedIds, format);
      }
    },
    [selectedIds, count, onExport]
  );

  if (!hasSelection) return null;

  return (
    <div className="contents">
      <div
        className={cn(
          "flex flex-wrap items-center gap-2 rounded-lg border border-white/[0.03] bg-card p-3 animate-fade-in",
          className
        )}
      >
        <span className="text-sm font-medium text-muted-foreground">
          {count} selected
        </span>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 gap-1"
          onClick={() => setModalMode("categorize")}
        >
          <Tag className="h-4 w-4" />
          Categorize
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 gap-1"
          onClick={() => handleExport("csv")}
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 gap-1"
          onClick={() => handleExport("json")}
        >
          <Download className="h-4 w-4" />
          Export JSON
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 gap-1"
          onClick={() => setModalMode("flag")}
        >
          <Flag className="h-4 w-4" />
          Flag for Review
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 gap-1"
          onClick={() => setModalMode("note")}
        >
          <StickyNote className="h-4 w-4" />
          Add Note
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 gap-1 ml-auto"
          onClick={onClearSelection}
          aria-label="Clear selection"
        >
          <X className="h-4 w-4" />
          Clear
        </Button>
      </div>

      <Dialog open={modalMode === "categorize"} onOpenChange={(o) => !o && setModalMode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Categorize</DialogTitle>
            <DialogDescription>
              Assign category and subcategory to {count} selected transaction(s).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Subcategory (optional)</label>
              <Input
                placeholder="e.g. Streaming"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalMode(null)}>
              Cancel
            </Button>
            <Button onClick={handleCategorize} disabled={!category.trim()}>
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalMode === "flag"} onOpenChange={(o) => !o && setModalMode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flag for Review</DialogTitle>
            <DialogDescription>
              Flag {count} transaction(s) for manual review.
            </DialogDescription>
          </DialogHeader>
          <div>
            <label className="text-sm font-medium mb-2 block">Notes (optional)</label>
            <Input
              placeholder="Reason for flagging..."
              value={flagNotes}
              onChange={(e) => setFlagNotes(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalMode(null)}>
              Cancel
            </Button>
            <Button onClick={handleFlag}>Flag</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalMode === "note"} onOpenChange={(o) => !o && setModalMode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>
              Add a note to {count} selected transaction(s).
            </DialogDescription>
          </DialogHeader>
          <div>
            <label className="text-sm font-medium mb-2 block">Note</label>
            <Input
              placeholder="Note text..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalMode(null)}>
              Cancel
            </Button>
            <Button onClick={handleNote} disabled={!notes.trim()}>
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
