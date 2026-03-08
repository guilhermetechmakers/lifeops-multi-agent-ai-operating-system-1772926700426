/**
 * Content Editor API — drafts, versions, artifacts, pipelines, approvals, publish.
 * Uses native fetch via @/lib/api; all responses guarded with safeArray/safeObject.
 */

import { api, safeArray } from "@/lib/api";
import type {
  Draft,
  Version,
  Artifact,
  PipelineRun,
  Approval,
  PublishResult,
  Citation,
} from "@/types/content-editor";

const DRAFTS = "/drafts";
const PIPELINES = "/pipelines";
const PUBLISH = "/publish";

export async function createDraft(payload: {
  title: string;
  content?: string;
  format?: "markdown" | "html";
}): Promise<Draft> {
  const raw = await api.post<Draft | { data?: Draft }>(DRAFTS, payload);
  if (raw && typeof raw === "object" && "data" in raw)
    return (raw as { data?: Draft }).data ?? (raw as Draft);
  return raw as Draft;
}

export async function getDraft(draftId: string): Promise<Draft | null> {
  const raw = await api.get<Draft | { data?: Draft } | null>(`${DRAFTS}/${draftId}`);
  if (!raw) return null;
  if (raw && typeof raw === "object" && "data" in raw)
    return (raw as { data?: Draft }).data ?? null;
  return raw as Draft;
}

export async function updateDraft(
  draftId: string,
  payload: Partial<Pick<Draft, "title" | "content" | "format" | "seoMetadata">>
): Promise<Draft> {
  const raw = await api.patch<Draft | { data?: Draft }>(`${DRAFTS}/${draftId}`, payload);
  if (raw && typeof raw === "object" && "data" in raw)
    return (raw as { data?: Draft }).data ?? (raw as Draft);
  return raw as Draft;
}

export async function getVersions(draftId: string): Promise<Version[]> {
  const raw = await api.get<Version[] | { data?: Version[] }>(
    `${DRAFTS}/${draftId}/versions`
  );
  const arr = Array.isArray(raw) ? raw : (raw as { data?: Version[] })?.data;
  return safeArray<Version>(arr ?? raw);
}

export async function createVersion(
  draftId: string,
  payload: { content: string; changeSummary?: string }
): Promise<Version> {
  const raw = await api.post<Version | { data?: Version }>(
    `${DRAFTS}/${draftId}/versions`,
    payload
  );
  if (raw && typeof raw === "object" && "data" in raw)
    return (raw as { data?: Version }).data ?? (raw as Version);
  return raw as Version;
}

export async function getCitations(draftId: string): Promise<Citation[]> {
  const raw = await api.get<Citation[] | { data?: Citation[] }>(
    `${DRAFTS}/${draftId}/citations`
  );
  const arr = Array.isArray(raw) ? raw : (raw as { data?: Citation[] })?.data;
  return safeArray<Citation>(arr ?? raw);
}

export async function addCitation(
  draftId: string,
  payload: { url: string; title?: string; snippet?: string }
): Promise<Citation> {
  const raw = await api.post<Citation | { data?: Citation }>(
    `${DRAFTS}/${draftId}/citations`,
    payload
  );
  if (raw && typeof raw === "object" && "data" in raw)
    return (raw as { data?: Citation }).data ?? (raw as Citation);
  return raw as Citation;
}

export async function getArtifacts(draftId: string): Promise<Artifact[]> {
  const raw = await api.get<Artifact[] | { data?: Artifact[] }>(
    `${DRAFTS}/${draftId}/artifacts`
  );
  const arr = Array.isArray(raw) ? raw : (raw as { data?: Artifact[] })?.data;
  return safeArray<Artifact>(arr ?? raw);
}

export async function uploadArtifact(
  draftId: string,
  formData: FormData,
  onProgress?: (pct: number) => void
): Promise<Artifact> {
  const raw = await api.upload<Artifact | { data?: Artifact }>(
    `${DRAFTS}/${draftId}/artifacts`,
    formData,
    onProgress
  );
  if (raw && typeof raw === "object" && "data" in raw)
    return (raw as { data?: Artifact }).data ?? (raw as Artifact);
  return raw as Artifact;
}

export async function deleteArtifact(
  draftId: string,
  artifactId: string
): Promise<void> {
  await api.delete(`${DRAFTS}/${draftId}/artifacts/${artifactId}`);
}

export async function startPipeline(payload: {
  draftId: string;
  plan?: string;
  scope?: Record<string, unknown>;
}): Promise<PipelineRun> {
  const raw = await api.post<PipelineRun | { data?: PipelineRun }>(
    PIPELINES,
    payload
  );
  if (raw && typeof raw === "object" && "data" in raw)
    return (raw as { data?: PipelineRun }).data ?? (raw as PipelineRun);
  return raw as PipelineRun;
}

export async function getPipeline(runId: string): Promise<PipelineRun | null> {
  const raw = await api.get<PipelineRun | { data?: PipelineRun } | null>(
    `${PIPELINES}/${runId}`
  );
  if (!raw) return null;
  if (raw && typeof raw === "object" && "data" in raw)
    return (raw as { data?: PipelineRun }).data ?? null;
  return raw as PipelineRun;
}

export async function advancePipeline(
  runId: string,
  payload: { step: string; payload?: Record<string, unknown> }
): Promise<PipelineRun> {
  const raw = await api.post<PipelineRun | { data?: PipelineRun }>(
    `${PIPELINES}/${runId}/advance`,
    payload
  );
  if (raw && typeof raw === "object" && "data" in raw)
    return (raw as { data?: PipelineRun }).data ?? (raw as PipelineRun);
  return raw as PipelineRun;
}

export async function getApprovals(runId: string): Promise<Approval[]> {
  const raw = await api.get<Approval[] | { data?: Approval[] }>(
    `${PIPELINES}/${runId}/approvals`
  );
  const arr = Array.isArray(raw) ? raw : (raw as { data?: Approval[] })?.data;
  return safeArray<Approval>(arr ?? raw);
}

export async function decideApproval(
  runId: string,
  approvalId: string,
  payload: { status: "approved" | "rejected"; comments?: string }
): Promise<Approval> {
  const raw = await api.post<Approval | { data?: Approval }>(
    `${PIPELINES}/${runId}/approvals/${approvalId}/decide`,
    payload
  );
  if (raw && typeof raw === "object" && "data" in raw)
    return (raw as { data?: Approval }).data ?? (raw as Approval);
  return raw as Approval;
}

export async function publishToChannel(payload: {
  runId: string;
  channel: string;
  schedule?: string;
}): Promise<PublishResult> {
  const raw = await api.post<PublishResult | { data?: PublishResult }>(
    PUBLISH,
    payload
  );
  if (raw && typeof raw === "object" && "data" in raw)
    return (raw as { data?: PublishResult }).data ?? (raw as PublishResult);
  return raw as PublishResult;
}
