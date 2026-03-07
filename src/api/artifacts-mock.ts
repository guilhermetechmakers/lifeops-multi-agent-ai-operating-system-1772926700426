/**
 * Mock artifact store for development when backend is unavailable.
 * Uses in-memory storage; data is lost on refresh.
 */

import type {
  Artifact,
  ArtifactVersion,
  ArtifactListParams,
  ArtifactListResponse,
  ArtifactUploadResponse,
} from "@/types/artifact";

const DEFAULT_TENANT = "00000000-0000-0000-0000-000000000001";

const artifactsStore: Artifact[] = [];
const versionsStore: Map<string, ArtifactVersion[]> = new Map();

function uuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const artifactsMock = {
  list: async (params: ArtifactListParams = {}): Promise<ArtifactListResponse> => {
    let list = artifactsStore.filter((a) => a.status !== "deleted");
    if (params.tenantId) list = list.filter((a) => a.tenantId === params.tenantId);
    if (params.contentItemId)
      list = list.filter((a) => a.contentItemId === params.contentItemId);
    if (params.type) list = list.filter((a) => a.type.includes(params.type!));
    if (params.status) list = list.filter((a) => a.status === params.status);
    const total = list.length;
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const start = (page - 1) * pageSize;
    const artifacts = list.slice(start, start + pageSize);
    return { artifacts, total };
  },

  upload: async (
    file: File,
    metadata?: { description?: string; tags?: string[]; contentItemId?: string },
    onProgress?: (pct: number) => void
  ): Promise<ArtifactUploadResponse> => {
    const id = uuid();
    const versionId = uuid();
    const now = new Date().toISOString();
    const version: ArtifactVersion = {
      id: versionId,
      artifactId: id,
      versionNumber: 1,
      s3Key: `${DEFAULT_TENANT}/artifacts/${id}/v1`,
      checksum: null,
      uploadedAt: now,
      uploadedBy: "mock-user",
      signedUrlExpiresAt: null,
    };
    const artifact: Artifact = {
      id,
      tenantId: DEFAULT_TENANT,
      contentItemId: metadata?.contentItemId ?? null,
      name: file.name,
      type: file.type || "application/octet-stream",
      size: file.size,
      createdAt: now,
      updatedAt: now,
      currentVersionId: versionId,
      retentionPolicyId: null,
      status: "clean",
      description: metadata?.description ?? null,
      tags: metadata?.tags ?? null,
    };
    if (onProgress) {
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((r) => setTimeout(r, 50));
        onProgress(i);
      }
    }
    artifactsStore.push(artifact);
    versionsStore.set(id, [version]);
    return {
      artifactId: id,
      versionId,
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
      status: "clean",
    };
  },

  getVersions: async (artifactId: string): Promise<ArtifactVersion[]> => {
    const versions = versionsStore.get(artifactId) ?? [];
    return [...versions];
  },

  getDownloadUrl: async (
    artifactId: string,
    _version?: number
  ): Promise<{ url: string; expiresAt?: string }> => {
    const a = artifactsStore.find((x) => x.id === artifactId);
    if (!a) return { url: "" };
    return {
      url: URL.createObjectURL(new Blob([`mock-content-${a.name}`])),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    };
  },

  uploadVersion: async (
    artifactId: string,
    file: File,
    onProgress?: (pct: number) => void
  ): Promise<ArtifactVersion> => {
    const versions = versionsStore.get(artifactId) ?? [];
    const artifact = artifactsStore.find((a) => a.id === artifactId);
    if (!artifact) throw new Error("Artifact not found");
    const versionNumber = versions.length + 1;
    const versionId = uuid();
    const now = new Date().toISOString();
    const version: ArtifactVersion = {
      id: versionId,
      artifactId,
      versionNumber,
      s3Key: `${DEFAULT_TENANT}/artifacts/${artifactId}/v${versionNumber}`,
      checksum: null,
      uploadedAt: now,
      uploadedBy: "mock-user",
      signedUrlExpiresAt: null,
    };
    if (onProgress) {
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((r) => setTimeout(r, 50));
        onProgress(i);
      }
    }
    versions.push(version);
    versionsStore.set(artifactId, versions);
    artifact.currentVersionId = versionId;
    artifact.updatedAt = now;
    artifact.size = file.size;
    artifact.type = file.type || "application/octet-stream";
    return version;
  },

  setRetention: async (): Promise<{ success: boolean }> => ({ success: true }),
  scan: async (): Promise<{ status: "clean" }> => ({ status: "clean" }),

  delete: async (artifactId: string): Promise<void> => {
    const idx = artifactsStore.findIndex((a) => a.id === artifactId);
    if (idx >= 0) {
      artifactsStore[idx].status = "deleted";
    }
  },

  restore: async (artifactId: string, versionNumber: number): Promise<Artifact> => {
    const artifact = artifactsStore.find((a) => a.id === artifactId);
    if (!artifact) throw new Error("Artifact not found");
    const versions = versionsStore.get(artifactId) ?? [];
    const v = versions.find((x) => x.versionNumber === versionNumber);
    if (v) artifact.currentVersionId = v.id;
    artifact.status = "clean";
    artifact.updatedAt = new Date().toISOString();
    return artifact;
  },
};
