/**
 * SubscriptionsListPanel — List of subscriptions with vendor, cadence, next charge, status, amount, churn risk.
 * Actions: edit, pause/resume, cancel, view details.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CreditCard, Search, Plus, Pause, Play, XCircle, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SubscriptionBilling } from "@/types/finance";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SubscriptionsListPanelProps {
  subscriptions: SubscriptionBilling[];
  isLoading?: boolean;
  onEdit?: (sub: SubscriptionBilling) => void;
  onPause?: (sub: SubscriptionBilling) => void;
  onResume?: (sub: SubscriptionBilling) => void;
  onCancel?: (sub: SubscriptionBilling) => void;
  onAdd?: () => void;
  className?: string;
}

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

function getChurnRiskBadge(score: number | null | undefined) {
  if (score == null) return null;
  if (score >= 0.5) return { label: "High risk", variant: "destructive" as const };
  if (score >= 0.25) return { label: "Medium risk", variant: "warning" as const };
  return null;
}

export function SubscriptionsListPanel({
  subscriptions,
  isLoading,
  onEdit,
  onPause,
  onResume,
  onCancel,
  onAdd,
  className,
}: SubscriptionsListPanelProps) {
  const [search, setSearch] = useState("");
  const items = Array.isArray(subscriptions) ? subscriptions : [];
  const filtered = search.trim()
    ? items.filter(
        (s) =>
          (s.vendor ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (s.cadence ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : items;

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-base font-semibold">Subscriptions</CardTitle>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search vendor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
              aria-label="Search subscriptions"
            />
          </div>
          <Button size="sm" variant="outline" className="h-9 gap-1" onClick={onAdd}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-secondary" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">No subscriptions yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Add a subscription or connect a billing processor to import
            </p>
            <Button size="sm" variant="outline" className="mt-4" onClick={onAdd}>
              Add Subscription
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((sub) => {
              const churnBadge = getChurnRiskBadge(sub.churnRiskScore);
              return (
                <div
                  key={sub.id}
                  className={cn(
                    "flex items-center justify-between rounded-lg border border-white/[0.03] p-4 transition-all duration-200 hover:bg-secondary/50 hover:shadow-card-hover",
                    sub.status === "canceled" && "opacity-60"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{sub.vendor ?? "—"}</span>
                        {churnBadge && (
                          <Badge variant={churnBadge.variant} className="text-[10px]">
                            {churnBadge.label}
                          </Badge>
                        )}
                        {sub.status === "canceled" && (
                          <Badge variant="outline" className="text-[10px]">
                            Canceled
                          </Badge>
                        )}
                        {sub.status === "paused" && (
                          <Badge variant="secondary" className="text-[10px]">
                            Paused
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {sub.cadence ?? "—"} · Next: {formatDate(sub.nextChargeDate ?? sub.startDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-sm font-medium">
                      {formatCurrency(sub.amount ?? 0, sub.currency ?? "USD")}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" aria-label="Actions">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => onEdit?.(sub)}>Edit</DropdownMenuItem>
                        {sub.status === "active" && (
                          <DropdownMenuItem onClick={() => onPause?.(sub)}>
                            <Pause className="h-4 w-4 mr-2" />
                            Pause
                          </DropdownMenuItem>
                        )}
                        {sub.status === "paused" && (
                          <DropdownMenuItem onClick={() => onResume?.(sub)}>
                            <Play className="h-4 w-4 mr-2" />
                            Resume
                          </DropdownMenuItem>
                        )}
                        {sub.status !== "canceled" && (
                          <DropdownMenuItem
                            onClick={() => onCancel?.(sub)}
                            className="text-destructive focus:text-destructive"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
