/**
 * Agent Templates & Personas types.
 * Aligns with API contracts; use (data ?? []) and Array.isArray when consuming.
 */

export type TemplateDomain =
  | "developer"
  | "content"
  | "finance"
  | "health";

export type TemplateStatus = "draft" | "published" | "deprecated";

export interface TemplatePermission {
  id: string;
  templateId: string;
  role: string;
  scope: string;
  allowedActions: string[];
}

export interface TemplateConnector {
  id: string;
  templateId: string;
  connectorName: string;
  config: Record<string, unknown>;
}

export interface TemplateVersion {
  id: string;
  templateId: string;
  versionNumber: number;
  changes: string;
  createdAt: string;
  authorId: string;
}

export interface AgentTemplate {
  id: string;
  domain: TemplateDomain;
  name: string;
  description: string;
  icon?: string;
  status: TemplateStatus;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  version?: number;
  connectors?: TemplateConnector[];
  permissions?: TemplatePermission[];
  marketplacePublished?: boolean;
  recommendedPersonaIds?: string[];
}

export interface TemplateListParams {
  search?: string;
  domain?: TemplateDomain | "";
  status?: TemplateStatus | "";
  page?: number;
  pageSize?: number;
  sort?: string;
}

export interface TemplateListResponse {
  data: AgentTemplate[];
  count: number;
  page: number;
  pageSize: number;
}

/** Persona types */
export interface PersonaTrait {
  id: string;
  personaId: string;
  traitName: string;
  value: string;
}

export interface PersonaPermission {
  id: string;
  personaId: string;
  role: string;
  restrictions: Record<string, unknown>;
}

export interface Persona {
  id: string;
  domain: TemplateDomain;
  name: string;
  description: string;
  tone: string;
  styleGuides: Record<string, unknown>;
  allowedTools: string[];
  safetyConstraints: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  traits?: PersonaTrait[];
  permissions?: PersonaPermission[];
  examplePrompts?: string[];
}

export interface PersonaListParams {
  search?: string;
  domain?: TemplateDomain | "";
  page?: number;
  pageSize?: number;
}

export interface PersonaListResponse {
  data: Persona[];
  count: number;
  page: number;
  pageSize: number;
}

/** Sandbox types */
export interface SandboxRunInput {
  templateId: string;
  personaId?: string;
  inputPayload: Record<string, unknown>;
  scope?: string[];
}

export interface SandboxRunResult {
  id: string;
  templateId: string;
  inputPayload: Record<string, unknown>;
  result: Record<string, unknown>;
  logs: string[];
  artifacts: Array<{ name: string; uri: string; type: string }>;
  errors: string[];
  flags?: string[];
}

/** Audit types */
export interface AuditLogEntry {
  id: string;
  entity: string;
  entityId: string;
  action: string;
  userId: string;
  timestamp: string;
  details: Record<string, unknown>;
}

export interface AuditLogListResponse {
  data: AuditLogEntry[];
  count: number;
  page: number;
  pageSize: number;
}
