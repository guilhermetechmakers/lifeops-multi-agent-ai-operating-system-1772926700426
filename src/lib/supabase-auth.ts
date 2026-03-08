/**
 * Supabase Auth adapter for LifeOps.
 * When Supabase is configured, uses Supabase Auth for login/signup/password reset.
 * Maps Supabase session/user to LifeOps AuthResponse shape.
 */

import { getSupabaseClient, isSupabaseConfigured } from "./supabase";
import type { User, AuthResponse } from "@/types/auth";

export async function supabaseLogin(
  email: string,
  password: string
): Promise<AuthResponse | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await (supabase as { auth: { signInWithPassword: (opts: { email: string; password: string }) => Promise<{ data: { session: { access_token: string }; user: Record<string, unknown> }; error: unknown }> } }).auth.signInWithPassword({ email, password });
  if (error) throw new Error((error as { message?: string })?.message ?? "Sign in failed");
  if (!data?.session?.access_token || !data?.user) return null;
  const user = mapSupabaseUserToLifeOps(data.user as Record<string, unknown>);
  return { token: data.session.access_token, user };
}

export async function supabaseSignUp(input: {
  email: string;
  password: string;
  displayName?: string;
}): Promise<AuthResponse | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await (supabase as { auth: { signUp: (opts: { email: string; password: string; options?: { data?: Record<string, unknown> } }) => Promise<{ data: { session: { access_token: string } | null; user: Record<string, unknown> }; error: unknown }> } }).auth.signUp({
    email: input.email,
    password: input.password,
    options: { data: { full_name: input.displayName ?? "" } },
  });
  if (error) throw new Error((error as { message?: string })?.message ?? "Sign up failed");
  const user = mapSupabaseUserToLifeOps(data?.user as Record<string, unknown>);
  const token = data?.session?.access_token ?? "";
  return { token, user };
}

export async function supabaseLogout(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = await getSupabaseClient();
  if (supabase) await (supabase as { auth: { signOut: () => Promise<void> } }).auth.signOut();
}

export async function supabaseGetSession(): Promise<AuthResponse | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await getSupabaseClient();
  if (!supabase) return null;
  const { data } = await (supabase as { auth: { getSession: () => Promise<{ data: { session: { access_token: string } | null; user: Record<string, unknown> | null } }> } }).auth.getSession();
  if (!data?.session?.access_token || !data?.user) return null;
  const user = mapSupabaseUserToLifeOps(data.user as Record<string, unknown>);
  return { token: data.session.access_token, user };
}

export async function supabaseRequestPasswordReset(email: string): Promise<{ success: boolean; message?: string }> {
  if (!isSupabaseConfigured()) return { success: false };
  const supabase = await getSupabaseClient();
  if (!supabase) return { success: false };
  const { error } = await (supabase as { auth: { resetPasswordForEmail: (email: string) => Promise<{ error: unknown }> } }).auth.resetPasswordForEmail(email);
  if (error) return { success: false, message: (error as { message?: string })?.message };
  return { success: true, message: "Check your email for the reset link." };
}

function mapSupabaseUserToLifeOps(supabaseUser: Record<string, unknown>): User {
  const id = String(supabaseUser?.id ?? "");
  const email = String(supabaseUser?.email ?? "");
  const raw = supabaseUser?.user_metadata as Record<string, unknown> | undefined;
  const displayName = String(raw?.full_name ?? raw?.name ?? email.split("@")[0] ?? "");
  return {
    id,
    email,
    displayName: displayName || undefined,
    full_name: displayName || undefined,
    avatar_url: raw?.avatar_url as string | undefined,
    roles: Array.isArray(raw?.roles) ? (raw.roles as string[]) : ["user"],
    providers: Array.isArray(supabaseUser?.app_metadata?.providers) ? (supabaseUser.app_metadata.providers as string[]) : ["email"],
    created_at: String(supabaseUser?.created_at ?? new Date().toISOString()),
    updated_at: String(supabaseUser?.updated_at ?? new Date().toISOString()),
  };
}
