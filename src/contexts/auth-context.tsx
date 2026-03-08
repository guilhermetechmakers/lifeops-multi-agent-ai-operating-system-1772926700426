/**
 * LifeOps Auth context: session, user, RBAC, and auth actions.
 * Persists token in localStorage; guards all array/object access.
 * Syncs with Supabase Auth when configured.
 */

import * as React from "react";
import type { User, AuthResponse } from "@/types/auth";
import * as authApi from "@/api/auth";
import { toast } from "sonner";
import { isSupabaseConfigured } from "@/lib/supabase";
import * as supabaseAuth from "@/lib/supabase-auth";

const AUTH_TOKEN_KEY = "auth_token";
const AUTH_USER_KEY = "auth_user";

function readStoredSession(): { token: string; user: User | null } {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY) ?? "";
    const raw = localStorage.getItem(AUTH_USER_KEY);
    const user = raw ? (JSON.parse(raw) as User) : null;
    return { token, user };
  } catch {
    return { token: "", user: null };
  }
}

function writeStoredSession(token: string, user: User | null): void {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, user ? JSON.stringify(user) : "");
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  }
}

interface AuthState {
  user: User | null;
  token: string;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<AuthResponse | void>;
  signup: (input: {
    email: string;
    password: string;
    displayName?: string;
    company?: string;
    inviteCode?: string;
    acceptTerms: boolean;
  }) => Promise<AuthResponse | void>;
  logout: () => void;
  setSession: (response: AuthResponse) => void;
  hasRole: (role: string) => boolean;
}

type AuthContextValue = AuthState & AuthActions;

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AuthState>(() => {
    const { token, user } = readStoredSession();
    return {
      token,
      user,
      isLoading: isSupabaseConfigured(),
      isAuthenticated: Boolean(token),
    };
  });

  React.useEffect(() => {
    let cancelled = false;

    if (isSupabaseConfigured()) {
      supabaseAuth.supabaseGetSession().then((session) => {
        if (cancelled) return;
        if (session?.token && session?.user) {
          writeStoredSession(session.token, session.user);
          setState({
            token: session.token,
            user: session.user,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setState((s) => ({ ...s, isLoading: false }));
        }
      }).catch(() => {
        if (!cancelled) setState((s) => ({ ...s, isLoading: false }));
      });
      return () => { cancelled = true };
    }

    const { token } = readStoredSession();
    if (token) {
      authApi.getMe().then((me) => {
        if (cancelled) return;
        if (me) {
          writeStoredSession(token, me);
          setState({
            token,
            user: me,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setState((s) => ({ ...s, isLoading: false }));
        }
      }).catch(() => {
        if (!cancelled) setState((s) => ({ ...s, isLoading: false }));
      });
    } else {
      setState((s) => ({ ...s, isLoading: false }));
    }
    return () => { cancelled = true };
  }, []);

  const setSession = React.useCallback((response: AuthResponse) => {
    const user = response?.user ?? null;
    const token = response?.token ?? "";
    writeStoredSession(token, user);
    setState({
      token,
      user,
      isLoading: false,
      isAuthenticated: Boolean(token),
    });
  }, []);

  const logout = React.useCallback(async () => {
    if (isSupabaseConfigured()) {
      try {
        await supabaseAuth.supabaseLogout();
      } catch {
        // ignore
      }
    }
    writeStoredSession("", null);
    setState({
      token: "",
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }, []);

  const login = React.useCallback(
    async (email: string, password: string, rememberMe?: boolean): Promise<AuthResponse | void> => {
      setState((s) => ({ ...s, isLoading: true }));
      try {
        const response = await authApi.login({ email, password, rememberMe });
        setSession(response);
        toast.success("Signed in successfully");
        return response;
      } catch (err) {
        setState((s) => ({ ...s, isLoading: false }));
        toast.error(err instanceof Error ? err.message : "Sign in failed");
        throw err;
      }
    },
    [setSession]
  );

  const signup = React.useCallback(
    async (input: {
      email: string;
      password: string;
      displayName?: string;
      company?: string;
      inviteCode?: string;
      acceptTerms: boolean;
    }): Promise<AuthResponse | void> => {
      setState((s) => ({ ...s, isLoading: true }));
      try {
        const response = await authApi.signup(input);
        setSession(response);
        toast.success("Account created successfully");
        return response;
      } catch (err) {
        setState((s) => ({ ...s, isLoading: false }));
        toast.error(err instanceof Error ? err.message : "Sign up failed");
        throw err;
      }
    },
    [setSession]
  );

  const hasRole = React.useCallback(
    (role: string): boolean => {
      const roles = (state.user?.roles ?? []) as string[];
      return Array.isArray(roles) && roles.includes(role);
    },
    [state.user]
  );

  const value = React.useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      signup,
      logout,
      setSession,
      hasRole,
    }),
    [state, login, signup, logout, setSession, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    return {
      user: null,
      token: "",
      isLoading: false,
      isAuthenticated: false,
      login: async () => undefined,
      signup: async () => undefined,
      logout: () => {},
      setSession: () => {},
      hasRole: () => false,
    };
  }
  return ctx;
}

export function useAuthOptional(): AuthContextValue | null {
  return React.useContext(AuthContext);
}
