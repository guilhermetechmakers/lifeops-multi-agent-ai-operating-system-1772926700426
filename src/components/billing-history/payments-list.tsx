/**
 * PaymentsList — date, amount, method, status, last4, receipt link.
 */

import { format } from "date-fns";
import { CreditCard, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export interface PaymentsListProps {
  payments: Payment[];
  onReceiptDownload?: (paymentId: string) => void;
  className?: string;
}

export function PaymentsList({
  payments,
  onReceiptDownload,
  className,
}: PaymentsListProps) {
  const safePayments = payments ?? [];

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <CreditCard className="h-5 w-5 text-muted-foreground" />
          Payments
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Payment records and receipt downloads
        </p>
      </CardHeader>
      <CardContent>
        {safePayments.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No payments yet</p>
        ) : (
          <ul className="space-y-2" role="list">
            {safePayments.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/[0.03] bg-secondary/30 px-4 py-3 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {p.currency ?? "USD"} {(p.amount ?? 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {p.date ? format(new Date(p.date), "MMM d, yyyy") : "—"}
                      {p.last4 ? ` · ··· ${p.last4}` : ""} · {(p.method ?? "card").toLowerCase()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={paymentStatusVariant(p.status)}>
                    {p.status ?? "—"}
                  </Badge>
                  {(p.receipt_url || onReceiptDownload) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1"
                      onClick={() => onReceiptDownload?.(p.id)}
                      asChild={!!p.receipt_url && !onReceiptDownload}
                    >
                      {p.receipt_url && !onReceiptDownload ? (
                        <a href={p.receipt_url} target="_blank" rel="noopener noreferrer" className="gap-1">
                          <Download className="h-4 w-4" />
                          Receipt
                        </a>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          Receipt
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
