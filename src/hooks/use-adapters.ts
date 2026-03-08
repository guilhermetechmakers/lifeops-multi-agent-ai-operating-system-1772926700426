/**
 * React Query hooks for Adapters API: list, CRUD, test, run, rotate, telemetry, health.
 * All arrays guarded; useState defaults to [].
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adaptersApi } from "@/api/adapters";
import { adaptersMockApi } from "@/api/adapters-mock";
import { safeArray } from "@/lib/api";
import type {
  AdapterInstance,
  CreateAdapterInput,
  UpdateAdapterInput,
  RunAdapterInput,
  TelemetryEvent,
  HealthStatus,
} from "@/types/adapters";

const USE_MOCK = !import.meta.env.VITE_API_URL;

const adapterKeys = {
  all: ["adapters"] as const,
  list: () => ["adapters", "list"] as const,
  detail: (id: string | null) => ["adapters", "detail", id] as const,
  telemetry: () => ["adapters", "telemetry"] as const,
  health: () => ["adapters", "health"] as const,
};

const api = USE_MOCK ? adaptersMockApi : adaptersApi;

export function useAdapters() {
  const query = useQuery({
    queryKey: adapterKeys.list(),
    queryFn: () => api.list(),
  });
  const items = safeArray<AdapterInstance>(query.data);
  return { ...query, items };
}

export function useAdapter(id: string | null) {
  const query = useQuery({
    queryKey: adapterKeys.detail(id),
    queryFn: () => (id ? api.get(id) : Promise.resolve(null)),
    enabled: !!id,
  });
  const adapter = query.data ?? null;
  return { ...query, adapter };
}

export function useCreateAdapter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAdapterInput) => api.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adapterKeys.list() });
      queryClient.invalidateQueries({ queryKey: adapterKeys.health() });
      toast.success("Adapter created");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to create adapter");
    },
  });
}

export function useUpdateAdapter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAdapterInput }) =>
      api.update(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: adapterKeys.list() });
      queryClient.invalidateQueries({ queryKey: adapterKeys.detail(id) });
      toast.success("Adapter updated");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update adapter");
    },
  });
}

export function useDeleteAdapter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adapterKeys.list() });
      queryClient.invalidateQueries({ queryKey: adapterKeys.health() });
      toast.success("Adapter removed");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to remove adapter");
    },
  });
}

export function useTestAdapter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.test(id),
    onSuccess: (result, id) => {
      queryClient.invalidateQueries({ queryKey: adapterKeys.list() });
      queryClient.invalidateQueries({ queryKey: adapterKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: adapterKeys.telemetry() });
      if (result?.ok) {
        toast.success("Connection successful");
      } else {
        toast.error(result?.message ?? "Connection failed");
      }
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Test failed");
    },
  });
}

export function useRunAdapter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RunAdapterInput["payload"] }) =>
      api.run(id, { payload }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: adapterKeys.telemetry() });
      if (result?.status === "success") {
        toast.success("Run completed");
      } else {
        toast.error(result?.error ?? "Run failed");
      }
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Run failed");
    },
  });
}

export function useRotateCredential() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.rotateCredential(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: adapterKeys.list() });
      queryClient.invalidateQueries({ queryKey: adapterKeys.detail(id) });
      toast.success("Credentials rotated. Reconnect if needed.");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Rotation failed");
    },
  });
}

export function useAdaptersTelemetry() {
  const query = useQuery({
    queryKey: adapterKeys.telemetry(),
    queryFn: () => api.getTelemetry(),
  });
  const items = safeArray<TelemetryEvent>(query.data);
  return { ...query, items };
}

export function useAdaptersHealth() {
  const query = useQuery({
    queryKey: adapterKeys.health(),
    queryFn: () => api.getHealth(),
  });
  const items = safeArray<HealthStatus>(query.data);
  return { ...query, items };
}
