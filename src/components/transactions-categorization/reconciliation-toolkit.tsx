/**
 * ReconciliationToolkit — Match transactions to subscriptions/invoices.
 * Resolve conflicts with proposed mappings.
 */

import { useState, useMemo } from "react";
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
import { Link2, Check, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TransactionEnriched } from "@/types/finance";

function formatAmount(amount: number): string {
  return `$${Math.abs(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export interface ReconciliationToolkitProps {
  transactions: TransactionEnriched[];
  subscriptions: Array<{ id: string; provider: string; amount: number }>;
  onMatch: (
    transactionId: string,
    subscriptionId?: string | null,
    invoiceId?: string | null
  ) => void;
  className?: string;
}

export function ReconciliationToolkit({
  transactions,
  subscriptions,
  onMatch,
  className,
}: ReconciliationToolkitProps) {
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [invoiceId, setInvoiceId] = useState("");

  const txList = Array.isArray(transactions) ? transactions : [];
  const subList = Array.isArray(subscriptions) ? subscriptions : [];
  const unlinked = txList.filter(
    (t) => !t.subscriptionId && !t.reconciliationId && (t.isSubscription ?? false)
  );

  const selectedTx = selectedTxId
    ? txList.find((t) => t.id === selectedTxId)
    : null;
  const selectedSub = selectedSubId
    ? subList.find((s) => s.id === selectedSubId)
    : null;

  const amountMismatch = useMemo(() => {
    if (!selectedTx || !selectedSub) return false;
    const txAmount = Math.abs(selectedTx.amount ?? 0);
    const subAmount = selectedSub.amount ?? 0;
    return Math.abs(txAmount - subAmount) > 0.01;
  }, [selectedTx, selectedSub]);

  const handleMatch = () => {
    if (selectedTxId) {
      onMatch(
        selectedTxId,
        selectedSubId ?? null,
        invoiceId.trim() ? invoiceId.trim() : null
      );
      setSelectedTxId(null);
      setSelectedSubId(null);
      setInvoiceId("");
    }
  };

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Link2 className="h-5 w-5 shrink-0" />
          Match & Reconcile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Link transactions to subscriptions or invoices for reconciliation.
        </p>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Transaction
            </label>
            <Select
              value={selectedTxId ?? ""}
              onValueChange={(v) => setSelectedTxId(v || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select transaction" />
              </SelectTrigger>
              <SelectContent>
                {(unlinked.length > 0 ? unlinked : txList.slice(0, 10)).map(
                  (t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.merchant ?? "—"} {formatAmount(t.amount ?? 0)}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground block mb-1">
              Subscription (optional)
            </Label>
            <Select
              value={selectedSubId ?? ""}
              onValueChange={(v) => setSelectedSubId(v || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select subscription" />
              </SelectTrigger>
              <SelectContent>
                {subList.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.provider} — {formatAmount(s.amount)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground block mb-1">
              Invoice ID (optional)
            </Label>
            <Input
              placeholder="e.g. inv_xxx"
              value={invoiceId}
              onChange={(e) => setInvoiceId(e.target.value)}
              className="bg-secondary/30 border-white/[0.03]"
            />
          </div>
          {amountMismatch && (
            <div className="flex items-start gap-2 rounded-lg border border-amber/30 bg-amber/5 p-3 text-sm">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Amount mismatch</p>
                <p className="text-muted-foreground text-xs mt-1">
                  Transaction amount ({formatAmount(selectedTx?.amount ?? 0)}) does not match
                  subscription amount ({selectedSub ? formatAmount(selectedSub.amount) : "—"}).
                  Confirm the link is correct or choose a different subscription.
                </p>
              </div>
            </div>
          )}
          <Button
            size="sm"
            className="gap-1"
            onClick={handleMatch}
            disabled={!selectedTxId}
          >
            <Check className="h-4 w-4" />
            Link
          </Button>
        </div>
        {unlinked.length === 0 && txList.length > 0 && (
          <div className="py-6 px-4 text-center rounded-lg border border-white/[0.03] bg-secondary/20">
            <Link2 className="mx-auto h-10 w-10 text-muted-foreground mb-2" aria-hidden />
            <p className="text-sm font-medium text-foreground mb-1">No unlinked subscription transactions</p>
            <p className="text-xs text-muted-foreground">
              Transactions marked as subscription-related that aren’t linked yet will appear here.
            </p>
          </div>
        )}
        {selectedTx && (
          <div className="rounded-lg border border-white/[0.03] p-3 text-sm">
            <p className="font-medium">{selectedTx.merchant ?? "—"}</p>
            <p className="text-muted-foreground text-xs">
              Amount: {formatAmount(selectedTx.amount ?? 0)} ·{" "}
              {selectedTx.date ? new Date(selectedTx.date).toLocaleDateString() : ""}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
