import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Loader2, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfile, useUpdateProfile, useUploadAvatar } from "@/hooks/use-profile";
import { Skeleton } from "@/components/ui/skeleton";

const personalInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  displayName: z.string().min(1, "Display name is required"),
  phone: z.string().optional(),
});

type PersonalInfoForm = z.infer<typeof personalInfoSchema>;

function getInitials(displayName: string, email: string): string {
  if (displayName?.trim()) {
    const parts = displayName.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
    return (displayName[0] ?? "?").toUpperCase();
  }
  const local = (email ?? "").split("@")[0];
  return (local[0] ?? "?").toUpperCase();
}

export function PersonalInfoPanel() {
  const { data: profile, isLoading } = useProfile();
  const update = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<PersonalInfoForm>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: profile?.firstName ?? "",
      lastName: profile?.lastName ?? "",
      displayName: profile?.displayName ?? "",
      phone: profile?.phone ?? "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        firstName: profile.firstName ?? "",
        lastName: profile.lastName ?? "",
        displayName: profile.displayName ?? "",
        phone: profile.phone ?? "",
      });
    }
  }, [profile, form]);

  const onSubmit = form.handleSubmit((data) => {
    update.mutate(
      {
        firstName: data.firstName,
        lastName: data.lastName,
        displayName: data.displayName,
        phone: data.phone || null,
      },
      {
        onSuccess: () => setIsEditing(false),
      }
    );
  });

  if (isLoading) {
    return (
      <Card className="border-white/[0.03] bg-card">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  const displayName =
    profile?.displayName ??
    (profile?.firstName && profile?.lastName
      ? `${profile.firstName} ${profile.lastName}`.trim()
      : "");
  const avatarUrl = profile?.avatarUrl ?? undefined;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && /^image\/(jpeg|png|gif|webp)$/i.test(file.type)) {
      const formData = new FormData();
      formData.append("avatar", file);
      uploadAvatar.mutate(formData);
    }
    e.target.value = "";
  };

  return (
    <Card className="border-white/[0.03] bg-card">
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <p className="text-sm text-muted-foreground">
          Update your name, display name, avatar, and contact details
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Avatar className="h-20 w-20 shrink-0 rounded-full border-2 border-white/[0.06]">
                <AvatarImage src={avatarUrl} alt={displayName || "Profile"} />
                <AvatarFallback className="bg-secondary text-muted-foreground text-xl">
                  {getInitials(displayName, profile?.email ?? "")}
                </AvatarFallback>
              </Avatar>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
                aria-label="Upload avatar"
              />
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-md transition-transform hover:scale-105"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadAvatar.isPending}
                aria-label="Change avatar"
              >
                {uploadAvatar.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Profile photo</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                JPG, PNG, GIF or WebP. Max 5MB.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                {...form.register("firstName")}
                className="bg-input border-white/[0.03]"
                disabled={!isEditing}
              />
              {form.formState.errors.firstName && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.firstName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                {...form.register("lastName")}
                className="bg-input border-white/[0.03]"
                disabled={!isEditing}
              />
              {form.formState.errors.lastName && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.lastName.message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName">Display name</Label>
            <Input
              id="displayName"
              {...form.register("displayName")}
              className="bg-input border-white/[0.03]"
              disabled={!isEditing}
            />
            {form.formState.errors.displayName && (
              <p className="text-xs text-destructive">
                {form.formState.errors.displayName.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile?.email ?? ""}
              className="bg-input border-white/[0.03] text-muted-foreground"
              readOnly
              disabled
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed here. Contact support if needed.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              {...form.register("phone")}
              placeholder="+1 555 000 0000"
              className="bg-input border-white/[0.03]"
              disabled={!isEditing}
            />
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button type="button" variant="outline" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            ) : (
              <>
                <Button type="submit" disabled={update.isPending}>
                  {update.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span className="ml-2">Save</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(false);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
