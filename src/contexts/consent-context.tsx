/**
 * ConsentContext — Exposes cookie consent state to child modules.
 * Safe defaults; categories always initialized as array.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_CATEGORIES,
  type CookieConsentState,
  type ConsentCategory,
} from "@/types/cookie-policy";
import { loadConsent, saveConsent } from "@/lib/cookie-consent-storage";

const CATEGORY_LABELS: Record<string, string> = {
  necessary: "Necessary",
  analytics: "Analytics",
  marketing: "Marketing",
};

function getInitialConsentState(): CookieConsentState {
  try {
    if (typeof window === "undefined") {
      return {
        categories: [...DEFAULT_CATEGORIES],
        lastUpdated: undefined,
        auditTrail: [],
      };
    }
    return loadConsent();
  } catch {
    return {
      categories: [...DEFAULT_CATEGORIES],
      lastUpdated: undefined,
      auditTrail: [],
    };
  }
}

interface ConsentContextValue {
  consent: CookieConsentState;
  categories: ConsentCategory[];
  /** Alias for setCategory; use either. */
  setCategoryEnabled: (id: string, enabled: boolean) => void;
  setCategory: (id: string, enabled: boolean) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  /** Persists consent and returns the saved state. */
  save: (changes?: string[]) => CookieConsentState;
  /** Persists current preferences; builds change list from enabled optional categories if not provided. */
  savePreferences: () => CookieConsentState;
  refresh: () => void;
  isDirty: boolean;
  lastSavedAt: string | undefined;
  lastChanges: string[];
}

const defaultState: CookieConsentState = {
  categories: [],
  lastUpdated: undefined,
  auditTrail: [],
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<CookieConsentState>(getInitialConsentState);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | undefined>(undefined);
  const [lastChanges, setLastChanges] = useState<string[]>([]);

  const refresh = useCallback(() => {
    const loaded = loadConsent();
    const categories = Array.isArray(loaded?.categories) ? loaded.categories : [];
    setConsent({
      categories,
      lastUpdated: loaded?.lastUpdated,
      auditTrail: loaded?.auditTrail ?? [],
    });
    setLastSavedAt(loaded?.lastUpdated);
    const trail = Array.isArray(loaded?.auditTrail) ? loaded.auditTrail : [];
    const latest = trail.length > 0 ? trail[trail.length - 1] : null;
    setLastChanges(latest && Array.isArray(latest.changes) ? latest.changes : []);
    setIsDirty(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setCategory = useCallback((id: string, enabled: boolean) => {
    setConsent((prev) => {
      const cats = Array.isArray(prev?.categories) ? prev.categories : [];
      const updated = cats.map((c) =>
        c.id === id && c.required !== true ? { ...c, enabled } : c
      );
      return { ...prev, categories: updated };
    });
    setIsDirty(true);
  }, []);

  const acceptAll = useCallback(() => {
    setConsent((prev) => {
      const cats = Array.isArray(prev?.categories) ? prev.categories : [];
      const updated = cats.map((c) => ({ ...c, enabled: true }));
      return { ...prev, categories: updated };
    });
    setIsDirty(true);
  }, []);

  const rejectAll = useCallback(() => {
    setConsent((prev) => {
      const cats = Array.isArray(prev?.categories) ? prev.categories : [];
      const updated = cats.map((c) => ({
        ...c,
        enabled: c.required === true,
      }));
      return { ...prev, categories: updated };
    });
    setIsDirty(true);
  }, []);

  const save = useCallback((changes?: string[]): CookieConsentState => {
    const result = saveConsent(consent, changes);
    setConsent(result);
    setLastSavedAt(result?.lastUpdated);
    const trail = Array.isArray(result?.auditTrail) ? result.auditTrail : [];
    const latest = trail.length > 0 ? trail[trail.length - 1] : null;
    setLastChanges(latest && Array.isArray(latest.changes) ? latest.changes : []);
    setIsDirty(false);
    return result;
  }, [consent]);

  const savePreferences = useCallback((): CookieConsentState => {
    const currCats = consent?.categories ?? [];
    const previous = loadConsent();
    const prevCats = (previous?.categories ?? []) as Array<{ id: string; enabled: boolean }>;
    const changeMessages: string[] = [];
    for (const curr of currCats) {
      if (curr.id === "necessary") continue;
      const prev = prevCats.find((c) => c.id === curr.id);
      const prevEnabled = prev?.enabled ?? false;
      if (curr.enabled !== prevEnabled) {
        const label = CATEGORY_LABELS[curr.id] ?? curr.id;
        changeMessages.push(`${label} ${curr.enabled ? "enabled" : "disabled"}`);
      }
    }
    return save(changeMessages.length > 0 ? changeMessages : undefined);
  }, [consent, save]);

  const value = useMemo<ConsentContextValue>(
    () => ({
      consent,
      categories: consent?.categories ?? [],
      setCategoryEnabled: setCategory,
      setCategory,
      acceptAll,
      rejectAll,
      save,
      savePreferences,
      refresh,
      isDirty,
      lastSavedAt,
      lastChanges,
    }),
    [consent, setCategory, acceptAll, rejectAll, save, savePreferences, refresh, isDirty, lastSavedAt, lastChanges]
  );

  return (
    <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
  );
}

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    return {
      consent: defaultState,
      categories: [],
      setCategoryEnabled: () => {},
      setCategory: () => {},
      acceptAll: () => {},
      rejectAll: () => {},
      save: (): CookieConsentState => defaultState,
      savePreferences: () => defaultState,
      refresh: () => {},
      isDirty: false,
      lastSavedAt: undefined,
      lastChanges: [],
    };
  }
  return ctx;
}
