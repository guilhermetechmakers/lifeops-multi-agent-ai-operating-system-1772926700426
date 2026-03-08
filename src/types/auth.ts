/**
 * LifeOps Auth types for JWT sessions, RBAC, OAuth, and SSO.
 */

export interface User {
  id: string;
  email: string;
  displayName?: string;
  full_name?: string;
  avatar_url?: string;
  roles: string[];
  providers: string[];
  ssoEnabled?: boolean;
  onboardingStatus?: string;
  created_at: string;
  updated_at: string;
}

export interface SignInInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignUpInput {
  email: string;
  password: string;
  displayName?: string;
  company?: string;
  inviteCode?: string;
  acceptTerms: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresAt?: string;
}

export interface OAuthProvider {
  id: string;
  name: string;
  clientId: string;
  scopes: string[];
  authUrl: string;
  tokenUrl: string;
  redirectUri: string;
}

export interface OnboardingSession {
  id: string;
  userId: string;
  currentStep: number;
  data: OnboardingData;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingData {
  modules?: string[];
  integrations?: string[];
  roles?: string[];
}

export interface OnboardingStep {
  id: string;
  title: string;
  description?: string;
  order: number;
}

export interface SessionToken {
  token: string;
  expiresAt: string;
  userId: string;
}
