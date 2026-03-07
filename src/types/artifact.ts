/**
 * Artifact storage types for LifeOps File Upload & Artifacts Storage.
 * Aligns with Run Details and Content Editor integration.
 */

export type ArtifactStatus =
  | "pending_scan"
  | "clean"
  | "infected"
  | "quarantined"
  | "deleted";

export interface Artifact {
  id: string;
  tenantId: string;
  contentItemId: string | null;
  name: string;
  type: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  currentVersionId: string;
  retentionPolicyId: string | null;
  status: ArtifactStatus;
  description: string | null;
  tags: string[] | null;
}

export interface ArtifactVersion {
  id: string;
  artifactId: string;
  versionNumber: number;
  s3Key: string;
  checksum: string | null;
  uploadedAt: string;
  uploadedBy: string;
  signedUrlExpiresAt: string | null;
}

export interface RetentionPolicy {
  id: string;
  tenantId: string;
  name: string;
  retentionPeriodDays: number;
  maxVersions: number;
}

export interface ArtifactUploadResponse {
  artifactId: string;
  versionId: string;
  name: string;
  size: number;
  type: string;
  status: ArtifactStatus;
}

export interface ArtifactDownloadResponse {
  url: string;
  expiresAt?: string;
}

export interface ArtifactVersionListResponse {
  versions: ArtifactVersion[];
}

export interface ArtifactListParams {
  tenantId?: string;
  contentItemId?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: ArtifactStatus;
  page?: number;
  pageSize?: number;
}

export interface ArtifactListResponse {
  artifacts: Artifact[];
  total: number;
}
