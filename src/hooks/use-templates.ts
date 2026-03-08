/**
 * React Query hooks for Agent Templates.
 * All array data uses safeArray; responses validated before use.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { templatesApi } from "@/api/templates";
import * as mock from "@/api/templates-mock";
import { safeArray } from "@/lib/api";
import type {
  AgentTemplate,
  TemplateListParams,
  TemplateListResponse,
} from "@/types/templates-personas";

const USE_MOCK =
  !import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_USE_MOCK_TEMPLATES === "true";

const keys = {
  list: (params: TemplateListParams) => ["templates", "list", params] as const,
  detail: (id: string) => ["templates", "detail", id] as const,
  versions: (id: string) => ["templates", "versions", id] as const,
};

export function useTemplates(params: TemplateListParams = {}) {
  const query = useQuery({
    queryKey: keys.list(params),
    queryFn: () =>
      USE_MOCK ? mock.mockGetTemplates(params) : templatesApi.getList(params),
    staleTime: 60 * 1000,
  });
  const data = query.data as TemplateListResponse | undefined;
  const items = safeArray<AgentTemplate>(data?.data ?? []);
  return { ...query, items, count: data?.count ?? 0 };
}

export function useTemplate(id: string | null) {
  return useQuery({
    queryKey: keys.detail(id ?? ""),
    queryFn: () =>
      id
        ? USE_MOCK
          ? mock.mockGetTemplate(id)
          : templatesApi.get(id)
        : Promise.reject(new Error("No id")),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
  });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<AgentTemplate>) =>
      USE_MOCK ? mock.mockCreateTemplate(payload) : templatesApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["templates"] });
      toast.success("Template created");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to create template");
    },
  });
}

export function useUpdateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<AgentTemplate> }) =>
      USE_MOCK ? mock.mockUpdateTemplate(id, payload) : templatesApi.update(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["templates"] });
      qc.invalidateQueries({ queryKey: keys.detail(id) });
      toast.success("Template updated");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update template");
    },
  });
}

export function useDeleteTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      USE_MOCK ? mock.mockDeleteTemplate(id) : templatesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["templates"] });
      toast.success("Template deleted");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete template");
    },
  });
}

export function useTemplateVersions(id: string | null) {
  return useQuery({
    queryKey: keys.versions(id ?? ""),
    queryFn: () =>
      id
        ? USE_MOCK
          ? mock.mockGetTemplateVersions(id)
          : templatesApi.getVersions(id)
        : Promise.reject(new Error("No id")),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
  });
}

export function usePublishTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      USE_MOCK ? mock.mockPublishTemplate(id) : templatesApi.publish(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["templates"] });
      qc.invalidateQueries({ queryKey: keys.detail(id) });
      toast.success("Template published");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to publish template");
    },
  });
}

export function useTestTemplate() {
  return useMutation({
    mutationFn: ({ id, inputPayload }: { id: string; inputPayload?: Record<string, unknown> }) =>
      USE_MOCK ? mock.mockTestTemplate(id) : templatesApi.test(id, inputPayload),
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Test failed");
    },
  });
}
