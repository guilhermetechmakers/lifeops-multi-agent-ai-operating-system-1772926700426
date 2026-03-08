/**
 * Documentation data API. Returns mock data; replace with fetch to
 * GET /api/docs/apis, /api/docs/connectors, etc. when backend exists.
 * All responses validated; arrays default to [].
 */

import { safeArray } from "@/lib/api/guards";
import type {
  APIDocSection,
  ConnectorGuide,
  AgentTemplate,
  WorkflowSchema,
  DocsLandingData,
} from "@/types/docs";
import {
  mockApiSections,
  mockConnectorGuides,
  mockAgentTemplates,
  mockWorkflowSchema,
  mockDocsLanding,
} from "@/data/docs-mock";

export interface DocsApisResponse {
  data: APIDocSection[];
  meta: { total: number };
}

export interface DocsConnectorsResponse {
  data: ConnectorGuide[];
  meta: { total: number };
}

export interface DocsTemplatesResponse {
  data: AgentTemplate[];
  meta: { total: number };
}

export interface DocsWorkflowSchemaResponse {
  data: WorkflowSchema | null;
}

export interface DocsLandingResponse {
  data: DocsLandingData | null;
}

function normalizeSections(raw: unknown): APIDocSection[] {
  const list = Array.isArray((raw as { data?: unknown })?.data)
    ? (raw as { data: unknown[] }).data
    : Array.isArray(raw)
      ? (raw as APIDocSection[])
      : [];
  return safeArray<APIDocSection>(list).filter(
    (x): x is APIDocSection =>
      x != null &&
      typeof x === "object" &&
      typeof (x as APIDocSection).id === "string" &&
      typeof (x as APIDocSection).title === "string"
  );
}

/**
 * Fetch API doc sections (cronjobs, agents, run artifacts). Mock for now.
 */
export async function fetchDocsApis(query?: string, section?: string): Promise<DocsApisResponse> {
  const data = normalizeSections(mockApiSections);
  let filtered = data;
  if (typeof query === "string" && query.trim()) {
    const q = query.trim().toLowerCase();
    filtered = data.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        (s.description ?? "").toLowerCase().includes(q) ||
        (s.endpoints ?? []).some(
          (e) =>
            e.path.toLowerCase().includes(q) ||
            (e.method.toLowerCase().includes(q))
        )
    );
  }
  if (typeof section === "string" && section.trim()) {
    filtered = filtered.filter((s) => s.id === section.trim());
  }
  return { data: filtered, meta: { total: filtered.length } };
}

/**
 * Fetch connector guides. Mock for now.
 */
export async function fetchDocsConnectors(): Promise<DocsConnectorsResponse> {
  const list = safeArray<ConnectorGuide>(mockConnectorGuides);
  return { data: list, meta: { total: list.length } };
}

/**
 * Fetch agent templates. Mock for now.
 */
export async function fetchDocsTemplates(): Promise<DocsTemplatesResponse> {
  const list = safeArray<AgentTemplate>(mockAgentTemplates);
  return { data: list, meta: { total: list.length } };
}

/**
 * Fetch workflow schema. Mock for now.
 */
export async function fetchDocsWorkflowSchema(): Promise<DocsWorkflowSchemaResponse> {
  return { data: mockWorkflowSchema };
}

/**
 * Fetch docs/landing data (features, pricing, testimonials). Mock for now.
 */
export async function fetchDocsLanding(): Promise<DocsLandingResponse> {
  return { data: mockDocsLanding };
}
