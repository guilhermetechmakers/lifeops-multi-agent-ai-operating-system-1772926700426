/**
 * Documentation / Developer Docs data models.
 * All types support runtime safety with optional fields and array guards.
 */

export interface Param {
  name: string;
  in: "path" | "query" | "header" | "body";
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
  language: string;
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
}

export interface APIDocSection {
  id: string;
  title: string;
  description?: string;
  endpoints?: Endpoint[];
}

export interface Step {
  number: number;
  title: string;
  description: string;
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

export interface Testimonial {
  id: string;
  author: string;
  company: string;
  text: string;
  rating?: number;
}
