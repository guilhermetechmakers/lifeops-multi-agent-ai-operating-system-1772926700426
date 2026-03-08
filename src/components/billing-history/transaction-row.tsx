/**
 * TransactionRow — single payment/transaction row for tables or lists.
 * Design: dense data, status badge, receipt action; guarded props.
 */

import { format } from "date-fns";
import { CreditCard, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Payment, PaymentStatus } from "@/types/billing-history";

function paymentStatusVariant(s: PaymentStatus): "default" | "secondary" | "destructive" | "outline" {
  switch (s) {
    case "succeeded":
      return "secondary";
    case "pending":
      return "default";
    case "failed":
    case "refunded":
      return "destructive";
    default:
      return "outline";
  }
}

export interface TransactionRowProps {
  payment: Payment;
  onReceiptDownload?: (paymentId: string) => void;
  className?: string;
}

export function TransactionRow({
  payment,
  onReceiptDownload,
  className,
}: TransactionRowProps) {
  const p = payment ?? {};
  const currency = p.currency ?? "USD";
  const amount = p.amount ?? 0;
  const date = p.date ? format(new Date(p.date), "MMM d, yyyy") : "—";
  const method = (p.method ?? "card").toLowerCase();
  const last4 = p.last4 ? `···· ${p.last4}` : "";

  return (
    <li
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/[0.03] bg-secondary/30 px-4 py-3 transition-colors hover:bg-secondary/50 min-h-[44px]",
        className
      )}
      role="listitem"
    >
      <div className="flex items-center gap-3 min-w-0">
        <CreditCard className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        <div>
          <p className="text-sm font-medium text-foreground">
            {currency} {amount.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground">
            {date}
            {last4 ? ` · ${last4}` : ""} · {method}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={paymentStatusVariant(p.status ?? "pending")}>
          {p.status ?? "—"}
        </Badge>
        {(p.receipt_url ?? onReceiptDownload) && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1"
            onClick={() => onReceiptDownload?.(p.id)}
            asChild={!!p.receipt_url && !onReceiptDownload}
          >
            {p.receipt_url && !onReceiptDownload ? (
              <a
                href={p.receipt_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1"
              >
                <Download className="h-4 w-4" aria-hidden />
                Receipt
              </a>
            ) : (
              <>
                <Download className="h-4 w-4" aria-hidden />
                Receipt
              </>
            )}
          </Button>
        )}
      </div>
    </li>
  );
}
