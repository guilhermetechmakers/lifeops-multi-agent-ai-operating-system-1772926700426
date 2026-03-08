/**
 * PlanBuilder — Guided widget for goals, duration, constraints, and plan generation.
 * Auto-Generate Plan and Agent-Suggest Adjustments actions.
 */

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Target, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlanConstraints } from "@/types/training-meals";

const GOAL_OPTIONS = [
  { value: "fat_loss", label: "Fat loss" },
  { value: "muscle_gain", label: "Muscle gain" },
  { value: "endurance", label: "Endurance" },
  { value: "maintenance", label: "Maintenance" },
  { value: "performance", label: "Performance" },
];

const DURATION_OPTIONS = [2, 4, 6, 8, 12].map((w) => ({ value: String(w), label: `${w} weeks` }));

const DIETARY_OPTIONS = [
  { value: "none", label: "None" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "pescatarian", label: "Pescatarian" },
  { value: "low_carb", label: "Low carb" },
];

const ACTIVITY_OPTIONS = [
  { value: "sedentary", label: "Sedentary" },
  { value: "light", label: "Light" },
  { value: "moderate", label: "Moderate" },
  { value: "active", label: "Active" },
  { value: "very_active", label: "Very active" },
];

const EQUIPMENT_OPTIONS = ["Dumbbells", "Kettlebells", "Bands", "Bodyweight", "Full gym"];

export interface PlanBuilderProps {
  onGenerate: (goals: string[], durationWeeks: number, constraints: PlanConstraints) => void;
  onAgentSuggest?: () => void;
  isGenerating?: boolean;
  isSuggesting?: boolean;
  className?: string;
}

const defaultConstraints: PlanConstraints = {
  dietary: null,
  allergies: [],
  equipment: [],
  macroTargets: null,
};

export function PlanBuilder({
  onGenerate,
  onAgentSuggest,
  isGenerating = false,
  isSuggesting = false,
  className,
}: PlanBuilderProps) {
  const [selectedGoals, setSelectedGoals] = useState<string[]>(["maintenance"]);
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [constraints, setConstraints] = useState<PlanConstraints>(defaultConstraints);
  const [activityLevel, setActivityLevel] = useState("moderate");
  const [allergyInput, setAllergyInput] = useState("");

  const toggleGoal = useCallback((value: string) => {
    setSelectedGoals((prev) => {
      const next = prev.includes(value) ? prev.filter((g) => g !== value) : [...prev, value];
      return next.length > 0 ? next : ["maintenance"];
    });
  }, []);

  const toggleEquipment = useCallback((item: string) => {
    setConstraints((c) => {
      const list = c?.equipment ?? [];
      const next = list.includes(item) ? list.filter((e) => e !== item) : [...list, item];
      return { ...c, equipment: next };
    });
  }, []);

  const addAllergy = useCallback(() => {
    const trimmed = allergyInput.trim();
    if (!trimmed) return;
    setConstraints((c) => ({
      ...c,
      allergies: [...(c?.allergies ?? []), trimmed],
    }));
    setAllergyInput("");
  }, [allergyInput]);

  const removeAllergy = useCallback((item: string) => {
    setConstraints((c) => ({
      ...c,
      allergies: (c?.allergies ?? []).filter((a) => a !== item),
    }));
  }, []);

  const handleGenerate = useCallback(() => {
    if (selectedGoals.length === 0) return;
    onGenerate(selectedGoals, durationWeeks, constraints);
  }, [selectedGoals, durationWeeks, constraints, onGenerate]);

  return (
    <Card className={cn("card-health border-white/[0.03]", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Target className="h-5 w-5 text-muted-foreground" aria-hidden />
          Plan builder
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Set goals, duration, and constraints to auto-generate your plan
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Goals</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {(GOAL_OPTIONS ?? []).map((opt) => (
              <Badge
                key={opt.value}
                variant={selectedGoals.includes(opt.value) ? "default" : "outline"}
                className="cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                onClick={() => toggleGoal(opt.value)}
              >
                {opt.label}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="duration" className="text-xs font-medium text-muted-foreground">
              Duration (weeks)
            </Label>
            <Select
              value={String(durationWeeks)}
              onValueChange={(v) => setDurationWeeks(Number(v) || 4)}
            >
              <SelectTrigger id="duration" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(DURATION_OPTIONS ?? []).map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="activity" className="text-xs font-medium text-muted-foreground">
              Activity level
            </Label>
            <Select value={activityLevel} onValueChange={setActivityLevel}>
              <SelectTrigger id="activity" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(ACTIVITY_OPTIONS ?? []).map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-xs font-medium text-muted-foreground">Dietary</Label>
          <Select
            value={constraints?.dietary ?? "none"}
            onValueChange={(v) =>
              setConstraints((c) => ({ ...c, dietary: v === "none" ? null : v }))
            }
          >
            <SelectTrigger className="mt-1">
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

        <div>
          <Label className="text-xs font-medium text-muted-foreground">Allergies (optional)</Label>
          <div className="mt-1 flex gap-2">
            <Input
              value={allergyInput}
              onChange={(e) => setAllergyInput(e.target.value)}
              placeholder="e.g. nuts, shellfish"
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && addAllergy()}
            />
            <Button type="button" variant="outline" size="sm" onClick={addAllergy}>
              Add
            </Button>
          </div>
          {(constraints?.allergies ?? []).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {(constraints.allergies ?? []).map((a) => (
                <Badge
                  key={a}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => removeAllergy(a)}
                >
                  {a} ×
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label className="text-xs font-medium text-muted-foreground">Equipment</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {(EQUIPMENT_OPTIONS ?? []).map((item) => (
              <Badge
                key={item}
                variant={(constraints?.equipment ?? []).includes(item) ? "default" : "outline"}
                className="cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                onClick={() => toggleEquipment(item)}
              >
                {item}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || selectedGoals.length === 0}
            className="transition-transform duration-200 hover:scale-[1.02]"
          >
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Auto-generate plan
          </Button>
          {onAgentSuggest && (
            <Button
              variant="outline"
              onClick={onAgentSuggest}
              disabled={isSuggesting}
              className="transition-transform duration-200 hover:scale-[1.02]"
            >
              {isSuggesting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Target className="mr-2 h-4 w-4" />
              )}
              Agent-suggest adjustments
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
