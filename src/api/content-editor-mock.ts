/**
 * Mock data for Content Editor when API is not configured.
 */

import type {
  Draft,
  Version,
  Artifact,
  PipelineRun,
  StepLog,
  Approval,
  PublishResult,
  Citation,
} from "@/types/content-editor";

const MOCK_DRAFTS: Record<string, Draft> = {};
const MOCK_VERSIONS: Record<string, Version[]> = {};
const MOCK_ARTIFACTS: Record<string, Artifact[]> = {};
const MOCK_PIPELINES: Record<string, PipelineRun> = {};
const MOCK_CITATIONS: Record<string, Citation[]> = {};

function generateId(): string {
  return `mock-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function mockCreateDraft(payload: {
  title: string;
  content?: string;
  format?: "markdown" | "html";
}): Promise<Draft> {
  const id = generateId();
  const now = new Date().toISOString();
  const draft: Draft = {
    id,
    title: payload.title ?? "Untitled",
    content: payload.content ?? "",
    format: payload.format ?? "markdown",
    authorId: "mock-user",
    authorName: "Current User",
    createdAt: now,
    updatedAt: now,
    isPublished: false,
  };
  MOCK_DRAFTS[id] = draft;
  MOCK_VERSIONS[id] = [];
  MOCK_ARTIFACTS[id] = [];
  MOCK_CITATIONS[id] = [];
  return draft;
}

export async function mockGetDraft(draftId: string): Promise<Draft | null> {
  const existing = MOCK_DRAFTS[draftId];
  if (existing) return existing;
  if (draftId.startsWith("ci-")) {
    const synthetic: Draft = {
      id: draftId,
      title: "Draft from Content Item",
      content: "",
      format: "markdown",
      authorId: "mock-user",
      authorName: "Current User",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublished: false,
    };
    MOCK_DRAFTS[draftId] = synthetic;
    MOCK_VERSIONS[draftId] = [];
    MOCK_ARTIFACTS[draftId] = [];
    MOCK_CITATIONS[draftId] = [];
    return synthetic;
  }
  return null;
}

export async function mockUpdateDraft(
  draftId: string,
  payload: Partial<Pick<Draft, "title" | "content" | "format" | "seoMetadata">>
): Promise<Draft> {
  const draft = MOCK_DRAFTS[draftId];
  if (!draft) throw new Error("Draft not found");
  const updated = { ...draft, ...payload, updatedAt: new Date().toISOString() };
  MOCK_DRAFTS[draftId] = updated;
  return updated;
}

export async function mockGetVersions(draftId: string): Promise<Version[]> {
  return MOCK_VERSIONS[draftId] ?? [];
}

export async function mockCreateVersion(
  draftId: string,
  payload: { content: string; changeSummary?: string }
): Promise<Version> {
  const versions = MOCK_VERSIONS[draftId] ?? [];
  const version: Version = {
    id: generateId(),
    draftId,
    content: payload.content,
    changeSummary: payload.changeSummary,
    authorId: "mock-user",
    authorName: "Current User",
    createdAt: new Date().toISOString(),
  };
  versions.unshift(version);
  MOCK_VERSIONS[draftId] = versions;
  const draft = MOCK_DRAFTS[draftId];
  if (draft) {
    MOCK_DRAFTS[draftId] = { ...draft, content: payload.content, currentVersionId: version.id };
  }
  return version;
}

export async function mockGetCitations(draftId: string): Promise<Citation[]> {
  return MOCK_CITATIONS[draftId] ?? [];
}

export async function mockAddCitation(
  draftId: string,
  payload: { url: string; title?: string; snippet?: string }
): Promise<Citation> {
  const list = MOCK_CITATIONS[draftId] ?? [];
  const citation: Citation = {
    id: generateId(),
    draftId,
    url: payload.url,
    title: payload.title,
    snippet: payload.snippet,
    addedAt: new Date().toISOString(),
  };
  list.push(citation);
  MOCK_CITATIONS[draftId] = list;
  return citation;
}

export async function mockGetArtifacts(draftId: string): Promise<Artifact[]> {
  return MOCK_ARTIFACTS[draftId] ?? [];
}

export async function mockUploadArtifact(
  draftId: string,
  _formData: FormData,
  _onProgress?: (pct: number) => void
): Promise<Artifact> {
  const artifacts = MOCK_ARTIFACTS[draftId] ?? [];
  const artifact: Artifact = {
    id: generateId(),
    draftId,
    filename: "uploaded-file.pdf",
    mimeType: "application/pdf",
    size: 1024,
    url: "https://example.com/artifact",
    version: "1.0.0",
    uploadedBy: "mock-user",
    uploadedByName: "Current User",
    createdAt: new Date().toISOString(),
  };
  artifacts.push(artifact);
  MOCK_ARTIFACTS[draftId] = artifacts;
  return artifact;
}

export async function mockDeleteArtifact(
  draftId: string,
  artifactId: string
): Promise<void> {
  const artifacts = (MOCK_ARTIFACTS[draftId] ?? []).filter((a) => a.id !== artifactId);
  MOCK_ARTIFACTS[draftId] = artifacts;
}

export async function mockStartPipeline(payload: {
  draftId: string;
  plan?: string;
  scope?: Record<string, unknown>;
}): Promise<PipelineRun> {
  const runId = generateId();
  const now = new Date().toISOString();
  const run: PipelineRun = {
    id: runId,
    draftId: payload.draftId,
    planId: payload.plan,
    status: "running",
    steps: ["ideation", "research", "drafting", "editing", "scheduling", "publishing"],
    logs: [
      {
        id: generateId(),
        runId,
        stepName: "ideation",
        status: "completed",
        message: "Ideation complete",
        timestamp: now,
      },
    ],
    startedAt: now,
    summary: "Pipeline started",
  };
  MOCK_PIPELINES[runId] = run;
  return run;
}

export async function mockGetPipeline(runId: string): Promise<PipelineRun | null> {
  return MOCK_PIPELINES[runId] ?? null;
}

export async function mockAdvancePipeline(
  runId: string,
  payload: { step: string; payload?: Record<string, unknown> }
): Promise<PipelineRun> {
  const run = MOCK_PIPELINES[runId];
  if (!run) throw new Error("Pipeline not found");
  const now = new Date().toISOString();
  const newLog: StepLog = {
    id: generateId(),
    runId,
    stepName: payload.step,
    status: "completed",
    message: `Step ${payload.step} completed`,
    timestamp: now,
  };
  const logs = [...(run.logs ?? []), newLog];
  const updated: PipelineRun = { ...run, logs, endedAt: now, status: "completed" };
  MOCK_PIPELINES[runId] = updated;
  return updated;
}

export async function mockGetApprovals(_runId: string): Promise<Approval[]> {
  return [];
}

export async function mockDecideApproval(
  _runId: string,
  _approvalId: string,
  payload: { status: "approved" | "rejected"; comments?: string }
): Promise<Approval> {
  return {
    id: generateId(),
    runId: "",
    reviewerId: "mock-user",
    status: payload.status,
    comments: payload.comments,
    requestedAt: new Date().toISOString(),
    decidedAt: new Date().toISOString(),
  };
}

export async function mockPublishToChannel(payload: {
  runId: string;
  channel: string;
  schedule?: string;
}): Promise<PublishResult> {
  return {
    id: generateId(),
    runId: payload.runId,
    channel: payload.channel,
    success: true,
    details: "Published successfully",
    publishedAt: new Date().toISOString(),
  };
}
