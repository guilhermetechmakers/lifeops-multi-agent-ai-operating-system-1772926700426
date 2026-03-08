/**
 * CookieConsentStorage — API-agnostic persistence for cookie consent.
 * Uses localStorage for now; can be swapped to API calls later.
 * Data flow: loadConsent → validate → saveConsent; guards all array operations.
 */

import {
  DEFAULT_CATEGORIES,
  type CookieConsentState,
  type ConsentCategory,
} from "@/types/cookie-policy";

const STORAGE_KEY = "lifeops_cookie_consent_v1";

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

  // Ensure we have all three categories in canonical order (Necessary, Analytics, Marketing)
  const merged = DEFAULT_CATEGORIES.map((def) => {
    const existing = (categories ?? []).find((c) => c.id === def.id);
    return existing
      ? { ...def, ...existing, required: def.required }
      : { ...def };
  });

  return {
    categories: merged,
    lastUpdated: typeof obj.lastUpdated === "string" ? obj.lastUpdated : undefined,
    auditTrail: Array.isArray(obj.auditTrail) ? obj.auditTrail : [],
  };
}

export function loadConsent(): CookieConsentState {
  try {
    if (typeof window === "undefined") return { categories: [...DEFAULT_CATEGORIES] };
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { categories: [...DEFAULT_CATEGORIES] };
    const parsed = JSON.parse(raw) as unknown;
    return validateAndNormalize(parsed);
  } catch {
    return { categories: [...DEFAULT_CATEGORIES] };
  }
}

export function saveConsent(
  payload: CookieConsentState,
  changes?: string[]
): CookieConsentState {
  const categories = Array.isArray(payload?.categories) ? payload.categories : [];
  const necessary = categories.find((c) => c.id === "necessary");
  const existingTrail = Array.isArray(payload?.auditTrail) ? payload.auditTrail : [];
  const now = new Date().toISOString();
  const newEntry =
    Array.isArray(changes) && changes.length > 0 ? { timestamp: now, changes } : null;
  const auditTrail = newEntry ? [...existingTrail, newEntry].slice(-50) : existingTrail;

  const safePayload: CookieConsentState = {
    categories: categories.length > 0 ? categories : [...DEFAULT_CATEGORIES],
    lastUpdated: now,
    auditTrail,
  };
  if (necessary && !necessary.enabled) {
    safePayload.categories = safePayload.categories.map((c) =>
      c.id === "necessary" ? { ...c, enabled: true } : c
    );
  }
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(safePayload));
    }
  } catch {
    // Storage full or unavailable
  }
  return safePayload;
}

export function resetConsent(): CookieConsentState {
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore
  }
  return { categories: [...DEFAULT_CATEGORIES] };
}
