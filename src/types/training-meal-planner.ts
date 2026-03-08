/**
 * Training & Meal Planner data models.
 * Aligns with Health Dashboard and plan generation schemas.
 */

export type PlanGoal = "fat_loss" | "muscle_gain" | "endurance" | "maintenance" | "performance";

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";

export type DietaryPreference = "none" | "vegetarian" | "vegan" | "pescatarian" | "keto" | "paleo";

export interface MacroTargets {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface PlanConstraints {
  dietary: DietaryPreference | null;
  allergies: string[];
  equipment: string[];
  macroTargets: MacroTargets | null;
}

export interface MealIngredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface MealMacros {
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealPlanItem {
  id: string;
  name: string;
  calories: number;
  macros: MealMacros;
  ingredients: MealIngredient[];
}

export interface WorkoutPlanItem {
  id: string;
  name: string;
  durationMin: number;
  intensity: string;
  targetCalories?: number;
}

export interface NutritionTotals {
  daily: Array<{ calories: number; protein: number; carbs: number; fat: number }>;
  weekly: Array<{ calories: number; protein: number; carbs: number; fat: number }>;
}

export interface ScheduleItem {
  id: string;
  type: "meal" | "workout";
  startTime: string;
  endTime?: string;
  referenceId: string;
  dayOfWeek?: number;
  date?: string;
}

export interface GroceryItemExtended {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
  checked?: boolean;
}

export interface Plan {
  id: string;
  userId: string;
  goals: PlanGoal[];
  durationWeeks: number;
  constraints: PlanConstraints;
  meals: MealPlanItem[];
  workouts: WorkoutPlanItem[];
  nutritionTotals: NutritionTotals;
  schedule: ScheduleItem[];
  groceryList: GroceryItemExtended[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Adjustment {
  id: string;
  type: "swap_meal" | "swap_workout" | "adjust_portion" | "modify_rest" | "reschedule";
  description: string;
  rationale?: string;
  targetId?: string;
  replacementId?: string;
  confidence: number;
}

export interface AgentSuggestion {
  id: string;
  adjustments: Adjustment[];
  explanation?: string;
  createdAt: string;
}

export interface GeneratePlanPayload {
  userId?: string;
  goals: PlanGoal[];
  durationWeeks: number;
  constraints: PlanConstraints;
  activityLevel?: ActivityLevel;
}

export interface CalendarSyncPayload {
  planId: string;
  calendarProvider: "local" | "google" | "apple";
  timezone?: string;
}

export interface PlanAdjustPayload {
  planId: string;
  adjustments: Adjustment[];
}
