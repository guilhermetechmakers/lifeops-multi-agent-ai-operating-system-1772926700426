/**
 * ReconciliationToolkit — Match transactions to subscriptions/invoices.
 * Resolve conflicts with proposed mappings.
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
import { Link2, Check } from "lucide-react";
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

  const txList = Array.isArray(transactions) ? transactions : [];
  const subList = Array.isArray(subscriptions) ? subscriptions : [];
  const unlinked = txList.filter(
    (t) => !t.subscriptionId && !t.reconciliationId && (t.isSubscription ?? false)
  );

  const selectedTx = selectedTxId
    ? txList.find((t) => t.id === selectedTxId)
    : null;

  const handleMatch = () => {
    if (selectedTxId && selectedSubId) {
      onMatch(selectedTxId, selectedSubId, null);
      setSelectedTxId(null);
      setSelectedSubId(null);
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
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Subscription (optional)
            </label>
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
          <Button
            size="sm"
            className="gap-1"
            onClick={handleMatch}
            disabled={!selectedTxId || !selectedSubId}
          >
            <Check className="h-4 w-4" />
            Link
          </Button>
        </div>
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
