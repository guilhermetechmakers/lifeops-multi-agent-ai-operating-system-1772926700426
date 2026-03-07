/**
 * React Query hooks for LifeOps Artifact storage.
 * All array access guarded; uses safeArray/safe defaults.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as artifactApi from "@/api/artifacts";
import type {
  ArtifactListParams,
  ArtifactUploadResponse,
} from "@/types/artifact";

export const ARTIFACT_KEYS = {
  all: ["artifacts"] as const,
  list: (params?: ArtifactListParams) => [...ARTIFACT_KEYS.all, "list", params ?? {}] as const,
  detail: (id: string) => [...ARTIFACT_KEYS.all, "detail", id] as const,
  versions: (id: string) => [...ARTIFACT_KEYS.all, "versions", id] as const,
};

export function useArtifactList(params: ArtifactListParams = {}) {
  return useQuery({
    queryKey: ARTIFACT_KEYS.list(params),
    queryFn: () => artifactApi.listArtifacts(params),
    placeholderData: { artifacts: [], total: 0 },
  });
}

export function useArtifactVersions(artifactId: string | null) {
  return useQuery({
    queryKey: ARTIFACT_KEYS.versions(artifactId ?? ""),
    queryFn: () => (artifactId ? artifactApi.getArtifactVersions(artifactId) : []),
    enabled: Boolean(artifactId),
    placeholderData: [],
  });
}

export function useUploadArtifact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      formData,
      onProgress,
    }: {
      formData: FormData;
      onProgress?: (pct: number) => void;
    }) => artifactApi.uploadArtifact(formData, onProgress),
    onSuccess: (data: ArtifactUploadResponse) => {
      qc.invalidateQueries({ queryKey: ARTIFACT_KEYS.all });
      toast.success(`Uploaded ${data.name}`);
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Upload failed");
    },
  });
}

export function useUploadArtifactVersion(artifactId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      formData,
      onProgress,
    }: {
      formData: FormData;
      onProgress?: (pct: number) => void;
    }) =>
      artifactApi.uploadNewVersion(artifactId, formData, onProgress),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ARTIFACT_KEYS.versions(artifactId) });
      qc.invalidateQueries({ queryKey: ARTIFACT_KEYS.all });
      toast.success("New version uploaded");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Upload failed");
    },
  });
}

export function useDeleteArtifact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (artifactId: string) => artifactApi.deleteArtifact(artifactId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ARTIFACT_KEYS.all });
      toast.success("Artifact deleted");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Delete failed");
    },
  });
}

export function useRestoreArtifact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      artifactId,
      versionNumber,
    }: {
      artifactId: string;
      versionNumber: number;
    }) => artifactApi.restoreArtifact(artifactId, versionNumber),
    onSuccess: (_, { artifactId }) => {
      qc.invalidateQueries({ queryKey: ARTIFACT_KEYS.versions(artifactId) });
      qc.invalidateQueries({ queryKey: ARTIFACT_KEYS.all });
      toast.success("Version restored");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Restore failed");
    },
  });
}

export function useTriggerScan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (artifactId: string) => artifactApi.triggerScan(artifactId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ARTIFACT_KEYS.all });
      toast.success("Scan triggered");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Scan failed");
    },
  });
}

export function useDownloadArtifact() {
  return useMutation({
    mutationFn: ({ artifactId, version }: { artifactId: string; version?: number }) =>
      artifactApi.getDownloadUrl(artifactId, version),
    onSuccess: (data) => {
      if (data?.url) {
        window.open(data.url, "_blank", "noopener,noreferrer");
      }
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Download failed");
    },
  });
}
