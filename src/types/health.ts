/**
 * Health Dashboard data models.
 * All types align with the Health Dashboard prompt schema.
 */

export interface Habit {
  id: string;
  userId: string;
  name: string;
  frequency: string;
  streak: number;
  nextReminder: string;
  coachInterventions?: string[];
  /** Habits Tracker extended fields */
  category?: string;
  color?: string;
  icon?: string;
  schedule?: HabitSchedule;
  reminders?: HabitReminder[];
  timezone?: string;
  createdAt?: string;
  updatedAt?: string;
  lastCheckInDate?: string;
}

export interface HabitSchedule {
  type: "daily" | "weekly" | "custom";
  days?: number[]; // 0-6 for weekly
  customRule?: string;
}

export interface HabitReminder {
  id?: string;
  time: string; // HH:mm
  recurrenceRule?: string;
  nextTrigger?: string;
}

export interface Checkin {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  notes?: string;
}

export interface CoachingAction {
  id: string;
  habitId: string;
  type: "nudge" | "micro-action" | "adaptive-schedule";
  status: "pending" | "approved" | "dismissed";
  message?: string;
  createdAt: string;
  approvedAt?: string;
}

export interface CoachingContext {
  habitId?: string;
  calendarEvents?: Array<{ date: string; title: string }>;
  healthSignals?: { recoveryScore?: number; workloadLevel?: string };
  nudges?: CoachingAction[];
  microActions?: CoachingAction[];
  adaptiveSuggestions?: Array<{ description: string; actionId: string }>;
}

export interface TrainingSession {
  date: string;
  type: string;
  durationMin: number;
}

export interface TrainingPlan {
  id: string;
  userId: string;
  goal: string;
  sessions: TrainingSession[];
  calendarSync: boolean;
}

export interface MealItem {
  date: string;
  items: string[];
}

export interface NutritionSummary {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface MealPlan {
  id: string;
  userId: string;
  goal: string;
  meals: MealItem[];
  nutritionSummary: NutritionSummary;
}

export interface RecoveryMetric {
  id: string;
  userId: string;
  score: number;
  timestamp: string;
}

export interface WorkloadRecommendationItem {
  id: string;
  changeDescription: string;
  impact: string;
  confidence: number;
}

export interface WorkloadRecommendation {
  id: string;
  userId: string;
  recommendations: WorkloadRecommendationItem[];
  createdAt: string;
}

export interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
  checked?: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
  artifactRef?: string;
}

export interface HealthSnapshot {
  sleepHours?: number;
  recoveryScore?: number;
  weeklyTrainingLoad?: number;
  next7Days?: Array<{
    date: string;
    label?: string;
    value?: number;
    sleep?: number;
    recovery?: number;
    load?: number;
  }>;
}

export interface HealthIntervention {
  id: string;
  type: "coaching" | "alert" | "reminder";
  title: string;
  message?: string;
  habitId?: string;
  createdAt: string;
}

/** Alias for NotificationsTray compatibility */
export interface Intervention {
  id: string;
  type: "coaching" | "alert" | "reminder";
  message: string;
  habitId?: string;
  timestamp?: string;
  acknowledged?: boolean;
}

/** Health data source (HealthKit / Google Fit) */
export type HealthDataSource = "healthkit" | "google_fit";

/** Normalized health metric for storage (after adapter normalization) */
export interface HealthDataPoint {
  id?: string;
  userId: string;
  source: HealthDataSource;
  type: string;
  timestamp: string;
  value: number | string | Record<string, unknown>;
}

/** Consent preferences for health and calendar data (opt-in) */
export interface HealthConsents {
  userId: string;
  sources: {
    healthkit: boolean;
    google_fit: boolean;
    calendar: boolean;
  };
  dataSharingPrefs?: Record<string, boolean>;
  updatedAt?: string;
}

/** Calendar event from sync (for workload balancing) */
export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  source?: string;
}
