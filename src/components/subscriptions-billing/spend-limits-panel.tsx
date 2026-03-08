/**
 * SpendLimitsPanel — Per-subscription spend limits, global cap.
 * Warning indicators when approaching limits; toggles to enforce; reset/recalculate.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DollarSign, AlertTriangle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SubscriptionBilling } from "@/types/finance";

export interface SpendLimitsPanelProps {
  subscriptions: SubscriptionBilling[];
  globalCap?: number | null;
  enforceCaps?: boolean;
  isLoading?: boolean;
  onSetPerSubscriptionLimit?: (subscriptionId: string, limit: number) => void;
  onSetGlobalCap?: (cap: number) => void;
  onToggleEnforce?: (enforce: boolean) => void;
  onReset?: () => void;
  className?: string;
}

export function SpendLimitsPanel({
  subscriptions,
  globalCap = null,
  enforceCaps = false,
  isLoading,
  onSetPerSubscriptionLimit,
  onSetGlobalCap,
  onToggleEnforce,
  onReset,
  className,
}: SpendLimitsPanelProps) {
  const [localGlobalCap, setLocalGlobalCap] = useState<string>(
    globalCap != null ? String(globalCap) : ""
  );
  const [editingLimitId, setEditingLimitId] = useState<string | null>(null);
  const [editingLimitValue, setEditingLimitValue] = useState<string>("");

  const items = Array.isArray(subscriptions) ? subscriptions : [];
  const totalMonthly = items.reduce((sum, s) => sum + (s.amount ?? 0), 0);
  const capNum = globalCap ?? 0;
  const isNearCap = capNum > 0 && totalMonthly >= capNum * 0.9;
  const isOverCap = capNum > 0 && totalMonthly > capNum;

  const handleSaveLimit = (subId: string) => {
    const val = parseFloat(editingLimitValue);
    if (!Number.isNaN(val) && val > 0) {
      onSetPerSubscriptionLimit?.(subId, val);
      setEditingLimitId(null);
      setEditingLimitValue("");
    }
  };

  const handleSaveGlobalCap = () => {
    const val = parseFloat(localGlobalCap);
    if (!Number.isNaN(val) && val >= 0) {
      onSetGlobalCap?.(val);
    }
  };

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <DollarSign className="h-5 w-5 text-muted-foreground" />
          Spend limits
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 gap-1 text-muted-foreground"
            onClick={onReset}
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Global cap */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="global-cap">Global monthly cap</Label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Enforce caps</span>
              <Switch
                checked={enforceCaps}
                onCheckedChange={onToggleEnforce}
                aria-label="Enforce spend caps"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              id="global-cap"
              type="number"
              step="1"
              min="0"
              placeholder="e.g. 500"
              value={localGlobalCap}
              onChange={(e) => setLocalGlobalCap(e.target.value)}
              onBlur={handleSaveGlobalCap}
              className={cn(
                "flex-1",
                isOverCap && "border-destructive"
              )}
            />
            <Button size="sm" variant="outline" onClick={handleSaveGlobalCap}>
              Set
            </Button>
          </div>
          {isNearCap && !isOverCap && (
            <p className="flex items-center gap-1.5 text-xs text-amber">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Approaching limit ({totalMonthly.toFixed(0)} / {capNum})
            </p>
          )}
          {isOverCap && (
            <p className="flex items-center gap-1.5 text-xs text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Over limit ({totalMonthly.toFixed(0)} / {capNum})
            </p>
          )}
        </div>

        {/* Per-subscription limits */}
        <div className="space-y-2">
          <Label className="text-muted-foreground">Per-subscription limits</Label>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded-lg bg-secondary"
                  aria-hidden
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No subscriptions to configure
            </p>
          ) : (
            <div className="space-y-2">
              {items.map((sub) => {
                const isEditing = editingLimitId === sub.id;
                const limit = sub.spendLimit ?? sub.amount ?? 0;
                const isOver = limit > 0 && (sub.amount ?? 0) > limit;
                return (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between rounded-lg border border-white/[0.03] p-3"
                  >
                    <span className="text-sm font-medium truncate">
                      {sub.vendor ?? "—"}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      {isEditing ? (
                        <>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            className="w-24 h-8 text-sm"
                            value={editingLimitValue}
                            onChange={(e) =>
                              setEditingLimitValue(e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter")
                                handleSaveLimit(sub.id);
                              if (e.key === "Escape") {
                                setEditingLimitId(null);
                                setEditingLimitValue("");
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8"
                            onClick={() => handleSaveLimit(sub.id)}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8"
                            onClick={() => {
                              setEditingLimitId(null);
                              setEditingLimitValue("");
                            }}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          {isOver && (
                            <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                          )}
                          <span className="text-sm text-muted-foreground">
                            {sub.currency ?? "USD"} {limit.toFixed(2)}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={() => {
                              setEditingLimitId(sub.id);
                              setEditingLimitValue(String(limit));
                            }}
                          >
                            Edit
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
