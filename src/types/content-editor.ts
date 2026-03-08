/**
 * Content Editor data models — Draft, Version, Artifact, PipelineRun, Approval, PublishResult.
 * Aligned with API schemas and runtime safety requirements.
 */

export type ContentFormat = "markdown" | "html";

export interface SEOMetadata {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
}

export interface Draft {
  id: string;
  title: string;
  content: string;
  format: ContentFormat;
  currentVersionId?: string;
  authorId: string;
  authorName?: string;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  seoMetadata?: SEOMetadata;
}

export interface Version {
  id: string;
  draftId: string;
  content: string;
  changeSummary?: string;
  authorId: string;
  authorName?: string;
  createdAt: string;
}

export interface Artifact {
  id: string;
  draftId: string;
  versionId?: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  version: string;
  uploadedBy: string;
  uploadedByName?: string;
  createdAt: string;
}

export type PipelineStatus = "pending" | "running" | "completed" | "failed";

export interface StepLog {
  id: string;
  runId: string;
  stepName: string;
  status: "pending" | "running" | "completed" | "failed";
  message?: string;
  timestamp: string;
}

export interface PipelineRun {
  id: string;
  draftId: string;
  planId?: string;
  status: PipelineStatus;
  steps?: string[];
  logs?: StepLog[];
  startedAt: string;
  endedAt?: string;
  summary?: string;
}

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface Approval {
  id: string;
  runId: string;
  reviewerId: string;
  reviewerName?: string;
  status: ApprovalStatus;
  comments?: string;
  requestedAt: string;
  decidedAt?: string;
}

export interface PublishResult {
  id: string;
  runId: string;
  channel: string;
  success: boolean;
  details?: string;
  publishedAt: string;
}

export interface Citation {
  id: string;
  draftId: string;
  url: string;
  title?: string;
  snippet?: string;
  addedAt: string;
}

export interface CollaboratorPresence {
  userId: string;
  userName?: string;
  color?: string;
  cursorPosition?: number;
  lastSeen: string;
}
