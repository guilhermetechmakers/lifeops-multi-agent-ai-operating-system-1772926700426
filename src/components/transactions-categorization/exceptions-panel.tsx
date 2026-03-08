/**
 * ExceptionsPanel — ExceptionList and AddExceptionInline.
 * Transactions flagged as exceptions with notes, reviewer, status.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TransactionException, TransactionEnriched } from "@/types/finance";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export interface ExceptionsPanelProps {
  exceptions: TransactionException[];
  transactions: TransactionEnriched[];
  transactionById: (id: string) => TransactionEnriched | undefined;
  onAddException: (transactionId: string, reason: string, notes?: string) => void;
  onResolve?: (exceptionId: string) => void;
  className?: string;
}

export function ExceptionsPanel({
  exceptions,
  transactions,
  transactionById,
  onAddException,
  onResolve,
  className,
}: ExceptionsPanelProps) {
  const [addingForId, setAddingForId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const list = Array.isArray(exceptions) ? exceptions : [];
  const openList = list.filter((e) => e.status === "open");

  const handleAdd = () => {
    if (addingForId && reason.trim()) {
      onAddException(addingForId, reason.trim(), notes.trim() || undefined);
      setAddingForId(null);
      setReason("");
      setNotes("");
    }
  };

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          Exceptions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ExceptionList
          exceptions={openList}
          transactionById={transactionById}
          onResolve={onResolve}
        />
        <AddExceptionInline
          transactions={transactions}
          addingForId={addingForId}
          reason={reason}
          notes={notes}
          onSetAddingFor={setAddingForId}
          onReasonChange={setReason}
          onNotesChange={setNotes}
          onSubmit={handleAdd}
          onCancel={() => {
            setAddingForId(null);
            setReason("");
            setNotes("");
          }}
        />
      </CardContent>
    </Card>
  );
}

function ExceptionList({
  exceptions,
  transactionById,
  onResolve,
}: {
  exceptions: TransactionException[];
  transactionById: (id: string) => TransactionEnriched | undefined;
  onResolve?: (id: string) => void;
}) {
  const list = exceptions ?? [];

  if (list.length === 0) {
    return (
      <div className="py-8 px-4 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground mb-3" aria-hidden />
        <p className="text-sm font-medium text-foreground mb-1">No open exceptions</p>
        <p className="text-sm text-muted-foreground">
          Transactions flagged for review will appear here. Use &quot;Quick add exception&quot; below to flag items.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {(list ?? []).map((ex) => {
        const tx = transactionById(ex.transactionId);
        return (
          <div
            key={ex.id}
            className="rounded-lg border border-white/[0.03] p-3 transition-colors hover:bg-secondary/50"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">
                  {tx?.merchant ?? "Unknown"} — {ex.reason}
                </p>
                {ex.notes && (
                  <p className="text-xs text-muted-foreground mt-1">{ex.notes}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(ex.createdAt)}
                  {ex.reviewedBy && ` · ${ex.reviewedBy}`}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="outline" className="text-xs">
                  {ex.status}
                </Badge>
                {onResolve && ex.status === "open" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={() => onResolve(ex.id)}
                  >
                    Resolve
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AddExceptionInline({
  transactions,
  addingForId,
  reason,
  notes,
  onSetAddingFor,
  onReasonChange,
  onNotesChange,
  onSubmit,
  onCancel,
}: {
  transactions: TransactionEnriched[];
  addingForId: string | null;
  reason: string;
  notes: string;
  onSetAddingFor: (id: string | null) => void;
  onReasonChange: (v: string) => void;
  onNotesChange: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const list = Array.isArray(transactions) ? transactions : [];
  const uncategorizedOrEnriched = list.filter(
    (t) => t.status === "enriched" || t.status === "ingested" || !t.category
  );

  if (addingForId) {
    const tx = list.find((t) => t.id === addingForId);
    return (
      <div className="rounded-lg border border-white/[0.03] p-4 space-y-3">
        <p className="text-sm font-medium">
          Add exception for: {tx?.merchant ?? addingForId}
        </p>
        <div className="space-y-2">
          <Label>Reason</Label>
          <Input
            placeholder="e.g. Unusual amount"
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Notes (optional)</Label>
          <Textarea
            placeholder="Additional context..."
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            rows={2}
          />
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={onSubmit} disabled={!reason.trim()}>
            Add
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm">Quick add exception</Label>
      <div className="flex flex-wrap gap-2">
        {(uncategorizedOrEnriched ?? []).slice(0, 5).map((t) => (
          <Button
            key={t.id}
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={() => onSetAddingFor(t.id)}
          >
            <Plus className="h-3 w-3" />
            {t.merchant ?? t.id}
          </Button>
        ))}
        {uncategorizedOrEnriched.length === 0 && (
          <p className="text-xs text-muted-foreground">
            All transactions are categorized or already have exceptions
          </p>
        )}
      </div>
    </div>
  );
}
