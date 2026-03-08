/**
 * Mock data for Content Dashboard when API is not configured.
 */

import type {
  ContentItem,
  ContentFilters,
  CronJob,
  RunArtifact,
  SEOInsight,
  AgentRecommendation,
  PublishingQueueItem,
  PipelineRunSummary,
  ApprovalItem,
} from "@/types/content-dashboard";
import type { ContentItemsResponse } from "./content-dashboard";

const MOCK_CONTENT_ITEMS: ContentItem[] = [
  {
    id: "ci-1",
    title: "Getting Started with LifeOps",
    slug: "getting-started-lifeops",
    projectId: "proj-1",
    status: "draft",
    authorId: "u1",
    authorName: "Alex Chen",
    assigneeIds: ["u1"],
    scheduledAt: "2025-03-15T10:00:00Z",
    version: 2,
    seoKeywords: ["lifeops", "automation", "ai"],
    createdAt: "2025-03-01T00:00:00Z",
    updatedAt: "2025-03-07T14:00:00Z",
  },
  {
    id: "ci-2",
    title: "Content Pipeline Best Practices",
    slug: "content-pipeline-best-practices",
    projectId: "proj-1",
    status: "edit",
    authorId: "u2",
    authorName: "Sam Rivera",
    assigneeIds: ["u2", "u3"],
    scheduledAt: "2025-03-18T14:00:00Z",
    version: 3,
    seoKeywords: ["content", "pipeline", "seo"],
    createdAt: "2025-02-20T00:00:00Z",
    updatedAt: "2025-03-06T09:00:00Z",
  },
  {
    id: "ci-3",
    title: "AI-Assisted Writing Workflow",
    slug: "ai-assisted-writing",
    projectId: "proj-1",
    status: "idea",
    authorId: "u1",
    authorName: "Alex Chen",
    assigneeIds: [],
    version: 1,
    createdAt: "2025-03-05T00:00:00Z",
    updatedAt: "2025-03-05T00:00:00Z",
  },
  {
    id: "ci-4",
    title: "SEO Optimization Guide",
    slug: "seo-optimization-guide",
    projectId: "proj-2",
    status: "ready-to-publish",
    authorId: "u3",
    authorName: "Jordan Lee",
    assigneeIds: ["u3"],
    scheduledAt: "2025-03-10T09:00:00Z",
    version: 4,
    seoKeywords: ["seo", "optimization", "keywords"],
    performanceMetrics: { views: 1200, ctr: 2.3, avgPosition: 4.2 },
    createdAt: "2025-02-01T00:00:00Z",
    updatedAt: "2025-03-08T11:00:00Z",
  },
  {
    id: "ci-5",
    title: "Multi-Agent Orchestration",
    slug: "multi-agent-orchestration",
    projectId: "proj-1",
    status: "research",
    authorId: "u2",
    authorName: "Sam Rivera",
    assigneeIds: ["u2"],
    version: 1,
    createdAt: "2025-03-04T00:00:00Z",
    updatedAt: "2025-03-07T16:00:00Z",
  },
  {
    id: "ci-6",
    title: "Release Notes Automation",
    slug: "release-notes-automation",
    projectId: "proj-1",
    status: "published",
    authorId: "u1",
    authorName: "Alex Chen",
    assigneeIds: [],
    publishedAt: "2025-03-01T12:00:00Z",
    version: 5,
    seoKeywords: ["release", "automation", "changelog"],
    performanceMetrics: { views: 3400, ctr: 3.1, avgPosition: 2.8 },
    createdAt: "2025-01-15T00:00:00Z",
    updatedAt: "2025-03-01T12:00:00Z",
  },
];

const MOCK_CRONJOBS: CronJob[] = [
  {
    id: "cj-1",
    name: "Content Publish - Blog",
    enabled: true,
    scheduleCron: "0 9 * * 1-5",
    timezone: "UTC",
    triggerType: "time",
    inputPayload: { type: "content-publish" },
    permissions: "approval-required",
    createdAt: "2025-02-01T00:00:00Z",
    updatedAt: "2025-03-01T00:00:00Z",
  },
  {
    id: "cj-2",
    name: "SEO Report Generator",
    enabled: true,
    scheduleCron: "0 8 * * 1",
    timezone: "UTC",
    triggerType: "time",
    inputPayload: { type: "seo-report" },
    permissions: "suggest-only",
    createdAt: "2025-02-15T00:00:00Z",
    updatedAt: "2025-03-05T00:00:00Z",
  },
];

const MOCK_PUBLISHING_QUEUE: PublishingQueueItem[] = [
  {
    id: "pq-1",
    contentItemId: "ci-4",
    title: "SEO Optimization Guide",
    status: "scheduled",
    nextRun: "2025-03-10T09:00:00Z",
    channels: ["blog", "twitter", "linkedin"],
    retries: 0,
  },
  {
    id: "pq-2",
    contentItemId: "ci-1",
    title: "Getting Started with LifeOps",
    status: "queued",
    nextRun: "2025-03-15T10:00:00Z",
    channels: ["blog"],
    retries: 0,
  },
  {
    id: "pq-3",
    contentItemId: "ci-2",
    title: "Content Pipeline Best Practices",
    status: "scheduled",
    nextRun: "2025-03-18T14:00:00Z",
    channels: ["blog", "newsletter"],
    retries: 1,
    outcome: "Retry scheduled",
  },
];

const MOCK_SEO_INSIGHTS: SEOInsight[] = [
  {
    id: "seo-1",
    contentItemId: "ci-1",
    keyword: "lifeops tutorial",
    searchVolume: 2400,
    difficulty: 35,
    suggestedTitle: "LifeOps Tutorial: Complete Getting Started Guide 2025",
    metaDescription: "Learn how to set up and use LifeOps for content automation. Step-by-step guide with best practices.",
  },
  {
    id: "seo-2",
    contentItemId: "ci-1",
    keyword: "ai content automation",
    searchVolume: 5200,
    difficulty: 58,
    suggestedTitle: "AI Content Automation: Tools and Workflows",
    metaDescription: "Discover how AI-powered content automation can streamline your publishing workflow.",
  },
  {
    id: "seo-3",
    contentItemId: "ci-2",
    keyword: "content pipeline",
    searchVolume: 1800,
    difficulty: 42,
    suggestedTitle: "Content Pipeline Best Practices for 2025",
    metaDescription: "Optimize your content pipeline with these proven strategies and automation tips.",
  },
];

const MOCK_AGENT_RECOMMENDATIONS: AgentRecommendation[] = [
  {
    id: "ar-1",
    topic: "LLM Prompt Engineering for Content",
    rationale: "High search interest; aligns with product capabilities",
    confidence: 0.92,
  },
  {
    id: "ar-2",
    topic: "Content Calendar Automation with Cron",
    rationale: "Users frequently ask about scheduling; strong fit for LifeOps",
    confidence: 0.88,
  },
  {
    id: "ar-3",
    topic: "Multi-Channel Publishing Strategy",
    rationale: "Trending in marketing automation space",
    confidence: 0.85,
  },
];

interface MockContentParams {
  filters?: ContentFilters;
  page?: number;
  limit?: number;
  search?: string;
}

function filterContentItems(
  items: ContentItem[],
  params: MockContentParams = {}
): ContentItem[] {
  let filtered = [...items];
  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (i) =>
        i.title?.toLowerCase().includes(q) ||
        (i.seoKeywords ?? []).some((k) => k.toLowerCase().includes(q))
    );
  }
  const projectIds = params.filters?.projectIds ?? [];
  if (projectIds.length > 0) {
    const set = new Set(projectIds);
    filtered = filtered.filter((i) => set.has(i.projectId));
  }
  const statuses = params.filters?.statuses ?? [];
  if (statuses.length > 0) {
    const set = new Set(statuses);
    filtered = filtered.filter((i) => set.has(i.status));
  }
  return filtered;
}

export async function mockFetchContentItems(
  params: MockContentParams = {}
): Promise<ContentItemsResponse> {
  const filtered = filterContentItems(MOCK_CONTENT_ITEMS, params);
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit);
  return {
    items,
    count: filtered.length,
    page,
    limit,
  };
}

export async function mockFetchContentItem(
  id: string
): Promise<ContentItem | null> {
  return MOCK_CONTENT_ITEMS.find((i) => i.id === id) ?? null;
}

export async function mockCreateContentItem(
  payload: Partial<ContentItem>
): Promise<ContentItem | null> {
  const item: ContentItem = {
    id: `ci-mock-${Date.now()}`,
    title: payload.title ?? "Untitled",
    projectId: payload.projectId ?? "proj-1",
    status: (payload.status as ContentItem["status"]) ?? "idea",
    authorId: payload.authorId ?? "u1",
    assigneeIds: payload.assigneeIds ?? [],
    version: 1,
    seoKeywords: payload.seoKeywords ?? [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...payload,
  };
  MOCK_CONTENT_ITEMS.push(item);
  return item;
}

export async function mockUpdateContentItem(
  id: string,
  payload: Partial<ContentItem>
): Promise<ContentItem | null> {
  const idx = MOCK_CONTENT_ITEMS.findIndex((i) => i.id === id);
  if (idx < 0) return null;
  MOCK_CONTENT_ITEMS[idx] = {
    ...MOCK_CONTENT_ITEMS[idx],
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  return MOCK_CONTENT_ITEMS[idx];
}

const STAGE_ORDER: ContentItem["status"][] = [
  "idea",
  "research",
  "draft",
  "edit",
  "ready-to-publish",
  "published",
];

export async function mockAdvanceContentStage(
  id: string
): Promise<ContentItem | null> {
  const idx = MOCK_CONTENT_ITEMS.findIndex((i) => i.id === id);
  if (idx < 0) return null;
  const current = MOCK_CONTENT_ITEMS[idx];
  const pos = STAGE_ORDER.indexOf(current.status);
  const nextStatus = STAGE_ORDER[pos + 1] ?? current.status;
  return mockUpdateContentItem(id, { status: nextStatus });
}

export async function mockMoveContentCalendar(
  id: string,
  scheduledAt: string
): Promise<ContentItem | null> {
  return mockUpdateContentItem(id, { scheduledAt });
}

export async function mockFetchCronjobs(): Promise<CronJob[]> {
  return [...MOCK_CRONJOBS];
}

export async function mockRunCronjobNow(
  _id: string
): Promise<RunArtifact | null> {
  return {
    id: `run-${Date.now()}`,
    cronJobId: _id,
    status: "running",
    startedAt: new Date().toISOString(),
    artifacts: {},
    logs: ["Run started"],
  };
}

export async function mockFetchSEOInsights(
  _contentItemId?: string
): Promise<SEOInsight[]> {
  return [...MOCK_SEO_INSIGHTS];
}

export async function mockFetchPerformanceMetrics(): Promise<
  { views?: number; ctr?: number; avgPosition?: number }[]
> {
  return [
    { views: 1200, ctr: 2.3, avgPosition: 4.2 },
    { views: 3400, ctr: 3.1, avgPosition: 2.8 },
  ];
}

export async function mockFetchRunArtifact(
  _runId: string
): Promise<RunArtifact | null> {
  return {
    id: "run-1",
    cronJobId: "cj-1",
    status: "success",
    startedAt: "2025-03-06T09:00:00Z",
    finishedAt: "2025-03-06T09:02:00Z",
    artifacts: {},
    logs: ["Publish initiated", "Content published to blog", "Run completed"],
    diffs: "scheduledAt: 2025-03-10T09:00:00Z -> 2025-03-11T09:00:00Z",
  };
}

export async function mockFetchAgentRecommendations(): Promise<
  AgentRecommendation[]
> {
  return [...MOCK_AGENT_RECOMMENDATIONS];
}

export async function mockOpenEditorWithData(
  payload: { contentItemId?: string; topic?: string }
): Promise<{ url?: string; contentItemId?: string }> {
  return {
    url: `/dashboard/content/editor${payload.contentItemId ? `?id=${payload.contentItemId}` : payload.topic ? `?topic=${encodeURIComponent(payload.topic)}` : ""}`,
    contentItemId: payload.contentItemId,
  };
}

export function mockGetPublishingQueue(): Promise<PublishingQueueItem[]> {
  return Promise.resolve([...MOCK_PUBLISHING_QUEUE]);
}

export async function mockRetryPublishingQueueItem(
  id: string
): Promise<PublishingQueueItem> {
  const item = MOCK_PUBLISHING_QUEUE.find((i) => i.id === id);
  if (!item) throw new Error("Queue item not found");
  return {
    ...item,
    status: "scheduled",
    retries: (item.retries ?? 0) + 1,
    outcome: "Retry scheduled",
  };
}

const MOCK_PIPELINE_RUNS: PipelineRunSummary[] = [
  {
    id: "pr-1",
    draftId: "ci-1",
    contentTitle: "Getting Started with LifeOps",
    status: "running",
    currentStep: "drafting",
    progress: 45,
    eta: "~5 min",
    lastAction: "Research completed",
    startedAt: "2025-03-08T10:00:00Z",
  },
  {
    id: "pr-2",
    draftId: "ci-2",
    contentTitle: "Content Pipeline Best Practices",
    status: "completed",
    progress: 100,
    lastAction: "Published to blog",
    startedAt: "2025-03-07T14:00:00Z",
    endedAt: "2025-03-07T14:12:00Z",
  },
];

const MOCK_APPROVALS: ApprovalItem[] = [
  {
    id: "ap-1",
    runId: "pr-1",
    contentTitle: "Getting Started with LifeOps",
    reviewerId: "u2",
    reviewerName: "Sam Rivera",
    status: "pending",
    requestedAt: "2025-03-08T10:30:00Z",
    comments: "Ready for review",
  },
];

export async function mockFetchPipelineRuns(): Promise<PipelineRunSummary[]> {
  return [...MOCK_PIPELINE_RUNS];
}

export async function mockFetchApprovalsQueue(): Promise<ApprovalItem[]> {
  return [...MOCK_APPROVALS];
}

export async function mockDecideApproval(
  _runId: string,
  approvalId: string,
  payload: { status: "approved" | "rejected"; comments?: string }
): Promise<ApprovalItem> {
  const item = MOCK_APPROVALS.find((a) => a.id === approvalId);
  if (!item) throw new Error("Approval not found");
  return {
    ...item,
    status: payload.status,
    comments: payload.comments,
  };
}
