/**
 * OrgCreateEditModal — Create/Edit organization form.
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
import { Switch } from "@/components/ui/switch";
import { useCreateAdminOrg, useUpdateAdminOrg } from "@/hooks/use-admin";
import type { Org } from "@/types/admin";

const schema = z.object({
  name: z.string().min(1, "Name required"),
  ssoEnabled: z.boolean().default(false),
});

type FormValues = z.infer<typeof schema>;

export interface OrgCreateEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  org: Org | null;
  onSuccess?: () => void;
}

export function OrgCreateEditModal({
  open,
  onOpenChange,
  org,
  onSuccess,
}: OrgCreateEditModalProps) {
  const createOrg = useCreateAdminOrg();
  const updateOrg = useUpdateAdminOrg();
  const isEdit = !!org?.id;

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
      ssoEnabled: false,
    },
  });

  const ssoEnabled = watch("ssoEnabled");

  useEffect(() => {
    if (open) {
      reset({
        name: org?.name ?? "",
        ssoEnabled: org?.ssoEnabled ?? false,
      });
    }
  }, [open, org, reset]);

  const onSubmit = async (values: FormValues) => {
    if (isEdit && org?.id) {
      await updateOrg.mutateAsync({
        id: org.id,
        payload: {
          name: values.name,
          ssoEnabled: values.ssoEnabled,
        },
      });
    } else {
      await createOrg.mutateAsync({
        name: values.name,
        ssoEnabled: values.ssoEnabled,
      });
    }
    onSuccess?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/[0.03] bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit organization" : "Create organization"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="org-name">Name</Label>
            <Input
              id="org-name"
              {...register("name")}
              className="mt-1 border-white/[0.03]"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="org-sso">SSO enabled</Label>
            <Switch
              id="org-sso"
              checked={ssoEnabled}
              onCheckedChange={(v) => setValue("ssoEnabled", v)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createOrg.isPending || updateOrg.isPending}>
              {isEdit ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
