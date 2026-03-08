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

/** Default consent categories: Necessary always on, Analytics/Marketing off by default. */
export const DEFAULT_CATEGORIES: ConsentCategory[] = [
  {
    id: "necessary",
    enabled: true,
    required: true,
    description: "Required for the site to function (session, security, preferences).",
    dataUsageNotes: "Session ID, CSRF token, consent choice.",
  },
  {
    id: "analytics",
    enabled: false,
    required: false,
    description: "Help us understand how you use the product (anonymized usage and performance).",
    dataUsageNotes: "Page views, events, device type; no personal data.",
  },
  {
    id: "marketing",
    enabled: false,
    required: false,
    description: "Used for relevant ads and cross-site measurement (optional).",
    dataUsageNotes: "Ad engagement, conversion signals; may share with partners.",
  },
];
