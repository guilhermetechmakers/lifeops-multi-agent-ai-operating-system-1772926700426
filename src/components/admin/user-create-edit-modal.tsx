/**
 * UserCreateEditModal — Create/Edit user form with validation.
 */

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateAdminUser, useUpdateAdminUser } from "@/hooks/use-admin";
import type { AdminUser, Org, Role } from "@/types/admin";

const schema = z.object({
  name: z.string().min(1, "Name required"),
  email: z.string().email("Invalid email"),
  password: z.string().optional(),
  orgId: z.string().min(1, "Organization required"),
  roles: z.array(z.string()).default([]),
});

type FormValues = z.infer<typeof schema>;

export interface UserCreateEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser | null;
  orgs: Org[];
  roles: Role[];
  onSuccess?: () => void;
}

export function UserCreateEditModal({
  open,
  onOpenChange,
  user,
  orgs,
  roles,
  onSuccess,
}: UserCreateEditModalProps) {
  const createUser = useCreateAdminUser();
  const updateUser = useUpdateAdminUser();
  const isEdit = !!user?.id;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      orgId: "",
      roles: [],
    },
  });

  const orgId = watch("orgId");
  const selectedRoles = watch("roles") ?? [];

  const toggleRole = (roleName: string) => {
    const current = selectedRoles as string[];
    const next = current.includes(roleName)
      ? current.filter((r) => r !== roleName)
      : [...current, roleName];
    setValue("roles", next);
  };

  useEffect(() => {
    if (open) {
      reset({
        name: user?.name ?? "",
        email: user?.email ?? "",
        password: "",
        orgId: user?.orgId ?? (orgs?.[0]?.id ?? ""),
        roles: Array.isArray(user?.roles) ? user.roles : [],
      });
    }
  }, [open, user, orgs, reset]);

  const onSubmit = async (values: FormValues) => {
    if (isEdit && user?.id) {
      await updateUser.mutateAsync({
        id: user.id,
        payload: {
          name: values.name,
          email: values.email,
          orgId: values.orgId,
          roles: values.roles,
        },
      });
    } else {
      await createUser.mutateAsync({
        name: values.name,
        email: values.email,
        orgId: values.orgId,
        roles: values.roles,
        status: "active",
        lastActiveAt: null,
      });
    }
    onSuccess?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit user" : "Create user"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} className="mt-1" />
            {errors.name && (
              <p className="mt-1 text-xs text-[#FF3B30]">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} className="mt-1" disabled={isEdit} />
            {errors.email && (
              <p className="mt-1 text-xs text-[#FF3B30]">{errors.email.message}</p>
            )}
          </div>
          {!isEdit && (
            <div>
              <Label htmlFor="password">Password (optional)</Label>
              <Input id="password" type="password" {...register("password")} className="mt-1" />
            </div>
          )}
          <div>
            <Label>Organization</Label>
            <Select value={orgId} onValueChange={(v) => setValue("orgId", v)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select org" />
              </SelectTrigger>
              <SelectContent>
                {(orgs ?? []).map((o) => (
                  <SelectItem key={o?.id ?? ""} value={o?.id ?? ""}>
                    {o?.name ?? "—"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Roles</Label>
            <div className="mt-2 flex flex-wrap gap-3">
              {(roles ?? []).map((r) => (
                <label key={r?.id ?? ""} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={(selectedRoles as string[]).includes(r?.name ?? "")}
                    onCheckedChange={() => toggleRole(r?.name ?? "")}
                  />
                  {r?.name ?? "—"}
                </label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createUser.isPending || updateUser.isPending}>
              {isEdit ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
