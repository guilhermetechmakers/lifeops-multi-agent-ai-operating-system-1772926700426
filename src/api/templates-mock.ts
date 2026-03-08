/**
 * Mock Templates API for development and testing.
 */

import type {
  AgentTemplate,
  TemplateVersion,
  TemplateListParams,
  TemplateListResponse,
} from "@/types/templates-personas";

const MOCK_TEMPLATES: AgentTemplate[] = [
  {
    id: "tpl-dev-triage",
    domain: "developer",
    name: "Developer Triage",
    description: "Triages PRs and issues, suggests reviewers, labels, and priority.",
    icon: "FileCode",
    status: "published",
    ownerId: "user-1",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ["pr", "triage", "automation"],
    version: 2,
    marketplacePublished: true,
  },
  {
    id: "tpl-content-writer",
    domain: "content",
    name: "Content Writer",
    description: "Draft and refine marketing copy, blog posts, and social content.",
    icon: "FileText",
    status: "published",
    ownerId: "user-1",
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ["content", "draft", "marketing"],
    version: 1,
    marketplacePublished: true,
  },
  {
    id: "tpl-finance-reconciler",
    domain: "finance",
    name: "Finance Reconciler",
    description: "Reconcile transactions, flag anomalies, and categorize expenses.",
    icon: "Wallet",
    status: "published",
    ownerId: "user-1",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ["finance", "reconciliation"],
    version: 1,
    marketplacePublished: true,
  },
  {
    id: "tpl-health-coach",
    domain: "health",
    name: "Health Coach",
    description: "Wellness check-ins, habit tracking, and personalized recommendations.",
    icon: "Heart",
    status: "published",
    ownerId: "user-1",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ["health", "wellness"],
    version: 1,
    marketplacePublished: true,
  },
  {
    id: "tpl-dev-code-review",
    domain: "developer",
    name: "Code Review Assistant",
    description: "Automated code review with style and security suggestions.",
    icon: "FileCode",
    status: "draft",
    ownerId: "user-1",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ["code", "review"],
    version: 1,
    marketplacePublished: false,
  },
];

function filterTemplates(params: TemplateListParams): AgentTemplate[] {
  let list = [...MOCK_TEMPLATES];
  const search = (params.search ?? "").trim().toLowerCase();
  if (search) {
    list = list.filter(
      (t) =>
        (t.name ?? "").toLowerCase().includes(search) ||
        (t.description ?? "").toLowerCase().includes(search) ||
        (t.tags ?? []).some((tag) => tag.toLowerCase().includes(search))
    );
  }
  if (params.domain) {
    list = list.filter((t) => t.domain === params.domain);
  }
  if (params.status) {
    list = list.filter((t) => t.status === params.status);
  }
  return list;
}

export async function mockGetTemplates(
  params: TemplateListParams = {}
): Promise<TemplateListResponse> {
    const filtered = filterTemplates(params);
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);
  return {
    data,
    count: filtered.length,
    page,
    pageSize,
  };
}

export async function mockGetTemplate(id: string): Promise<AgentTemplate | null> {
  return MOCK_TEMPLATES.find((t) => t.id === id) ?? null;
}

export async function mockCreateTemplate(
  payload: Partial<AgentTemplate>
): Promise<AgentTemplate> {
  const now = new Date().toISOString();
  const template: AgentTemplate = {
    id: `tpl-${Date.now()}`,
    domain: (payload.domain ?? "developer") as "developer",
    name: payload.name ?? "New Template",
    description: payload.description ?? "",
    status: (payload.status ?? "draft") as "draft",
    ownerId: "user-1",
    createdAt: now,
    updatedAt: now,
    tags: payload.tags ?? [],
    version: 1,
    marketplacePublished: false,
  };
  MOCK_TEMPLATES.push(template);
  return template;
}

export async function mockUpdateTemplate(
  id: string,
  payload: Partial<AgentTemplate>
): Promise<AgentTemplate> {
  const idx = MOCK_TEMPLATES.findIndex((t) => t.id === id);
  if (idx < 0) throw new Error("Template not found");
  const updated = {
    ...MOCK_TEMPLATES[idx],
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  MOCK_TEMPLATES[idx] = updated;
  return updated;
}

export async function mockDeleteTemplate(id: string): Promise<void> {
  const idx = MOCK_TEMPLATES.findIndex((t) => t.id === id);
  if (idx >= 0) MOCK_TEMPLATES.splice(idx, 1);
}

export async function mockGetTemplateVersions(id: string): Promise<TemplateVersion[]> {
  const t = MOCK_TEMPLATES.find((x) => x.id === id);
  if (!t) return [];
  const versions: TemplateVersion[] = [];
  const ver = t.version ?? 1;
  for (let v = 1; v <= ver; v++) {
    versions.push({
      id: `ver-${id}-${v}`,
      templateId: id,
      versionNumber: v,
      changes: v === 1 ? "Initial version" : `Version ${v} updates`,
      createdAt: t.createdAt,
      authorId: t.ownerId,
    });
  }
  return versions.reverse();
}

export async function mockPublishTemplate(id: string): Promise<AgentTemplate> {
  const idx = MOCK_TEMPLATES.findIndex((t) => t.id === id);
  if (idx < 0) throw new Error("Template not found");
  const updated = {
    ...MOCK_TEMPLATES[idx],
    status: "published" as const,
    marketplacePublished: true,
    updatedAt: new Date().toISOString(),
  };
  MOCK_TEMPLATES[idx] = updated;
  return updated;
}

export async function mockTestTemplate(
  id: string,
  _inputPayload?: Record<string, unknown>
): Promise<{ runId: string; status: string }> {
  return {
    runId: `sandbox-${id}-${Date.now()}`,
    status: "queued",
  };
}
