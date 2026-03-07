/**
 * LifeOps Artifact API — upload, list, versions, download, retention, scan, delete, restore.
 * Uses mock when VITE_API_URL is not set; otherwise REST API.
 * All responses guarded for null/undefined; arrays use safe extraction.
 */

import { api } from "@/lib/api";
import { safeArray } from "@/lib/api/guards";
import { artifactsMock } from "@/api/artifacts-mock";
import type {
  Artifact,
  ArtifactListParams,
  ArtifactListResponse,
  ArtifactUploadResponse,
  ArtifactDownloadResponse,
  ArtifactVersion,
  ArtifactVersionListResponse,
} from "@/types/artifact";

const USE_MOCK = !import.meta.env.VITE_API_URL;
const BASE = "/artifacts";

function buildQuery(params: ArtifactListParams): string {
  const search = new URLSearchParams();
  if (params.tenantId) search.set("tenantId", params.tenantId);
  if (params.contentItemId) search.set("contentItemId", params.contentItemId);
  if (params.type) search.set("type", params.type);
  if (params.dateFrom) search.set("dateFrom", params.dateFrom);
  if (params.dateTo) search.set("dateTo", params.dateTo);
  if (params.status) search.set("status", params.status);
  if (params.page != null) search.set("page", String(params.page));
  if (params.pageSize != null) search.set("pageSize", String(params.pageSize));
  const q = search.toString();
  return q ? `?${q}` : "";
}

export async function listArtifacts(
  params: ArtifactListParams = {}
): Promise<ArtifactListResponse> {
  if (USE_MOCK) return artifactsMock.list(params);
  const raw = await api.get<ArtifactListResponse | { artifacts?: Artifact[]; total?: number }>(
    `${BASE}${buildQuery(params)}`
  );
  const artifacts = safeArray<Artifact>(raw?.artifacts);
  const total =
    typeof (raw as ArtifactListResponse)?.total === "number"
      ? (raw as ArtifactListResponse).total
      : 0;
  return { artifacts, total };
}

export async function uploadArtifact(
  formData: FormData,
  onProgress?: (pct: number) => void
): Promise<ArtifactUploadResponse> {
  if (USE_MOCK) {
    const file = formData.get("file") as File | null;
    if (!file) throw new Error("No file in form data");
    const description = (formData.get("description") as string) || undefined;
    const contentItemId = (formData.get("contentItemId") as string) || undefined;
    let tags: string[] | undefined;
    const tagsRaw = formData.get("tags");
    if (typeof tagsRaw === "string") {
      try {
        tags = JSON.parse(tagsRaw) as string[];
      } catch {
        tags = tagsRaw.split(",").map((t) => t.trim()).filter(Boolean);
      }
    }
    return artifactsMock.upload(file, { description, tags, contentItemId }, onProgress);
  }
  const out = await api.upload<ArtifactUploadResponse>(`${BASE}/upload`, formData, onProgress);
  return out as ArtifactUploadResponse;
}

export async function getArtifactVersions(artifactId: string): Promise<ArtifactVersion[]> {
  if (USE_MOCK) return artifactsMock.getVersions(artifactId);
  const raw = await api.get<ArtifactVersionListResponse | { versions?: ArtifactVersion[] }>(
    `${BASE}/${encodeURIComponent(artifactId)}/versions`
  );
  return safeArray<ArtifactVersion>(raw?.versions);
}

export async function getDownloadUrl(
  artifactId: string,
  version?: number
): Promise<ArtifactDownloadResponse> {
  if (USE_MOCK) return artifactsMock.getDownloadUrl(artifactId, version);
  const q = version != null ? `?version=${version}` : "";
  return api.get<ArtifactDownloadResponse>(
    `${BASE}/${encodeURIComponent(artifactId)}/download${q}`
  ) as Promise<ArtifactDownloadResponse>;
}

export async function uploadNewVersion(
  artifactId: string,
  formData: FormData,
  onProgress?: (pct: number) => void
): Promise<ArtifactUploadResponse> {
  if (USE_MOCK) {
    const file = formData.get("file") as File | null;
    if (!file) throw new Error("No file in form data");
    const v = await artifactsMock.uploadVersion(artifactId, file, onProgress);
    return {
      artifactId,
      versionId: v.id,
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
      status: "clean",
    };
  }
  const out = await api.upload<ArtifactUploadResponse>(
    `${BASE}/${encodeURIComponent(artifactId)}/versions`,
    formData,
    onProgress
  );
  return out as ArtifactUploadResponse;
}

export async function setRetention(
  artifactId: string,
  retentionPolicyId: string
): Promise<{ ok: boolean }> {
  if (USE_MOCK) {
    await artifactsMock.setRetention();
    return { ok: true };
  }
  return api.post<{ ok: boolean }>(`${BASE}/${encodeURIComponent(artifactId)}/retention`, {
    retentionPolicyId,
  });
}

export async function triggerScan(artifactId: string): Promise<{ ok: boolean }> {
  if (USE_MOCK) {
    await artifactsMock.scan();
    return { ok: true };
  }
  return api.post<{ ok: boolean }>(`${BASE}/${encodeURIComponent(artifactId)}/scan`, {});
}

export async function deleteArtifact(artifactId: string): Promise<void> {
  if (USE_MOCK) return artifactsMock.delete(artifactId);
  await api.delete(`${BASE}/${encodeURIComponent(artifactId)}`);
}

export async function restoreArtifact(
  artifactId: string,
  versionNumber: number
): Promise<{ ok: boolean }> {
  if (USE_MOCK) {
    await artifactsMock.restore(artifactId, versionNumber);
    return { ok: true };
  }
  return api.post<{ ok: boolean }>(`${BASE}/${encodeURIComponent(artifactId)}/restore`, {
    versionNumber,
  });
}
