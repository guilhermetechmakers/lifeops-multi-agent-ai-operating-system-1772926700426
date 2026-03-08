/**
 * Subscriptions & Billing page — Manage user-owned/tracked subscriptions.
 * Churn detection, spend limits, connect billing processors.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CreditCard, Plus, AlertTriangle, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubscriptions, useConnectBillingProcessor } from "@/hooks/use-finance";
import { ConnectBillingProcessorModal } from "@/components/finance-dashboard";

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

export default function FinanceSubscriptionsPage() {
  const { items: subscriptions, isLoading } = useSubscriptions();
  const connectProcessor = useConnectBillingProcessor();
  const [search, setSearch] = useState("");
  const [connectModalOpen, setConnectModalOpen] = useState(false);

  const items = Array.isArray(subscriptions) ? subscriptions : [];
  const filtered = search.trim()
    ? items.filter(
        (s) =>
          (s.provider ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (s.plan ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : items;

  const totalMonthly = items.reduce((sum, s) => sum + (s.amount ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Subscriptions & Billing</h2>
        <p className="text-sm text-muted-foreground">
          Manage subscriptions, churn risk, spend limits, billing processors
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/[0.03] bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {items.filter((s) => s.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/[0.03] bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly spend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(totalMonthly, "USD")}
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/[0.03] bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Churn risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {items.filter((s) => (s.churnRiskScore ?? 0) >= 0.25).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">at-risk subscriptions</p>
          </CardContent>
        </Card>
        <Card className="border-white/[0.03] bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Processors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={() => setConnectModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Connect
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/[0.03] bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">Subscriptions</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search provider, plan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-9 gap-1"
              onClick={() => setConnectModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Connect processor
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
              {filtered.map((sub) => {
                const churnBadge = getChurnRiskBadge(sub.churnRiskScore ?? 0);
                return (
                  <div
                    key={sub.id}
                    className={cn(
                      "flex items-center justify-between rounded-lg border border-white/[0.03] p-4 transition-all duration-200 hover:bg-secondary/50",
                      sub.status === "canceled" && "opacity-60"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{sub.provider ?? "—"}</span>
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
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {sub.plan ?? "—"} · Next: {formatDate(sub.nextBillingDate ?? "")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium">
                        {formatCurrency(sub.amount ?? 0, sub.currency ?? "USD")}
                      </span>
                      {sub.status === "canceled" && (
                        <AlertTriangle className="h-4 w-4 text-amber" />
                      )}
                      <Button size="sm" variant="ghost" className="h-8">
                        Manage
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <ConnectBillingProcessorModal
        open={connectModalOpen}
        onOpenChange={setConnectModalOpen}
        onSuccess={(provider) => connectProcessor.mutate({ provider, credentials: {} })}
      />
    </div>
  );
}
