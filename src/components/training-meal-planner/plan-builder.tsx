/**
 * Plan Builder — Guided widget for goals, constraints, dietary prefs, duration.
 * Auto-generate plan, agent-suggest adjustments.
 */

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Sparkles, Loader2, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Adjustment, Plan, PlanConstraints } from "@/types/training-plan";

const GOALS = [
  { value: "fat_loss", label: "Fat loss" },
  { value: "muscle_gain", label: "Muscle gain" },
  { value: "endurance", label: "Endurance" },
  { value: "maintenance", label: "Maintenance" },
];

const DIETARY_OPTIONS = [
  { value: "none", label: "None" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "pescatarian", label: "Pescatarian" },
  { value: "keto", label: "Keto" },
];

const EQUIPMENT_OPTIONS = [
  "Dumbbells",
  "Barbell",
  "Kettlebell",
  "Resistance bands",
  "Bodyweight",
  "Treadmill",
  "Bike",
];

export interface PlanBuilderProps {
  userGoals?: string[];
  constraints?: Partial<PlanConstraints>;
  dietaryPrefs?: string | null;
  durationWeeks?: number;
  activityLevel?: string;
  onPlanGenerated?: (payload: {
    goals: string[];
    durationWeeks: number;
    constraints: PlanConstraints;
  }) => void;
  onAgentSuggest?: () => void;
  generatedPlan?: Plan | null;
  agentSuggestions?: Adjustment[];
  isGenerating?: boolean;
  isAgentLoading?: boolean;
  className?: string;
}

export function PlanBuilder({
  userGoals = [],
  constraints: initialConstraints = {},
  dietaryPrefs = null,
  durationWeeks: initialDuration = 4,
  onPlanGenerated,
  onAgentSuggest,
  generatedPlan,
  agentSuggestions = [],
  isGenerating,
  isAgentLoading,
  className,
}: PlanBuilderProps) {
  const [selectedGoals, setSelectedGoals] = useState<string[]>(userGoals ?? []);
  const [durationWeeks, setDurationWeeks] = useState(initialDuration);
  const [dietary, setDietary] = useState<string | null>(dietaryPrefs ?? null);
  const [allergies, setAllergies] = useState<string>(
    (initialConstraints?.allergies ?? []).join(", ")
  );
  const [equipment, setEquipment] = useState<string[]>(
    initialConstraints?.equipment ?? []
  );
  const [caloriesTarget, setCaloriesTarget] = useState<number | "">(
    initialConstraints?.macroTargets?.calories ?? ""
  );
  const [proteinTarget, setProteinTarget] = useState<number | "">(
    initialConstraints?.macroTargets?.protein ?? ""
  );

  const toggleGoal = useCallback((value: string) => {
    setSelectedGoals((prev) => {
      const arr = prev ?? [];
      if (arr.includes(value)) return arr.filter((g) => g !== value);
      return [...arr, value];
    });
  }, []);

  const toggleEquipment = useCallback((item: string) => {
    setEquipment((prev) => {
      const arr = prev ?? [];
      if (arr.includes(item)) return arr.filter((e) => e !== item);
      return [...arr, item];
    });
  }, []);

  const constraints: PlanConstraints = {
    dietary: dietary ?? null,
    allergies: allergies
      ? allergies
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean)
      : [],
    equipment: equipment ?? [],
    macroTargets:
      caloriesTarget !== "" || proteinTarget !== ""
        ? {
            calories: typeof caloriesTarget === "number" ? caloriesTarget : undefined,
            protein: typeof proteinTarget === "number" ? proteinTarget : undefined,
          }
        : null,
  };

  const isValid =
    selectedGoals.length > 0 &&
    durationWeeks >= 1 &&
    durationWeeks <= 12;

  const handleGenerate = useCallback(() => {
    if (!isValid || !onPlanGenerated) return;
    onPlanGenerated({
      goals: selectedGoals,
      durationWeeks,
      constraints,
    });
  }, [isValid, onPlanGenerated, selectedGoals, durationWeeks, constraints]);

  const safeAgentSuggestions = Array.isArray(agentSuggestions) ? agentSuggestions : [];

  return (
    <Card className={cn("card-health border-white/[0.03]", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Sparkles className="h-5 w-5 text-teal" aria-hidden />
          Plan builder
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Select goals, constraints, and generate your personalized plan
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Goals</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {(GOALS ?? []).map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => toggleGoal(g.value)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200",
                  (selectedGoals ?? []).includes(g.value)
                    ? "bg-[#FF3B30] text-white"
                    : "border border-white/10 bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
                aria-pressed={(selectedGoals ?? []).includes(g.value)}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="duration" className="text-xs font-medium text-muted-foreground">
              Duration (weeks)
            </Label>
            <Input
              id="duration"
              type="number"
              min={1}
              max={12}
              value={durationWeeks}
              onChange={(e) => setDurationWeeks(Math.max(1, Math.min(12, Number(e.target.value) || 1)))}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="dietary" className="text-xs font-medium text-muted-foreground">
              Dietary preference
            </Label>
            <Select
              value={dietary ?? "none"}
              onValueChange={(v) => setDietary(v === "none" ? null : v)}
            >
              <SelectTrigger id="dietary" className="mt-2">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {(DIETARY_OPTIONS ?? []).map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="allergies" className="text-xs font-medium text-muted-foreground">
            Allergies (comma-separated)
          </Label>
          <Input
            id="allergies"
            placeholder="e.g. nuts, shellfish"
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-xs font-medium text-muted-foreground">Equipment</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {(EQUIPMENT_OPTIONS ?? []).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => toggleEquipment(item)}
                className={cn(
                  "rounded-md px-2 py-1 text-xs font-medium transition-all duration-200",
                  (equipment ?? []).includes(item)
                    ? "bg-teal/20 text-teal"
                    : "border border-white/10 text-muted-foreground hover:bg-secondary"
                )}
                aria-pressed={(equipment ?? []).includes(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="calories" className="text-xs font-medium text-muted-foreground">
              Calorie target (optional)
            </Label>
            <Input
              id="calories"
              type="number"
              placeholder="e.g. 2000"
              value={caloriesTarget === "" ? "" : caloriesTarget}
              onChange={(e) =>
                setCaloriesTarget(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="protein" className="text-xs font-medium text-muted-foreground">
              Protein target (g, optional)
            </Label>
            <Input
              id="protein"
              type="number"
              placeholder="e.g. 150"
              value={proteinTarget === "" ? "" : proteinTarget}
              onChange={(e) =>
                setProteinTarget(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="mt-2"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            onClick={handleGenerate}
            disabled={!isValid || isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Sparkles className="h-4 w-4" aria-hidden />
            )}
            Auto-generate plan
          </Button>
          {onAgentSuggest && generatedPlan && (
            <Button
              variant="outline"
              onClick={onAgentSuggest}
              disabled={isAgentLoading}
              className="gap-2"
            >
              {isAgentLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Bot className="h-4 w-4" aria-hidden />
              )}
              Agent-suggest adjustments
            </Button>
          )}
        </div>

        {safeAgentSuggestions.length > 0 && (
          <div className="rounded-lg border border-white/[0.03] bg-secondary/20 p-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Agent suggestions
            </p>
            <ul className="space-y-1 text-sm">
              {safeAgentSuggestions.map((s, i) => (
                <li key={s?.id ?? i}>{s?.description ?? "Suggestion"}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
