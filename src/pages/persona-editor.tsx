/**
 * Persona Editor — create/edit persona with structured fields and live preview.
 */

import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnimatedPage } from "@/components/animated-page";
import { usePersona, useUpdatePersona, useCreatePersona } from "@/hooks/use-personas";
import type { TemplateDomain } from "@/types/templates-personas";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  domain: z.enum(["developer", "content", "finance", "health"]),
  tone: z.string(),
  allowedTools: z.string(),
});

type FormValues = z.infer<typeof schema>;

const DOMAIN_OPTIONS: { value: TemplateDomain; label: string }[] = [
  { value: "developer", label: "Developer" },
  { value: "content", label: "Content" },
  { value: "finance", label: "Finance" },
  { value: "health", label: "Health" },
];

export default function PersonaEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === "new";

  const { data: persona, isLoading } = usePersona(isNew ? null : id ?? null);
  const updateMutation = useUpdatePersona();
  const createMutation = useCreatePersona();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      domain: "developer",
      tone: "professional",
      allowedTools: "",
    },
  });

  useEffect(() => {
    if (persona) {
      setValue("name", persona.name ?? "");
      setValue("description", persona.description ?? "");
      setValue("domain", persona.domain ?? "developer");
      setValue("tone", persona.tone ?? "professional");
      setValue(
        "allowedTools",
        Array.isArray(persona.allowedTools) ? persona.allowedTools.join(", ") : ""
      );
    }
  }, [persona, setValue]);

  const watched = watch();
  const previewPrompt = `You are ${watched.name}. ${watched.description || "No description."} Tone: ${watched.tone}.`;

  const onSubmit = (values: FormValues) => {
    const tools = values.allowedTools
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (isNew) {
      createMutation.mutate(
        {
          name: values.name,
          description: values.description,
          domain: values.domain,
          tone: values.tone,
          allowedTools: tools,
        },
        {
          onSuccess: (p) => navigate(`/dashboard/templates-personas/personas/${p.id}`),
        }
      );
    } else if (id) {
      updateMutation.mutate(
        {
          id,
          payload: {
            name: values.name,
            description: values.description,
            domain: values.domain,
            tone: values.tone,
            allowedTools: tools,
          },
        },
        { onSuccess: () => navigate(`/dashboard/templates-personas/personas/${id}`) }
      );
    }
  };

  if (!isNew && isLoading) {
    return (
      <AnimatedPage>
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-secondary rounded" />
          <div className="h-40 bg-secondary rounded" />
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard/templates-personas/personas")}
          aria-label="Back to personas"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold text-foreground">
          {isNew ? "New persona" : "Edit persona"}
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          <Card className="border-white/[0.03] bg-card">
            <CardHeader>
              <h3 className="text-sm font-medium">Basic info</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  {...register("name")}
                  className="mt-1"
                  placeholder="e.g. Developer Triage"
                />
                {errors.name && (
                  <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  className="mt-1 min-h-[80px]"
                  placeholder="Describe the persona's role and behavior"
                />
              </div>
              <div>
                <Label htmlFor="domain">Domain</Label>
                <Select
                  value={watched.domain}
                  onValueChange={(v) => setValue("domain", v as TemplateDomain)}
                >
                  <SelectTrigger id="domain" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOMAIN_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tone">Tone</Label>
                <Input
                  id="tone"
                  {...register("tone")}
                  className="mt-1"
                  placeholder="e.g. professional, friendly"
                />
              </div>
              <div>
                <Label htmlFor="allowedTools">Allowed tools (comma-separated)</Label>
                <Input
                  id="allowedTools"
                  {...register("allowedTools")}
                  className="mt-1"
                  placeholder="git, pr, issues"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-white/[0.03] bg-card sticky top-24">
            <CardHeader>
              <h3 className="text-sm font-medium">Live preview</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {previewPrompt}
              </p>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={updateMutation.isPending || createMutation.isPending}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isNew ? "Create" : "Save"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard/templates-personas/personas")}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </AnimatedPage>
  );
}
