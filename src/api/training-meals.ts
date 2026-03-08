/**
 * Training & Meal Planner API — plan generation, calendar sync, grocery aggregate, adjustments.
 * Mock implementation; all responses use safe shapes (arrays default to []).
 */

import { api, safeArray } from "@/lib/api";
import type {
  Plan,
  PlanConstraints,
  MealPlanItem,
  WorkoutPlanItem,
  ScheduleItem,
  PlanGroceryItem,
  PlanNutritionTotals,
  NutritionTotals,
  AgentSuggestion,
  GeneratePlanPayload,
  AdjustPlanPayload,
  AgentSuggestPayload,
} from "@/types/training-meals";

const MOCK_DELAY = 400;

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function defaultConstraints(): PlanConstraints {
  return {
    dietary: null,
    allergies: [],
    equipment: [],
    macroTargets: null,
  };
}

function buildMockMeals(days: number): MealPlanItem[] {
  const names = [
    "Oatmeal with berries",
    "Grilled chicken salad",
    "Salmon with vegetables",
    "Eggs and avocado",
    "Turkey wrap",
    "Stir-fry tofu",
    "Greek yogurt bowl",
    "Quinoa Buddha bowl",
  ];
  return Array.from({ length: Math.min(days * 2, 14) }, (_, i) => ({
    id: `meal-${i + 1}`,
    name: names[i % names.length] ?? "Meal",
    calories: 400 + (i % 5) * 80,
    macros: { protein: 25 + (i % 3) * 5, carbs: 40 + (i % 4) * 10, fat: 12 + (i % 3) * 4 },
    ingredients: [
      { name: "Ingredient A", quantity: 100, unit: "g" },
      { name: "Ingredient B", quantity: 1, unit: "cup" },
    ],
  }));
}

function buildMockWorkouts(days: number): WorkoutPlanItem[] {
  const types = [
    { name: "Strength", durationMin: 45, intensity: "moderate" },
    { name: "Cardio", durationMin: 30, intensity: "high" },
    { name: "Recovery", durationMin: 20, intensity: "low" },
    { name: "HIIT", durationMin: 35, intensity: "high" },
  ];
  return Array.from({ length: Math.min(days, 7) }, (_, i) => {
    const t = types[i % types.length];
    return {
      id: `workout-${i + 1}`,
      name: t?.name ?? "Workout",
      durationMin: t?.durationMin ?? 30,
      intensity: t?.intensity ?? "moderate",
      targetCalories: 200 + (i % 3) * 100,
    };
  });
}

function buildMockSchedule(meals: MealPlanItem[], workouts: WorkoutPlanItem[]): ScheduleItem[] {
  const items: ScheduleItem[] = [];
  (meals ?? []).slice(0, 7).forEach((m, i) => {
    items.push({
      id: `sched-meal-${m.id}`,
      type: "meal",
      startTime: `08:00`,
      endTime: `08:30`,
      referenceId: m.id,
      date: new Date(Date.now() + i * 86400000).toISOString().slice(0, 10),
    });
  });
  (workouts ?? []).slice(0, 5).forEach((w, i) => {
    items.push({
      id: `sched-workout-${w.id}`,
      type: "workout",
      startTime: `07:00`,
      endTime: `07:${String((w.durationMin ?? 30) + 0).padStart(2, "0")}`,
      referenceId: w.id,
      date: new Date(Date.now() + (i % 5) * 86400000).toISOString().slice(0, 10),
    });
  });
  return items;
}

function buildMockNutritionTotals(days: number): PlanNutritionTotals {
  const daily: NutritionTotals[] = Array.from({ length: Math.min(days, 14) }, (_, i) => ({
    calories: 1900 + (i % 4) * 100,
    protein: 120 + (i % 3) * 10,
    carbs: 180 + (i % 2) * 20,
    fat: 65 + (i % 2) * 5,
  }));
  const weekly: NutritionTotals[] = [
    {
      calories: (daily ?? []).reduce((s, d) => s + (d?.calories ?? 0), 0),
      protein: (daily ?? []).reduce((s, d) => s + (d?.protein ?? 0), 0),
      carbs: (daily ?? []).reduce((s, d) => s + (d?.carbs ?? 0), 0),
      fat: (daily ?? []).reduce((s, d) => s + (d?.fat ?? 0), 0),
    },
  ];
  return { daily: daily ?? [], weekly: weekly ?? [] };
}

function buildMockGroceryList(meals: MealPlanItem[]): PlanGroceryItem[] {
  const seen = new Set<string>();
  const items: PlanGroceryItem[] = [];
  (meals ?? []).forEach((m, mi) => {
    (m?.ingredients ?? []).forEach((ing, ii) => {
      const name = ing?.name ?? "Item";
      if (seen.has(name)) return;
      seen.add(name);
      items.push({
        id: `grocery-${mi}-${ii}`,
        name,
        quantity: ing?.quantity ?? 1,
        unit: ing?.unit ?? "unit",
        notes: undefined,
        checked: false,
      });
    });
  });
  return items;
}

/** POST /plan/generate — Generate plan from goals and constraints */
export async function generatePlan(payload: GeneratePlanPayload): Promise<Plan> {
  try {
    const data = await api.post<Plan | { data?: Plan }>("/plan/generate", payload);
    const raw = (data as { data?: Plan })?.data ?? data;
    if (raw && typeof raw === "object" && "id" in raw) {
      const plan = raw as Plan;
      return {
        ...plan,
        meals: Array.isArray(plan.meals) ? plan.meals : [],
        workouts: Array.isArray(plan.workouts) ? plan.workouts : [],
        schedule: Array.isArray(plan.schedule) ? plan.schedule : [],
        groceryList: Array.isArray(plan.groceryList) ? plan.groceryList : [],
        nutritionTotals: plan.nutritionTotals ?? { daily: [], weekly: [] },
        constraints: plan.constraints ?? defaultConstraints(),
      };
    }
  } catch {
    /**/
  }
  await delay(MOCK_DELAY);
  const durationWeeks = Math.max(2, payload?.durationWeeks ?? 2);
  const goals = Array.isArray(payload?.goals) ? payload.goals : ["maintenance"];
  const constraints = payload?.constraints ?? defaultConstraints();
  const meals = buildMockMeals(durationWeeks * 7);
  const workouts = buildMockWorkouts(durationWeeks * 7);
  const schedule = buildMockSchedule(meals, workouts);
  const nutritionTotals = buildMockNutritionTotals(durationWeeks * 7);
  const groceryList = buildMockGroceryList(meals);
  return {
    id: `plan-${Date.now()}`,
    userId: payload?.userId ?? "u1",
    goals,
    durationWeeks,
    constraints,
    meals,
    workouts,
    nutritionTotals,
    schedule,
    groceryList,
  };
}

/** GET /plan/:planId */
export async function getPlan(planId: string): Promise<Plan | null> {
  try {
    const data = await api.get<Plan | { data?: Plan } | null>(`/plan/${planId}`);
    const raw = (data as { data?: Plan })?.data ?? data;
    if (raw && typeof raw === "object" && "id" in raw) return raw as Plan;
  } catch {
    /**/
  }
  await delay(MOCK_DELAY);
  return null;
}

/** POST /calendar/sync */
export async function syncPlanCalendar(payload: {
  planId: string;
  calendarProvider?: "local" | "google" | "apple";
  timezone?: string;
}): Promise<{ success: boolean; nextSync?: string }> {
  try {
    await api.post("/calendar/sync", payload);
    return { success: true, nextSync: new Date(Date.now() + 7 * 86400000).toISOString() };
  } catch {
    /**/
  }
  await delay(MOCK_DELAY);
  return { success: true, nextSync: new Date(Date.now() + 7 * 86400000).toISOString() };
}

/** POST /grocery/aggregate — Aggregate grocery list from plan */
export async function aggregateGrocery(planId: string): Promise<{ items: PlanGroceryItem[] }> {
  try {
    const data = await api.post<{ items?: PlanGroceryItem[] } | PlanGroceryItem[]>("/grocery/aggregate", {
      planId,
    });
    const raw = Array.isArray(data) ? data : (data as { items?: PlanGroceryItem[] })?.items;
    const list = safeArray<PlanGroceryItem>(raw);
    return { items: list };
  } catch {
    /**/
  }
  await delay(MOCK_DELAY);
  return { items: [] };
}

/** POST /plan/adjust — Apply adjustments to plan */
export async function adjustPlan(payload: AdjustPlanPayload): Promise<Plan | null> {
  try {
    const data = await api.post<Plan | { data?: Plan }>(`/plan/adjust`, payload);
    const raw = (data as { data?: Plan })?.data ?? data;
    if (raw && typeof raw === "object" && "id" in raw) return raw as Plan;
  } catch {
    /**/
  }
  await delay(MOCK_DELAY);
  return null;
}

/** POST /agent/suggest — Get agent suggestions for plan */
export async function agentSuggest(payload: AgentSuggestPayload): Promise<{ suggestions: AgentSuggestion[] }> {
  try {
    const data = await api.post<{ suggestions?: AgentSuggestion[] }>("/agent/suggest", payload);
    const raw = (data as { suggestions?: AgentSuggestion[] })?.suggestions;
    const list = safeArray<AgentSuggestion>(raw);
    return { suggestions: list };
  } catch {
    /**/
  }
  await delay(MOCK_DELAY);
  const suggestions: AgentSuggestion[] = [
    {
      id: "sug-1",
      adjustment: {
        id: "adj-1",
        type: "swap_meal",
        description: "Swap Tuesday lunch for higher-protein option",
        referenceId: "meal-2",
      },
      rationale: "Aligns with your protein target and recovery window.",
      confidence: 0.88,
    },
    {
      id: "sug-2",
      adjustment: {
        id: "adj-2",
        type: "swap_workout",
        description: "Move Thursday strength to Wednesday morning",
        referenceId: "workout-3",
      },
      rationale: "Better recovery before your deadline.",
      confidence: 0.82,
    },
  ];
  return { suggestions };
}
