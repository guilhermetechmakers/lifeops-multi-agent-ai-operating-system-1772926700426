/**
 * LifeOps Auth API - login, signup, OAuth, SSO, password reset, onboarding.
 * Uses native fetch via api client. Falls back to mock when backend is unavailable.
 */

import { api, safeArray } from "@/lib/api";
import type {
  User,
  SignInInput,
  SignUpInput,
  AuthResponse,
  OAuthProvider,
  OnboardingSession,
  OnboardingStep,
} from "@/types/auth";

const AUTH_BASE = "/auth";
const USE_MOCK =
  import.meta.env.VITE_USE_MOCK_AUTH === "true" ||
  !import.meta.env.VITE_API_URL;

function mockUser(email: string, displayName?: string): User {
  return {
    id: "mock-" + Date.now(),
    email,
    displayName: displayName ?? email.split("@")[0],
    roles: ["user"],
    providers: ["email"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/** Login with email/password */
export async function login(input: SignInInput): Promise<AuthResponse> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 500));
    const user = mockUser(input.email);
    return { token: "mock-token", user };
  }
  const data = await api.post<AuthResponse>(`${AUTH_BASE}/login`, input);
  return data ?? { token: "", user: {} as User };
}

/** Sign up with email/password */
export async function signup(input: SignUpInput): Promise<AuthResponse> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 500));
    const user = mockUser(input.email, input.displayName);
    return { token: "mock-token", user };
  }
  const data = await api.post<AuthResponse>(`${AUTH_BASE}/signup`, input);
  return data ?? { token: "", user: {} as User };
}

/** Initiate OAuth flow - returns redirect URL */
export async function initiateOAuth(provider: string): Promise<{ url: string }> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return { url: `/auth/callback?provider=${provider}&mock=1` };
  }
  const data = await api.post<{ url: string }>(`${AUTH_BASE}/oauth/${provider}`, {});
  return data ?? { url: "" };
}

/** Initiate Enterprise SSO */
export async function initiateSSO(domain?: string): Promise<{ url: string }> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return { url: `/auth/callback?provider=sso&domain=${domain ?? ""}&mock=1` };
  }
  const data = await api.post<{ url: string }>(`${AUTH_BASE}/sso/enterprise`, { domain });
  return data ?? { url: "" };
}

/** Request password reset email */
export async function requestPasswordReset(email: string): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 500));
    return;
  }
  await api.post(`${AUTH_BASE}/password-reset/request`, { email });
}

/** Confirm password reset with token */
export async function confirmPasswordReset(
  token: string,
  password: string
): Promise<void> {
  await api.post(`${AUTH_BASE}/password-reset/confirm`, { token, password });
}

/** Get available OAuth providers */
export async function getProviders(): Promise<OAuthProvider[]> {
  const defaults: OAuthProvider[] = [
    { id: "google", name: "Google", clientId: "", scopes: [], authUrl: "", tokenUrl: "", redirectUri: "" },
    { id: "github", name: "GitHub", clientId: "", scopes: [], authUrl: "", tokenUrl: "", redirectUri: "" },
    { id: "microsoft", name: "Microsoft", clientId: "", scopes: [], authUrl: "", tokenUrl: "", redirectUri: "" },
  ];
  if (USE_MOCK) return defaults;
  try {
    const data = await api.get<OAuthProvider[] | { providers?: OAuthProvider[] }>(
      `${AUTH_BASE}/providers`
    );
    if (Array.isArray(data)) return data;
    const providers = (data as { providers?: OAuthProvider[] })?.providers ?? [];
    return Array.isArray(providers) ? providers : defaults;
  } catch {
    return defaults;
  }
}

/** Get onboarding wizard steps */
export async function getOnboardingSteps(): Promise<OnboardingStep[]> {
  const defaults: OnboardingStep[] = [
    { id: "modules", title: "Choose Modules", description: "Select the modules you want to use", order: 0 },
    { id: "integrations", title: "Connect Integrations", description: "Connect your first integrations", order: 1 },
    { id: "rbac", title: "RBAC & Permissions", description: "Set up roles and permissions", order: 2 },
    { id: "finish", title: "Finish", description: "You're all set", order: 3 },
  ];
  if (USE_MOCK) return defaults;
  try {
    const data = await api.get<OnboardingStep[] | { steps?: OnboardingStep[] }>(
      `${AUTH_BASE}/onboard/steps`
    );
    if (Array.isArray(data)) return data;
    const steps = (data as { steps?: OnboardingStep[] })?.steps ?? [];
    return safeArray(steps).length > 0 ? safeArray(steps) : defaults;
  } catch {
    return defaults;
  }
}

/** Submit onboarding progress */
export async function submitOnboarding(
  sessionId: string,
  stepIndex: number,
  data: Record<string, unknown>
): Promise<OnboardingSession> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return {
      id: sessionId,
      userId: "mock",
      currentStep: stepIndex,
      data: data as { modules?: string[]; integrations?: string[]; roles?: string[] },
      isCompleted: stepIndex >= 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
  const result = await api.patch<OnboardingSession>(
    `${AUTH_BASE}/signup/onboard`,
    { sessionId, stepIndex, data }
  );
  return result ?? ({} as OnboardingSession);
}

/** Exchange OAuth/SSO callback code or mock params for session */
export async function exchangeOAuthCallback(
  provider: string,
  params: { code?: string; state?: string; mock?: string }
): Promise<AuthResponse> {
  if (USE_MOCK && params.mock === "1") {
    await new Promise((r) => setTimeout(r, 400));
    const user = mockUser("oauth@example.com");
    user.providers = [provider];
    return { token: "mock-token", user };
  }
  try {
    const data = await api.post<AuthResponse>(`${AUTH_BASE}/oauth/callback`, {
      provider,
      code: params.code,
      state: params.state,
    });
    return data ?? { token: "", user: {} as User };
  } catch {
    return { token: "", user: {} as User };
  }
}
