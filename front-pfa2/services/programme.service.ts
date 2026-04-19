import { apiFetch } from "@/lib/api";

export type DietPreference = "Vegan" | "Vegetarian" | "Paleo" | "Keto" | "Low-Carb" | "Balanced";

export type ProgrammeWeekDay = {
  type: "workout" | "rest";
  workout?: string;
  exercises?: unknown[];
};

export type ProgrammeData = {
  status: string;
  goal: string;
  difficulty: string;
  workout_types: string[];
  bmi: number;
  tdee: number;
  calorie_target: number;
  diet_preference: DietPreference;
  training_days_per_week?: number;
  weekly_schedule: Record<string, ProgrammeWeekDay>;
  daily_meals: Record<string, unknown>;
  progress_rules: {
    metric: string;
    expected_change_per_month: number;
    tolerance: number;
    upgrade_difficulty_after_months: number;
  };
  summary: {
    days_per_week: number;
    rest_days: number;
    calorie_target: number;
    difficulty_level: string;
    expected_monthly_change: number;
    metric: string;
  };
};

export type Programme = {
  id: number;
  user_id: number;
  status: "pending_confirmation" | "active" | "confirmed" | "archived";
  goal: string;
  difficulty: string;
  diet_preference: DietPreference;
  calorie_target: number;
  tdee: number;
  programme_data: ProgrammeData;
  created_at: string;
  confirmed_at: string | null;
  updated_at: string;
};

export type ProgressLog = {
  id: number;
  user_id: number;
  programme_id: number | null;
  weight_kg: number | null;
  body_fat_pct: number | null;
  session_duration_hours: number | null;
  notes: string | null;
  date: string;
};

export type ProgressPayload = {
  weight_kg?: number;
  body_fat_pct?: number;
  session_duration_hours?: number;
  notes?: string;
};

export const programmeService = {
  getMyProgramme: () => apiFetch<{ programme: Programme }>("/api/programme/me"),

  getProgress: () => apiFetch<{ progress: ProgressLog[] }>("/api/programme/progress"),

  logProgress: (payload: ProgressPayload) =>
    apiFetch<{ message: string; log: ProgressLog }>("/api/programme/progress/log", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  generateProgramme: (dietPreference: DietPreference = "Balanced", trainingDaysPerWeek?: number) =>
    apiFetch<{ message: string; programme: Programme }>("/api/programme/generate", {
      method: "POST",
      body: JSON.stringify({
        diet_preference: dietPreference,
        ...(typeof trainingDaysPerWeek === "number" ? { training_days_per_week: trainingDaysPerWeek } : {}),
      }),
    }),

  confirmProgramme: () =>
    apiFetch<{ message: string; programme: Programme }>("/api/programme/confirm", {
      method: "POST",
    }),
};
