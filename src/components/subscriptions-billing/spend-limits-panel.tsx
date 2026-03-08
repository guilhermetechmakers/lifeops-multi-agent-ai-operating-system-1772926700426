/**
 * SpendLimitsPanel — Per-subscription spend limit controls, global spend cap, warning indicators.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DollarSign, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SubscriptionBilling } from "@/types/finance";

interface SpendLimitsPanelProps {
  subscriptions: SubscriptionBilling[];
  globalCap?: number | null;
  enforceGlobalCap?: boolean;
  isLoading?: boolean;
  onSetSpendLimit?: (subscriptionId: string, limit: number, currency: string) => void;
  onSetGlobalCap?: (cap: number) => void;
  onToggleEnforce?: (enforce: boolean) => void;
  onReset?: () => void;
  className?: string;
}

function formatCurrency(amount: number, currency: string): string {
  return `${currency} ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function SpendLimitsPanel({
  subscriptions,
  globalCap,
  enforceGlobalCap = false,
  isLoading,
  onSetSpendLimit,
  onSetGlobalCap,
  onToggleEnforce,
  onReset,
  className,
}: SpendLimitsPanelProps) {
  const [editingLimit, setEditingLimit] = useState<{ id: string; value: string } | null>(null);
  const [globalCapInput, setGlobalCapInput] = useState(globalCap?.toString() ?? "");

  const items = Array.isArray(subscriptions) ? subscriptions : [];
  const totalMonthly = items.reduce((sum, s) => sum + (s.amount ?? 0), 0);
  const cap = globalCap ?? 0;
  const isNearLimit = cap > 0 && totalMonthly >= cap * 0.9;
  const isOverLimit = cap > 0 && totalMonthly > cap;

  const handleSaveLimit = (subscriptionId: string, currency: string) => {
    const val = editingLimit?.id === subscriptionId ? parseFloat(editingLimit.value) : NaN;
    if (!isNaN(val) && val > 0 && onSetSpendLimit) {
      onSetSpendLimit(subscriptionId, val, currency);
      setEditingLimit(null);
    }
  };

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <DollarSign className="h-5 w-5" />
          Spend Limits
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Per-subscription and global caps
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-white/[0.03] p-3">
          <div className="flex items-center gap-2">
            <Switch
              checked={enforceGlobalCap}
              onCheckedChange={onToggleEnforce}
              aria-label="Enforce global cap"
            />
            <Label className="text-sm">Enforce global cap</Label>
          </div>
        </div>

        {enforceGlobalCap && (
          <div className="space-y-2">
            <Label className="text-sm">Global cap (USD)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min={0}
                step={10}
                value={globalCapInput}
                onChange={(e) => setGlobalCapInput(e.target.value)}
                className="max-w-[140px]"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const v = parseFloat(globalCapInput);
                  if (!isNaN(v) && v >= 0) onSetGlobalCap?.(v);
                }}
              >
                Set
              </Button>
            </div>
          </div>
        )}

        {(isNearLimit || isOverLimit) && (
          <div
            className={cn(
              "flex items-center gap-2 rounded-lg p-3 text-sm",
              isOverLimit ? "bg-destructive/10 text-destructive" : "bg-amber/10 text-amber"
            )}
          >
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              {isOverLimit
                ? `Total spend (${formatCurrency(totalMonthly, "USD")}) exceeds global cap (${formatCurrency(cap, "USD")})`
                : `Approaching global cap: ${formatCurrency(totalMonthly, "USD")} of ${formatCurrency(cap, "USD")}`}
            </span>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-sm">Per-subscription limits</Label>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-secondary" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {items.filter((s) => s.status === "active").map((sub) => {
                const isEditing = editingLimit?.id === sub.id;
                const limit = sub.spendLimit ?? 0;
                const isNear = limit > 0 && (sub.amount ?? 0) >= limit * 0.9;
                return (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between rounded-lg border border-white/[0.03] p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{sub.vendor ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(sub.amount ?? 0, sub.currency ?? "USD")} / {formatCurrency(limit || 0, sub.currency ?? "USD")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isNear && limit > 0 && (
                        <AlertTriangle className="h-4 w-4 text-amber shrink-0" />
                      )}
                      {isEditing ? (
                        <>
                          <Input
                            type="number"
                            min={0}
                            step={1}
                            className="w-24 h-8"
                            value={editingLimit?.value ?? ""}
                            onChange={(e) =>
                              setEditingLimit({ id: sub.id, value: e.target.value })
                            }
                          />
                          <Button
                            size="sm"
                            className="h-8"
                            onClick={() => handleSaveLimit(sub.id, sub.currency ?? "USD")}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8"
                            onClick={() => setEditingLimit(null)}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8"
                          onClick={() =>
                            setEditingLimit({
                              id: sub.id,
                              value: (sub.spendLimit ?? 0).toString() || "",
                            })
                          }
                        >
                          Set limit
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {onReset && (
          <Button size="sm" variant="ghost" className="w-full text-muted-foreground" onClick={onReset}>
            Reset / Recalculate
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
