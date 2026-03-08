/**
 * LifeOps Auth API - login, signup, OAuth, SSO, password reset, onboarding.
 * Uses Supabase Auth when configured; otherwise native fetch via api client or mock.
 */

import { api, safeArray } from "@/lib/api";
import { isSupabaseConfigured } from "@/lib/supabase";
import * as supabaseAuth from "@/lib/supabase-auth";
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
  if (isSupabaseConfigured()) {
    try {
      const result = await supabaseAuth.supabaseLogin(input.email, input.password);
      if (result) return result;
    } catch (err) {
      throw err;
    }
  }
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
  if (isSupabaseConfigured()) {
    try {
      const result = await supabaseAuth.supabaseSignUp({
        email: input.email,
        password: input.password,
        displayName: input.displayName,
      });
      if (result) return result;
    } catch (err) {
      throw err;
    }
  }
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 500));
    const user = mockUser(input.email, input.displayName);
    return { token: "mock-token", user };
  }
  const data = await api.post<AuthResponse>(`${AUTH_BASE}/signup`, input);
  return data ?? { token: "", user: {} as User };
}

/** Get current user (auth/me) — for session rehydration and RBAC */
export async function getMe(): Promise<User | null> {
  if (isSupabaseConfigured()) {
    try {
      const session = await supabaseAuth.supabaseGetSession();
      return session?.user ?? null;
    } catch {
      return null;
    }
  }
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    return null;
  }
  try {
    const data = await api.get<User | { user?: User }>(`${AUTH_BASE}/me`);
    if (data && typeof data === "object" && "id" in data) return data as User;
    const user = (data as { user?: User })?.user ?? null;
    return user;
  } catch {
    return null;
  }
}

/** Refresh access token — backend returns new token + user */
export async function refresh(): Promise<AuthResponse | null> {
  if (isSupabaseConfigured()) {
    try {
      const session = await supabaseAuth.supabaseGetSession();
      if (session?.token && session?.user) return session;
      return null;
    } catch {
      return null;
    }
  }
  if (USE_MOCK) return null;
  try {
    const data = await api.post<AuthResponse>(`${AUTH_BASE}/refresh`, {});
    return data ?? null;
  } catch {
    return null;
  }
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
export async function requestPasswordReset(email: string): Promise<{ success: boolean; message?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const result = await supabaseAuth.supabaseRequestPasswordReset(email);
      return result;
    } catch {
      return { success: false, message: "Failed to send reset email." };
    }
  }
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 500));
    return { success: true, message: "If this email is registered, you will receive a reset link." };
  }
  const data = await api.post<{ success?: boolean; message?: string }>(`${AUTH_BASE}/password-reset/request`, { email });
  return { success: data?.success ?? true, message: data?.message };
}

/** Verify password reset token */
export async function verifyPasswordResetToken(token: string): Promise<{
  valid: boolean;
  userId?: string;
  requiresMfa?: boolean;
}> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return { valid: token.length >= 6, userId: "mock-user" };
  }
  const data = await api.post<{ valid?: boolean; userId?: string; requiresMfa?: boolean }>(
    `${AUTH_BASE}/password-reset/verify`,
    { token }
  );
  return {
    valid: data?.valid ?? false,
    userId: data?.userId,
    requiresMfa: data?.requiresMfa,
  };
}

/** Set new password after token verification */
export async function setNewPassword(
  token: string,
  newPassword: string
): Promise<{ success: boolean; session?: AuthResponse; user?: User }> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 500));
    const user = mockUser("reset@example.com");
    return { success: true, session: { token: "mock-token", user }, user };
  }
  const data = await api.post<{ success?: boolean; session?: AuthResponse; user?: User }>(
    `${AUTH_BASE}/password-reset/set`,
    { token, newPassword }
  );
  return {
    success: data?.success ?? false,
    session: data?.session,
    user: data?.user,
  };
}

/** @deprecated Use setNewPassword instead. Kept for backward compatibility. */
export async function confirmPasswordReset(
  token: string,
  password: string
): Promise<void> {
  const result = await setNewPassword(token, password);
  if (!result.success) throw new Error("Password reset failed");
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
    { id: "profile", title: "Profile Basics", description: "Choose your account type", order: 0 },
    { id: "security", title: "Security & RBAC", description: "Set your security scope", order: 1 },
    { id: "modules", title: "Permissions & Modules", description: "Select the modules you want to use", order: 2 },
    { id: "tasks", title: "Onboarding Tasks", description: "Connect your first integrations", order: 3 },
    { id: "review", title: "Review & Create", description: "You're all set", order: 4 },
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
      isCompleted: stepIndex >= 4,
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

/** Verify email token from verification link */
export interface VerifyEmailSuccess {
  success: true;
  user: { id: string; email: string; verified?: boolean; onboardingComplete?: boolean };
  needsOnboarding: boolean;
  next: "dashboard" | "onboarding";
  /** Optional session to establish on success (token + user) */
  session?: AuthResponse;
}

export interface VerifyEmailFailure {
  success: false;
  errorCode: "TOKEN_EXPIRED" | "TOKEN_INVALID" | "ALREADY_VERIFIED" | "USER_NOT_FOUND";
  message: string;
}

export type VerifyEmailResponse = VerifyEmailSuccess | VerifyEmailFailure;

export async function verifyEmail(token: string): Promise<VerifyEmailResponse> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 500));
    if (!token || token.length < 6) {
      return {
        success: false,
        errorCode: "TOKEN_INVALID",
        message: "This verification link is invalid. Request a new one.",
      };
    }
    const user = mockUser("verified@example.com");
    return {
      success: true,
      user: { id: user.id, email: user.email, verified: true, onboardingComplete: false },
      needsOnboarding: true,
      next: "onboarding",
      session: { token: "mock-token", user },
    };
  }
  try {
    const result = await api.post<VerifyEmailResponse>(`${AUTH_BASE}/verify-email`, { token });
    const data = result ?? ({} as VerifyEmailResponse);
    if (data?.success === true) {
      return data as VerifyEmailSuccess;
    }
    return (data as VerifyEmailFailure) ?? {
      success: false,
      errorCode: "TOKEN_INVALID" as const,
      message: "Verification failed. Please try again.",
    };
  } catch {
    return {
      success: false,
      errorCode: "TOKEN_INVALID",
      message: "Verification failed. Please try again.",
    };
  }
}

/** Resend verification email */
export interface ResendVerificationResponse {
  success: boolean;
  nextRetryInSeconds?: number;
  message?: string;
}

export async function resendVerification(params: {
  email?: string;
  userId?: string;
}): Promise<ResendVerificationResponse> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    return {
      success: true,
      nextRetryInSeconds: 60,
      message: "Verification email sent. Check your inbox.",
    };
  }
  try {
    const result = await api.post<ResendVerificationResponse>(
      `${AUTH_BASE}/resend-verification`,
      params
    );
    const data = result ?? {};
    return {
      success: data?.success ?? false,
      nextRetryInSeconds: data?.nextRetryInSeconds ?? 60,
      message: data?.message ?? "Verification email sent.",
    };
  } catch {
    return {
      success: false,
      nextRetryInSeconds: 60,
      message: "Failed to send verification email. Try again later.",
    };
  }
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
