/**
 * React Query hooks for Personas.
 * All array data uses safeArray; responses validated before use.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { personasApi } from "@/api/personas";
import * as mock from "@/api/personas-mock";
import { safeArray } from "@/lib/api";
import type {
  Persona,
  PersonaListParams,
  PersonaListResponse,
} from "@/types/templates-personas";

const USE_MOCK =
  !import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_USE_MOCK_PERSONAS === "true";

const keys = {
  list: (params: PersonaListParams) => ["personas", "list", params] as const,
  detail: (id: string) => ["personas", "detail", id] as const,
};

export function usePersonas(params: PersonaListParams = {}) {
  const query = useQuery({
    queryKey: keys.list(params),
    queryFn: () =>
      USE_MOCK ? mock.mockGetPersonas(params) : personasApi.getList(params),
    staleTime: 60 * 1000,
  });
  const data = query.data as PersonaListResponse | undefined;
  const items = safeArray<Persona>(data?.data ?? []);
  return { ...query, items, count: data?.count ?? 0 };
}

export function usePersona(id: string | null) {
  return useQuery({
    queryKey: keys.detail(id ?? ""),
    queryFn: () =>
      id
        ? USE_MOCK
          ? mock.mockGetPersona(id)
          : personasApi.get(id)
        : Promise.reject(new Error("No id")),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
  });
}

export function useCreatePersona() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Persona>) =>
      USE_MOCK ? mock.mockCreatePersona(payload) : personasApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["personas"] });
      toast.success("Persona created");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to create persona");
    },
  });
}

export function useUpdatePersona() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Persona> }) =>
      USE_MOCK ? mock.mockUpdatePersona(id, payload) : personasApi.update(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["personas"] });
      qc.invalidateQueries({ queryKey: keys.detail(id) });
      toast.success("Persona updated");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update persona");
    },
  });
}

export function useDeletePersona() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      USE_MOCK ? mock.mockDeletePersona(id) : personasApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["personas"] });
      toast.success("Persona deleted");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete persona");
    },
  });
}
