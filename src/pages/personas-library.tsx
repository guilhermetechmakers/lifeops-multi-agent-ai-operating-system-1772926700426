/**
 * Personas Library page.
 * Sidebar tree of domains, persona editor with live preview.
 */

import { useState } from "react";
import { UserCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedPage } from "@/components/animated-page";
import { usePersonas, usePersona, useUpdatePersona } from "@/hooks/use-personas";
import { PersonaDomainTree, PersonaEditor } from "@/components/personas-library";

export default function PersonasLibraryPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { items: personas, isLoading } = usePersonas();
  const { data: selectedPersona } = usePersona(selectedId);
  const updateMutation = useUpdatePersona();

  const personaList = Array.isArray(personas) ? personas : [];

  const handleSave = (payload: Partial<{ id: string } & Record<string, unknown>>) => {
    if (!selectedId) return;
    updateMutation.mutate(
      { id: selectedId, payload },
      {
        onSuccess: () => {
          // Stay on same persona
        },
      }
    );
  };

  return (
    <AnimatedPage className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <UserCircle className="h-6 w-6 text-primary" />
            Personas Library
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Domain-specific personas with traits, tone, and allowed tools.
          </p>
        </div>
      </div>

      <div className="flex gap-6 min-h-[500px]">
        <aside className="w-56 shrink-0 rounded-lg border border-white/[0.03] bg-card p-4">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            Domains
          </h2>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <PersonaDomainTree
              personas={personaList}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          )}
        </aside>

        <main className="flex-1 min-w-0 rounded-lg border border-white/[0.03] bg-card overflow-hidden">
          <PersonaEditor
            persona={selectedPersona ?? null}
            onSave={handleSave}
            isSaving={updateMutation.isPending}
          />
        </main>
      </div>
    </AnimatedPage>
  );
}
