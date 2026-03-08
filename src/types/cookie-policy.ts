/**
 * Cookie Policy — Data models for consent categories and state.
 * LifeOps design system: dark UI, 8px grid, card surfaces.
 */

export type ConsentCategoryId = "necessary" | "analytics" | "marketing";

export interface ConsentCategory {
  id: ConsentCategoryId;
  enabled: boolean;
  description: string;
  dataUsageNotes?: string;
  required?: boolean;
}

export interface AuditTrailEntry {
  timestamp: string;
  changes: string[];
}

export interface CookieConsentState {
  categories: ConsentCategory[];
  lastUpdated?: string;
  auditTrail?: AuditTrailEntry[];
}
