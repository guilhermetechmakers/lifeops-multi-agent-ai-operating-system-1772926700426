/**
 * React Query hooks for Profile, Integrations, Security, API Keys, Billing, Preferences.
 * Uses mock API when VITE_API_URL is not set. All arrays guarded.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { profileApi } from "@/api/profile";
import { profileMockApi } from "@/api/profile-mock";
import { safeArray } from "@/lib/api";
import type {
  Integration,
  ApiKey,
  Session,
  UserPreference,
  ProfileUpdateInput,
} from "@/types/profile";

const USE_MOCK = !import.meta.env.VITE_API_URL;

const profileKeys = {
  all: ["profile"] as const,
  profile: () => ["profile", "me"] as const,
  integrations: () => ["profile", "integrations"] as const,
  apiKeys: () => ["profile", "apikeys"] as const,
  billing: () => ["profile", "billing"] as const,
  sessions: () => ["profile", "sessions"] as const,
  twoFactor: () => ["profile", "2fa"] as const,
  preferences: () => ["profile", "preferences"] as const,
};

export function useProfile() {
  const query = useQuery({
    queryKey: profileKeys.profile(),
    queryFn: async () => {
      if (USE_MOCK) return profileMockApi.getProfile();
      return profileApi.getProfile();
    },
  });
  const profile = query.data ?? null;
  return { ...query, profile };
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ProfileUpdateInput) => {
      if (USE_MOCK) return profileMockApi.updateProfile(input);
      return profileApi.updateProfile(input);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.profile(), data);
      toast.success("Profile updated");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    },
  });
}

export function useIntegrations() {
  const query = useQuery({
    queryKey: profileKeys.integrations(),
    queryFn: async () => {
      if (USE_MOCK) return profileMockApi.getIntegrations();
      const r = await profileApi.getIntegrations();
      return Array.isArray(r) ? r : [];
    },
  });
  const items = safeArray<Integration>(query.data);
  return { ...query, items };
}

export function useConnectIntegration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (provider: string) => {
      if (USE_MOCK) return profileMockApi.connectIntegration(provider);
      return profileApi.connectIntegration(provider);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.integrations() });
      toast.success("Integration connected");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to connect");
    },
  });
}

export function useDisconnectIntegration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (provider: string) => {
      if (USE_MOCK) return profileMockApi.disconnectIntegration(provider);
      return profileApi.disconnectIntegration(provider);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.integrations() });
      toast.success("Integration disconnected");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to disconnect");
    },
  });
}

export function useApiKeys() {
  const query = useQuery({
    queryKey: profileKeys.apiKeys(),
    queryFn: async () => {
      if (USE_MOCK) return profileMockApi.getApiKeys();
      const r = await profileApi.getApiKeys();
      return Array.isArray(r) ? r : [];
    },
  });
  const items = safeArray<ApiKey>(query.data);
  return { ...query, items };
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; scopes: string[] }) => {
      if (USE_MOCK) return profileMockApi.createApiKey(input);
      return profileApi.createApiKey(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.apiKeys() });
      toast.success("API key created. Copy it now — it won't be shown again.");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to create API key");
    },
  });
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (USE_MOCK) return profileMockApi.revokeApiKey(id);
      return profileApi.revokeApiKey(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.apiKeys() });
      toast.success("API key revoked");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to revoke");
    },
  });
}

export function useBilling() {
  const query = useQuery({
    queryKey: profileKeys.billing(),
    queryFn: async () => {
      if (USE_MOCK) return profileMockApi.getBilling();
      return profileApi.getBilling();
    },
  });
  const billing = query.data ?? null;
  return { ...query, billing };
}

export function useSessions() {
  const query = useQuery({
    queryKey: profileKeys.sessions(),
    queryFn: async () => {
      if (USE_MOCK) return profileMockApi.getSessions();
      const r = await profileApi.getSessions();
      return Array.isArray(r) ? r : [];
    },
  });
  const items = safeArray<Session>(query.data);
  return { ...query, items };
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      if (USE_MOCK) return profileMockApi.revokeSession(sessionId);
      return profileApi.revokeSession(sessionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.sessions() });
      toast.success("Session revoked");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to revoke session");
    },
  });
}

export function useTwoFactor() {
  const query = useQuery({
    queryKey: profileKeys.twoFactor(),
    queryFn: async () => {
      if (USE_MOCK) return profileMockApi.getTwoFactor();
      return profileApi.getTwoFactor();
    },
  });
  const config = query.data ?? null;
  return { ...query, config };
}

export function useUpdateTwoFactor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (enabled: boolean) => {
      if (USE_MOCK) return profileMockApi.updateTwoFactor(enabled);
      return profileApi.updateTwoFactor(enabled);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.twoFactor(), data);
      toast.success(data?.enabled ? "2FA enabled" : "2FA disabled");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update 2FA");
    },
  });
}

export function usePreferences() {
  const query = useQuery({
    queryKey: profileKeys.preferences(),
    queryFn: async () => {
      if (USE_MOCK) return profileMockApi.getPreferences();
      return profileApi.getPreferences();
    },
  });
  const preferences = query.data ?? null;
  return { ...query, preferences };
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (prefs: Partial<UserPreference["preferences"]>) => {
      if (USE_MOCK) return profileMockApi.updatePreferences(prefs);
      return profileApi.updatePreferences(prefs);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.preferences(), data);
      toast.success("Preferences saved");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to save preferences");
    },
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: async (payload: { currentPassword: string; newPassword: string }) => {
      if (USE_MOCK) return profileMockApi.updatePassword(payload);
      return profileApi.updatePassword(payload);
    },
    onSuccess: () => {
      toast.success("Password updated");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update password");
    },
  });
}
