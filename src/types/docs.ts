/**
 * Documentation / Developer Docs data models.
 * All list types are consumed with (data ?? []) and Array.isArray guards.
 */

export interface Param {
  name: string;
  in: "query" | "path" | "header" | "body";
  required: boolean;
  type: string;
  description?: string;
}

export interface ResponseBlock {
  code: number;
  contentType: string;
  schema?: string;
}

export interface CodeSample {
  lang?: "curl" | "javascript" | "json";
  language?: string;
  label: string;
  code: string;
}

export interface Endpoint {
  id: string;
  method: string;
  path: string;
  description: string;
  params?: Param[];
  responses?: ResponseBlock[];
  examples?: CodeSample[];
  status?: "stable" | "beta" | "deprecated";
}

export interface APIDocSection {
  id: string;
  title: string;
  description?: string;
  endpoints?: Endpoint[];
}

export interface Step {
  order?: number;
  number?: number;
  title: string;
  body?: string;
  description?: string;
}

export interface Permission {
  scope: string;
  description: string;
  required: boolean;
}

export interface ConnectorGuide {
  id: string;
  title: string;
  prerequisites?: string[];
  steps?: Step[];
  permissions?: Permission[];
  troubleshooting?: string;
}

export interface AgentTemplate {
  id: string;
  name: string;
  category: string;
  language: string;
  version: string;
  description?: string;
  preview?: string;
}

export interface Field {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  children?: Field[];
  fields?: Field[];
}

export interface WorkflowSchema {
  id: string;
  name: string;
  fields?: Field[];
  relationships?: string[];
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  features: string[];
}

export interface TestimonialDoc {
  id: string;
  author: string;
  company: string;
  text: string;
  rating?: number;
}

export interface DocsLandingData {
  features: { id: string; title: string; description: string }[];
  pricing: PricingPlan[];
  testimonials: TestimonialDoc[];
}
