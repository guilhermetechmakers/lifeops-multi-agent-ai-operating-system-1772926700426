/**
 * CookieConsentStorage — API-agnostic persistence for cookie consent.
 * Uses localStorage for now; can be swapped to API calls later.
 * Data flow: loadConsent → validate → saveConsent; guards all array operations.
 */

import type { CookieConsentState, ConsentCategory } from "@/types/cookie-policy";

const STORAGE_KEY = "lifeops_cookie_consent_v1";

const DEFAULT_CATEGORIES: ConsentCategory[] = [
  {
    id: "necessary",
    enabled: true,
    description: "Essential for the site to function. Cannot be disabled.",
    dataUsageNotes: "Session, authentication, security preferences.",
    required: true,
  },
  {
    id: "analytics",
    enabled: false,
    description: "Help us understand how you use the site.",
    dataUsageNotes: "Page views, interactions, performance metrics.",
    required: false,
  },
  {
    id: "marketing",
    enabled: false,
    description: "Used to personalize content and ads.",
    dataUsageNotes: "Ad targeting, retargeting, conversion tracking.",
    required: false,
  },
];

function isValidCategory(cat: unknown): cat is ConsentCategory {
  if (!cat || typeof cat !== "object") return false;
  const c = cat as Record<string, unknown>;
  return (
    typeof c.id === "string" &&
    c.id !== "" &&
    typeof c.enabled === "boolean" &&
    typeof c.description === "string"
  );
}

function validateAndNormalize(data: unknown): CookieConsentState {
  const raw = data ?? {};
  const obj = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
  const rawCategories = obj.categories;
  const categories: ConsentCategory[] = Array.isArray(rawCategories)
    ? rawCategories
        .filter(isValidCategory)
        .map((c) => ({
          id: c.id,
          enabled: c.enabled,
          description: c.description ?? "",
          dataUsageNotes: c.dataUsageNotes ?? "",
          required: c.required ?? c.id === "necessary",
        }))
    : [];

  // Ensure we have all three categories with correct defaults
  const ids = new Set<string>((categories ?? []).map((c) => c.id));
  const missing = DEFAULT_CATEGORIES.filter((d) => !ids.has(d.id));
  const merged = [...categories, ...missing].map((c) => {
    const def = DEFAULT_CATEGORIES.find((d) => d.id === c.id);
    return def ? { ...def, ...c, required: def.required } : c;
  });

  return {
    categories: merged,
    lastUpdated: typeof obj.lastUpdated === "string" ? obj.lastUpdated : undefined,
    auditTrail: Array.isArray(obj.auditTrail) ? obj.auditTrail : [],
  };
}

export function loadConsent(): CookieConsentState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { categories: [...DEFAULT_CATEGORIES] };
    const parsed = JSON.parse(raw) as unknown;
    return validateAndNormalize(parsed);
  } catch {
    return { categories: [...DEFAULT_CATEGORIES] };
  }
}

export function saveConsent(payload: CookieConsentState): CookieConsentState {
  const categories = Array.isArray(payload?.categories) ? payload.categories : []; // guard
  const necessary = categories.find((c) => c.id === "necessary");
  const safePayload: CookieConsentState = {
    categories: categories.length > 0 ? categories : [...DEFAULT_CATEGORIES],
    lastUpdated: new Date().toISOString(),
    auditTrail: Array.isArray(payload?.auditTrail) ? payload.auditTrail : [],
  };
  if (necessary && !necessary.enabled) {
    safePayload.categories = safePayload.categories.map((c) =>
      c.id === "necessary" ? { ...c, enabled: true } : c
    );
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safePayload));
  } catch {
    // Storage full or unavailable
  }
  return safePayload;
}

export function resetConsent(): CookieConsentState {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  return { categories: [...DEFAULT_CATEGORIES] };
}

export { DEFAULT_CATEGORIES };
