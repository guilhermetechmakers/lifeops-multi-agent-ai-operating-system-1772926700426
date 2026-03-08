/**
 * Persona Detail — view/edit persona with live prompt preview.
 */

import { useParams, Link } from "react-router-dom";
import { ArrowLeft, FileCode, FileText, Wallet, Heart, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedPage } from "@/components/animated-page";
import { usePersona } from "@/hooks/use-personas";
import type { TemplateDomain } from "@/types/templates-personas";

const DOMAIN_ICONS: Record<TemplateDomain, React.ComponentType<{ className?: string }>> = {
  developer: FileCode,
  content: FileText,
  finance: Wallet,
  health: Heart,
};

const DOMAIN_LABELS: Record<TemplateDomain, string> = {
  developer: "Developer",
  content: "Content",
  finance: "Finance",
  health: "Health",
};

export default function PersonaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: persona, isLoading } = usePersona(id ?? null);

  if (isLoading) {
    return (
      <AnimatedPage className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </AnimatedPage>
    );
  }

  if (!persona) {
    return (
      <AnimatedPage className="space-y-6">
        <p className="text-sm text-muted-foreground">Persona not found.</p>
        <Link to="/dashboard/templates-personas/personas">
          <Button variant="outline" size="sm">
            Back to personas
          </Button>
        </Link>
      </AnimatedPage>
    );
  }

  const Icon = DOMAIN_ICONS[persona.domain];
  const examplePrompts = persona.examplePrompts ?? [];
  const allowedTools = persona.allowedTools ?? [];

  return (
    <AnimatedPage className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/templates-personas/personas">
          <Button variant="ghost" size="icon" aria-label="Back to personas">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-foreground truncate">
            {persona.name}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">
              {DOMAIN_LABELS[persona.domain]}
            </Badge>
            {persona.tone && (
              <span className="text-xs text-muted-foreground">
                Tone: {persona.tone}
              </span>
            )}
          </div>
          <Link
            to={`/dashboard/templates-personas/personas/${id}/edit`}
            className="inline-flex items-center gap-1 mt-2 text-sm text-primary hover:underline"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-white/[0.03] bg-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
              <h2 className="text-base font-medium">Overview</h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {persona.description ?? "No description."}
            </p>
            {Object.keys(persona.styleGuides ?? {}).length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Style guides</h3>
                <pre className="text-xs text-muted-foreground font-mono bg-secondary/50 rounded p-3 overflow-auto">
                  {JSON.stringify(persona.styleGuides, null, 2)}
                </pre>
              </div>
            )}
            {allowedTools.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Allowed tools</h3>
                <div className="flex flex-wrap gap-1">
                  {allowedTools.map((t) => (
                    <Badge key={t} variant="outline" className="text-xs">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/[0.03] bg-card">
          <CardHeader>
            <h2 className="text-base font-medium">Example prompts</h2>
            <p className="text-xs text-muted-foreground mt-1">
              How prompts render in agent conversations
            </p>
          </CardHeader>
          <CardContent>
            {examplePrompts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No example prompts defined.
              </p>
            ) : (
              <ul className="space-y-2" role="list">
                {examplePrompts.map((prompt, i) => (
                  <li
                    key={i}
                    className="rounded-md border border-white/[0.03] bg-secondary/30 px-3 py-2 text-sm font-mono"
                  >
                    {prompt}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  );
}
