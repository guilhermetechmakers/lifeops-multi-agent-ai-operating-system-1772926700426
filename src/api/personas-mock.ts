/**
 * Mock Personas API for development and testing.
 */

import type {
  Persona,
  PersonaListParams,
  PersonaListResponse,
} from "@/types/templates-personas";

const MOCK_PERSONAS: Persona[] = [
  {
    id: "persona-dev-senior",
    domain: "developer",
    name: "Senior Developer",
    description: "Technical, precise, code-first mindset.",
    tone: "professional",
    styleGuides: { brevity: "high", jargon: "allowed" },
    allowedTools: ["code", "git", "ci"],
    safetyConstraints: { maxFileSize: 10000 },
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    examplePrompts: ["Review this PR", "Suggest improvements"],
  },
  {
    id: "persona-content-creative",
    domain: "content",
    name: "Creative Writer",
    description: "Engaging, brand-aligned content creator.",
    tone: "friendly",
    styleGuides: { voice: "conversational", seo: true },
    allowedTools: ["draft", "edit", "publish"],
    safetyConstraints: {},
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    examplePrompts: ["Draft a blog post about X", "Create social copy"],
  },
  {
    id: "persona-finance-auditor",
    domain: "finance",
    name: "Finance Auditor",
    description: "Detail-oriented, compliance-focused.",
    tone: "formal",
    styleGuides: { precision: "high", citations: true },
    allowedTools: ["reconcile", "categorize", "report"],
    safetyConstraints: { piiRedaction: true },
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    examplePrompts: ["Reconcile ledger for period X", "Flag anomalies"],
  },
  {
    id: "persona-health-coach",
    domain: "health",
    name: "Wellness Coach",
    description: "Supportive, evidence-based health guidance.",
    tone: "warm",
    styleGuides: { empathy: "high", disclaimers: true },
    allowedTools: ["check-in", "track", "recommend"],
    safetyConstraints: { medicalDisclaimer: true },
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    examplePrompts: ["Weekly check-in", "Habit suggestions"],
  },
];

function filterPersonas(params: PersonaListParams): Persona[] {
  let list = [...MOCK_PERSONAS];
  const search = (params.search ?? "").trim().toLowerCase();
  if (search) {
    list = list.filter(
      (p) =>
        (p.name ?? "").toLowerCase().includes(search) ||
        (p.description ?? "").toLowerCase().includes(search)
    );
  }
  if (params.domain) {
    list = list.filter((p) => p.domain === params.domain);
  }
  return list;
}

export async function mockGetPersonas(
  params: PersonaListParams = {}
): Promise<PersonaListResponse> {
  const filtered = filterPersonas(params);
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

export async function mockGetPersona(id: string): Promise<Persona | null> {
  return MOCK_PERSONAS.find((p) => p.id === id) ?? null;
}

export async function mockCreatePersona(payload: Partial<Persona>): Promise<Persona> {
  const now = new Date().toISOString();
  const persona: Persona = {
    id: `persona-${Date.now()}`,
    domain: (payload.domain ?? "developer") as "developer",
    name: payload.name ?? "New Persona",
    description: payload.description ?? "",
    tone: payload.tone ?? "",
    styleGuides: payload.styleGuides ?? {},
    allowedTools: payload.allowedTools ?? [],
    safetyConstraints: payload.safetyConstraints ?? {},
    createdAt: now,
    updatedAt: now,
    examplePrompts: payload.examplePrompts ?? [],
  };
  MOCK_PERSONAS.push(persona);
  return persona;
}

export async function mockUpdatePersona(
  id: string,
  payload: Partial<Persona>
): Promise<Persona> {
  const idx = MOCK_PERSONAS.findIndex((p) => p.id === id);
  if (idx < 0) throw new Error("Persona not found");
  const updated = {
    ...MOCK_PERSONAS[idx],
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  MOCK_PERSONAS[idx] = updated;
  return updated;
}

export async function mockDeletePersona(id: string): Promise<void> {
  const idx = MOCK_PERSONAS.findIndex((p) => p.id === id);
  if (idx >= 0) MOCK_PERSONAS.splice(idx, 1);
}
