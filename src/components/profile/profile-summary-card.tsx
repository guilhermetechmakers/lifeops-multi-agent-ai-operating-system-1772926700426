/**
 * Profile summary card: avatar, name, email, edit controls.
 */

import { Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/use-profile";
import { cn } from "@/lib/utils";

interface ProfileSummaryCardProps {
  onEditClick?: () => void;
  className?: string;
}

function getInitials(displayName: string, email: string): string {
  if (displayName?.trim()) {
    const parts = displayName.trim().split(/\s+/);
    if (parts.length >= 2)
      return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
    return (displayName[0] ?? "").toUpperCase();
  }
  const local = (email ?? "").split("@")[0];
  return (local[0] ?? "?").toUpperCase();
}

export function ProfileSummaryCard({ onEditClick, className }: ProfileSummaryCardProps) {
  const { profile, isLoading } = useProfile();
  const displayName =
    profile?.displayName ??
    (profile?.firstName && profile?.lastName
      ? `${profile.firstName} ${profile.lastName}`.trim()
      : "");
  const email = profile?.email ?? "";
  const avatarUrl = profile?.avatarUrl ?? undefined;

  if (isLoading) {
    return (
      <div
        className={cn(
          "rounded-xl border border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B] p-5 animate-pulse",
          className
        )}
      >
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 shrink-0 rounded-full bg-secondary" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-32 rounded bg-secondary" />
            <div className="h-4 w-48 rounded bg-secondary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B] p-5 transition-all duration-200 hover:shadow-card-hover",
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <Avatar className="h-14 w-14 shrink-0 rounded-full border-2 border-white/[0.06]">
            <AvatarImage src={avatarUrl} alt={displayName || "Profile"} />
            <AvatarFallback className="bg-secondary text-muted-foreground text-lg">
              {getInitials(displayName, email)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-foreground">
              {displayName || "No name"}
            </h2>
            <p className="truncate text-sm text-muted-foreground">{email || "—"}</p>
          </div>
        </div>
        {onEditClick && (
          <Button
            variant="outline"
            size="sm"
            onClick={onEditClick}
            className="shrink-0"
            aria-label="Edit profile"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
