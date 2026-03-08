/**
 * Billing & Payments hooks — plans, subscriptions, usage, invoices, admin.
 * All array/object access guarded; useState<Type[]>([]) for list state.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as billingApi from "@/api/billing";

const keys = {
  plans: () => ["billing", "plans"] as const,
  subscription: (id: string) => ["billing", "subscription", id] as const,
  usageSummary: (subId: string, period?: string) =>
    ["billing", "usage", subId, period] as const,
  invoice: (id: string) => ["billing", "invoice", id] as const,
  enterprise: () => ["admin", "enterprise", "settings"] as const,
  integrations: () => ["admin", "billing", "integrations"] as const,
  complianceReports: () => ["admin", "compliance", "reports"] as const,
};

export function usePlans() {
  const query = useQuery({
    queryKey: keys.plans(),
    queryFn: () => billingApi.getPlans(),
    staleTime: 5 * 60 * 1000,
  });
  const items = Array.isArray(query.data) ? query.data : [];
  return { ...query, plans: items, items };
}

export function useSubscription(id: string | null) {
  const query = useQuery({
    queryKey: keys.subscription(id ?? ""),
    queryFn: () => (id ? billingApi.getSubscription(id) : Promise.resolve(null)),
    enabled: !!id,
    staleTime: 60 * 1000,
  });
  return { ...query, subscription: query.data ?? null };
}

export function useUsageSummary(subscriptionId: string | null, period?: string) {
  const query = useQuery({
    queryKey: keys.usageSummary(subscriptionId ?? "", period),
    queryFn: () =>
      subscriptionId
        ? billingApi.getUsageSummary(subscriptionId, period)
        : Promise.resolve(null),
    enabled: !!subscriptionId,
    staleTime: 60 * 1000,
  });
  return { ...query, summary: query.data ?? null };
}

export function useInvoice(invoiceId: string | null) {
  const query = useQuery({
    queryKey: keys.invoice(invoiceId ?? ""),
    queryFn: () => (invoiceId ? billingApi.getInvoice(invoiceId) : Promise.resolve(null)),
    enabled: !!invoiceId,
    staleTime: 30 * 1000,
  });
  return { ...query, invoice: query.data ?? null };
}

export function useCreateSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof billingApi.createOrUpdateSubscription>[0]) =>
      billingApi.createOrUpdateSubscription(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["billing"] });
      toast.success("Subscription updated");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Subscription update failed"),
  });
}

export function useChangePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      subscriptionId,
      planId,
      proration,
    }: {
      subscriptionId: string;
      planId: string;
      proration?: boolean;
    }) => billingApi.changePlan(subscriptionId, { planId, proration }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["billing"] });
      toast.success("Plan changed");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Plan change failed"),
  });
}

export function useCancelSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (subscriptionId: string) => billingApi.cancelSubscription(subscriptionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["billing"] });
      toast.success("Subscription canceled");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Cancel failed"),
  });
}

export function useSubmitUsage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof billingApi.submitUsage>[0]) =>
      billingApi.submitUsage(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["billing", "usage"] });
      toast.success("Usage recorded");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Usage submit failed"),
  });
}

export function useEnterpriseSettings() {
  const query = useQuery({
    queryKey: keys.enterprise(),
    queryFn: () => billingApi.getEnterpriseSettings(),
    staleTime: 60 * 1000,
  });
  return { ...query, enterprise: query.data ?? null };
}

export function useComplianceReports() {
  const query = useQuery({
    queryKey: keys.complianceReports(),
    queryFn: () => billingApi.getComplianceReports(),
    staleTime: 60 * 1000,
  });
  const items = Array.isArray(query.data) ? query.data : [];
  return { ...query, reports: items, items };
}
