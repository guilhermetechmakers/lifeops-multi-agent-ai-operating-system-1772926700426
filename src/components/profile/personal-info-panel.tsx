import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile, useUpdateProfile } from "@/hooks/use-profile";
import { Skeleton } from "@/components/ui/skeleton";

const personalInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  displayName: z.string().min(1, "Display name is required"),
  phone: z.string().optional(),
});

type PersonalInfoForm = z.infer<typeof personalInfoSchema>;

export function PersonalInfoPanel() {
  const { data: profile, isLoading } = useProfile();
  const update = useUpdateProfile();
  const [isEditing, setIsEditing] = useState(false);

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

  return (
    <Card className="border-white/[0.03] bg-card">
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <p className="text-sm text-muted-foreground">
          Update your name, display name, and contact details
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
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
