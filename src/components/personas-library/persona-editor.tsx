/**
 * Persona editor with structured fields and live preview.
 */

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import type { Persona, TemplateDomain } from "@/types/templates-personas";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  domain: z.enum(["developer", "content", "finance", "health"]),
  tone: z.string().optional(),
  allowedTools: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const DOMAINS: { value: TemplateDomain; label: string }[] = [
  { value: "developer", label: "Developer" },
  { value: "content", label: "Content" },
  { value: "finance", label: "Finance" },
  { value: "health", label: "Health" },
];

export interface PersonaEditorProps {
  persona: Persona | null;
  onSave: (payload: Partial<Persona>) => void;
  isSaving?: boolean;
}

export function PersonaEditor({
  persona,
  onSave,
  isSaving,
}: PersonaEditorProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: persona
      ? {
          name: persona.name ?? "",
          description: persona.description ?? "",
          domain: persona.domain ?? "developer",
          tone: persona.tone ?? "",
          allowedTools: (persona.allowedTools ?? []).join(", "),
        }
      : {
          name: "",
          description: "",
          domain: "developer",
          tone: "",
          allowedTools: "",
        },
  });

  useEffect(() => {
    if (persona) {
      reset({
        name: persona.name ?? "",
        description: persona.description ?? "",
        domain: persona.domain ?? "developer",
        tone: persona.tone ?? "",
        allowedTools: (persona.allowedTools ?? []).join(", "),
      });
    }
  }, [persona?.id, reset, persona]);

  const watched = watch();

  const handleFormSubmit = (data: FormValues) => {
    const tools = data.allowedTools
      ? data.allowedTools.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    onSave({
      name: data.name,
      description: data.description,
      domain: data.domain,
      tone: data.tone || undefined,
      allowedTools: tools,
    });
  };

  if (!persona) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border border-white/[0.03] bg-card p-12">
        <p className="text-sm text-muted-foreground">
          Select a persona from the sidebar to edit.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="space-y-6 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="persona-name">Name</Label>
              <Input
                id="persona-name"
                {...register("name")}
                className="mt-1"
                placeholder="e.g. Senior Developer"
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="persona-domain">Domain</Label>
              <Select
                value={watched.domain}
                onValueChange={(v) => setValue("domain", v as TemplateDomain)}
              >
                <SelectTrigger id="persona-domain" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOMAINS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="persona-desc">Description</Label>
            <Textarea
              id="persona-desc"
              {...register("description")}
              className="mt-1 min-h-[80px]"
              placeholder="Describe the persona's role and expertise..."
              aria-invalid={!!errors.description}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="persona-tone">Tone</Label>
            <Input
              id="persona-tone"
              {...register("tone")}
              className="mt-1"
              placeholder="e.g. professional, friendly"
            />
          </div>

          <div>
            <Label htmlFor="persona-tools">Allowed tools (comma-separated)</Label>
            <Input
              id="persona-tools"
              {...register("allowedTools")}
              className="mt-1 font-mono text-sm"
              placeholder="code, git, ci"
            />
          </div>

          <Card className="border-white/[0.03]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Live preview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="rounded-md bg-secondary/30 p-3 font-mono text-xs text-muted-foreground">
                <p className="font-medium text-foreground mb-1">{watched.name || "—"}</p>
                <p className="mb-2">{watched.description || "—"}</p>
                <p>
                  Domain: {watched.domain} | Tone: {watched.tone || "—"}
                </p>
                <p>
                  Tools: {watched.allowedTools || "—"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      <div className="border-t border-white/[0.03] p-4">
        <Button type="submit" disabled={isSaving} className="gap-2">
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : null}
          Save changes
        </Button>
      </div>
    </form>
  );
}
