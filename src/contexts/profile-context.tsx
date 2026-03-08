/**
 * Profile context: exposes profile and preferences to child modules.
 * Safe defaults for null/undefined; consumed by profile and settings pages.
 */

import * as React from "react";
import { useProfile } from "@/hooks/use-profile";
import { usePreferences } from "@/hooks/use-profile";
import type { UserProfile, UserPreference } from "@/types/profile";

interface ProfileContextValue {
  profile: UserProfile | null;
  preferences: UserPreference | null;
  isProfileLoading: boolean;
  isPreferencesLoading: boolean;
}

const defaultContextValue: ProfileContextValue = {
  profile: null,
  preferences: null,
  isProfileLoading: false,
  isPreferencesLoading: false,
};

const ProfileContext = React.createContext<ProfileContextValue>(defaultContextValue);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { profile, isLoading: isProfileLoading } = useProfile();
  const { preferences, isLoading: isPreferencesLoading } = usePreferences();

  const value: ProfileContextValue = React.useMemo(
    () => ({
      profile: profile ?? null,
      preferences: preferences ?? null,
      isProfileLoading: isProfileLoading ?? false,
      isPreferencesLoading: isPreferencesLoading ?? false,
    }),
    [profile, preferences, isProfileLoading, isPreferencesLoading]
  );

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfileContext(): ProfileContextValue {
  const ctx = React.useContext(ProfileContext);
  return ctx ?? defaultContextValue;
}
