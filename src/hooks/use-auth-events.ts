/**
 * Hook for fetching auth-related audit events.
 * Uses mock data when API is unavailable; API-ready for backend integration.
 */

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";

export interface AuthEvent {
  id: string;
  action: string;
  resource?: string;
  timestamp: string;
  details?: string;
}

const AUTH_EVENTS_KEY = "auth_events";

interface UseAuthEventsParams {
  currentUserOnly?: boolean;
  limit?: number;
}

const USE_MOCK =
  import.meta.env.VITE_USE_MOCK_AUTH === "true" || !import.meta.env.VITE_API_URL;

function mockAuthEvents(userId?: string): AuthEvent[] {
  const base = [
    { id: "e1", action: "user.login", resource: "auth", timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
    { id: "e2", action: "session.created", resource: "auth", timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
    { id: "e3", action: "user.login", resource: "auth", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  ];
  return base;
}

async function fetchAuthEvents(params: UseAuthEventsParams): Promise<AuthEvent[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    const events = mockAuthEvents();
    return (events ?? []).slice(0, params.limit ?? 10);
  }
  try {
    const q = new URLSearchParams();
    if (params.currentUserOnly) q.set("currentUserOnly", "true");
    if (params.limit != null) q.set("limit", String(params.limit));
    const data = await api.get<AuthEvent[] | { events?: AuthEvent[] }>(
      `/audits/events?${q.toString()}`
    );
    if (Array.isArray(data)) return data;
    const events = (data as { events?: AuthEvent[] })?.events ?? [];
    return Array.isArray(events) ? events : [];
  } catch {
    return [];
  }
}

export function useAuthEvents(params: UseAuthEventsParams = {}) {
  const { user, isAuthenticated } = useAuth();
  const userId = user?.id;

  const { data, isLoading } = useQuery({
    queryKey: [AUTH_EVENTS_KEY, userId, params.currentUserOnly, params.limit],
    queryFn: () => fetchAuthEvents(params),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });

  const events = Array.isArray(data) ? data : [];

  return { events, isLoading };
}
