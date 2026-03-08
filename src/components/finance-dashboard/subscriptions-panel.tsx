/**
 * SubscriptionsPanel — User-owned and tracked subscriptions.
 * Churn risk indicators, spend limit warnings, Connect Billing Processors UI.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, AlertTriangle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Subscription } from "@/types/finance";
import { ConnectBillingProcessorModal } from "./connect-billing-processor-modal";

function formatCurrency(amount: number, currency: string): string {
  return `${currency} ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

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

function getChurnRiskBadge(score: number) {
  if (score >= 0.5) return { label: "High risk", variant: "destructive" as const };
  if (score >= 0.25) return { label: "Medium risk", variant: "warning" as const };
  return null;
}

interface SubscriptionsPanelProps {
  subscriptions: Subscription[];
  isLoading?: boolean;
  onConnect?: () => void;
  className?: string;
}

export function SubscriptionsPanel({
  subscriptions,
  isLoading,
  onConnect,
  className,
}: SubscriptionsPanelProps) {
  const [connectModalOpen, setConnectModalOpen] = useState(false);

  const items = Array.isArray(subscriptions) ? subscriptions : [];

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <CreditCard className="h-5 w-5" />
          Subscriptions
        </CardTitle>
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1"
          onClick={() => setConnectModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Connect
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-secondary" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center">
            <CreditCard className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">No subscriptions yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Connect a billing processor to import
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-4"
              onClick={() => setConnectModalOpen(true)}
            >
              Connect Billing Processor
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((sub) => {
              const churnBadge = getChurnRiskBadge(sub.churnRiskScore ?? 0);
              return (
                <Link
                  key={sub.id}
                  to="/dashboard/finance/subscriptions"
                  className={cn(
                    "flex items-center justify-between rounded-lg border border-white/[0.03] p-3 transition-all duration-200 hover:bg-secondary/50 hover:-translate-y-0.5",
                    sub.status === "canceled" && "opacity-60"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{sub.provider}</span>
                      {churnBadge && (
                        <Badge variant={churnBadge.variant} className="text-[10px]">
                          {churnBadge.label}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {sub.plan} · Next: {formatDate(sub.nextBillingDate ?? "")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-medium">
                      {formatCurrency(sub.amount ?? 0, sub.currency ?? "USD")}
                    </span>
                    {sub.status === "canceled" && (
                      <AlertTriangle className="h-4 w-4 text-amber" />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
      <ConnectBillingProcessorModal
        open={connectModalOpen}
        onOpenChange={setConnectModalOpen}
        onSuccess={() => {
          onConnect?.();
          setConnectModalOpen(false);
        }}
      />
    </Card>
  );
}
