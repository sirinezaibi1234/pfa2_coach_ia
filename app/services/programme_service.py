"""
app/services/programme_service.py
Generates and updates sport programs using trained ML models.
"""

import json
import joblib
import numpy as np
import os

# ── Load models & lookups once at import time ─────────────────────────────────
BASE = os.path.join(os.path.dirname(__file__), "..", "..", "ml_models")

difficulty_model   = joblib.load(os.path.join(BASE, "difficulty_model.pkl"))
scaler             = joblib.load(os.path.join(BASE, "scaler.pkl"))
difficulty_encoder = joblib.load(os.path.join(BASE, "difficulty_encoder.pkl"))

with open(os.path.join(BASE, "mappings.json"))        as f: MAPPINGS        = json.load(f)
with open(os.path.join(BASE, "exercise_lookup.json")) as f: EXERCISE_LOOKUP = json.load(f)
with open(os.path.join(BASE, "meal_lookup.json"))     as f: MEAL_LOOKUP     = json.load(f)

GOAL_TO_WORKOUT     = MAPPINGS["goal_to_workout"]
GOAL_CALORIE_FACTOR = MAPPINGS["goal_calorie_factor"]
ACTIVITY_TO_DAYS    = MAPPINGS["activity_to_days"]
MODEL_FEATURES      = MAPPINGS["model_features"]


# ── Helpers ────────────────────────────────────────────────────────────────────

def _calc_bmi(weight_kg: float, height_cm: float) -> float:
    height_m = height_cm / 100
    return round(weight_kg / (height_m ** 2), 2)

def _bmi_category(bmi: float) -> int:
    if bmi < 18.5: return 0
    elif bmi < 25: return 1
    elif bmi < 30: return 2
    else:          return 3

def _calc_tdee(weight_kg, height_cm, age, gender, activity_level):
    """Harris-Benedict BMR x activity multiplier"""
    if gender.lower() == "male":
        bmr = 88.36 + (13.4 * weight_kg) + (4.8 * height_cm) - (5.7 * age)
    else:
        bmr = 447.6 + (9.25 * weight_kg) + (3.1 * height_cm) - (4.3 * age)

    multipliers = {
        "sedentary":         1.2,
        "lightly_active":    1.375,
        "moderately_active": 1.55,
        "very_active":       1.725,
        "extra_active":      1.9,
    }
    return round(bmr * multipliers.get(activity_level, 1.55), 0)


def _get_exp_level(activity_level):
    """Convert activity level to experience number 1/2/3."""
    return {
        "sedentary":         1,
        "lightly_active":    1,
        "moderately_active": 2,
        "very_active":       3,
        "extra_active":      3,
    }.get(activity_level, 2)


def _predict_difficulty(age, gender, weight_kg, height_cm, activity_level):
    """Use ML model to predict appropriate difficulty level."""
    bmi        = _calc_bmi(weight_kg, height_cm)
    bmi_cat    = _bmi_category(bmi)
    gender_enc = 1 if gender.lower() == "male" else 0
    exp_level  = _get_exp_level(activity_level)

    features        = np.array([[age, gender_enc, weight_kg, height_cm, bmi, exp_level]])
    features_scaled = scaler.transform(features)
    pred            = difficulty_model.predict(features_scaled)[0]
    return difficulty_encoder.inverse_transform([pred])[0]


def _get_exercises(workout_type, difficulty, n=6):
    """Return n exercises for the given workout_type + difficulty."""
    key       = f"{workout_type}_{difficulty}"
    exercises = EXERCISE_LOOKUP.get(key, [])
    if len(exercises) <= n:
        return exercises
    step = len(exercises) // n
    return [exercises[i * step] for i in range(n)]


def _get_meals(diet_type, tdee, goal):
    """Return a daily meal plan (breakfast, lunch, dinner, snack)."""
    calorie_target = round(tdee * GOAL_CALORIE_FACTOR.get(goal, 1.0), 0)
    meal_plan      = {}

    for meal_type in ["Breakfast", "Lunch", "Dinner", "Snack"]:
        key     = f"{diet_type}_{meal_type}"
        options = MEAL_LOOKUP.get(key, [])
        if options:
            target_meal_cal = calorie_target * (0.30 if meal_type in ["Lunch", "Dinner"] else 0.20)
            best            = min(options, key=lambda m: abs(m["Calories"] - target_meal_cal))
            meal_plan[meal_type.lower()] = best

    return meal_plan, int(calorie_target)


def _get_weekly_schedule(workout_types, difficulty, activity_level):
    """Build a 7-day schedule based on activity level."""
    days_per_week = ACTIVITY_TO_DAYS.get(activity_level, 4)
    day_names     = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    schedule      = {}
    workout_idx   = 0

    for i, day in enumerate(day_names):
        if workout_idx < days_per_week and i < 6:
            wtype = workout_types[workout_idx % len(workout_types)]
            schedule[day] = {
                "type":      "workout",
                "workout":   wtype,
                "exercises": _get_exercises(wtype, difficulty),
            }
            workout_idx += 1
        else:
            schedule[day] = {"type": "rest"}

    return schedule


def _get_progress_rules(goal, profile, objective):
    """
    Calculate expected progress rules DYNAMICALLY per user.

    Instead of fixed numbers for everyone, expectations are calculated
    based on each user's age, BMI, and experience level.

    Examples:
      User A (22yo, BMI 35, beginner) lose_weight -> -2.5 kg/month
      User B (55yo, BMI 22, advanced) lose_weight -> -0.5 kg/month
    """
    age       = profile.age or 30
    weight_kg = profile.weight or 70
    height_cm = profile.height or 170
    bmi       = _calc_bmi(weight_kg, height_cm)
    exp_level = _get_exp_level(profile.activity_level or "moderately_active")

    # ── Lose Weight ────────────────────────────────────────────────────────
    if goal == "lose_weight":
        if bmi > 35:   base_rate = -2.5
        elif bmi > 30: base_rate = -2.0
        elif bmi > 25: base_rate = -1.5
        else:          base_rate = -0.8

        # Older users have slower metabolism
        if age > 50:   base_rate *= 0.65
        elif age > 40: base_rate *= 0.80
        elif age > 30: base_rate *= 0.90

        upgrade_after = 3 if (age > 45 or exp_level == 1) else 2

        return {
            "metric":                          "weight_kg",
            "expected_change_per_month":       round(base_rate, 1),
            "tolerance":                       0.5,
            "upgrade_difficulty_after_months": upgrade_after,
        }

    # ── Gain Muscle ────────────────────────────────────────────────────────
    elif goal == "gain_muscle":
        # Beginners gain much faster (newbie gains effect)
        if exp_level == 1:   base_rate = 1.0
        elif exp_level == 2: base_rate = 0.5
        else:                base_rate = 0.2

        if age > 50:   base_rate *= 0.60
        elif age > 40: base_rate *= 0.75

        upgrade_after = 2 if exp_level <= 2 else 3

        return {
            "metric":                          "weight_kg",
            "expected_change_per_month":       round(base_rate, 1),
            "tolerance":                       0.3,
            "upgrade_difficulty_after_months": upgrade_after,
        }

    # ── Maintain Weight ────────────────────────────────────────────────────
    elif goal == "maintain_weight":
        # Heavier users have more natural fluctuation
        tolerance = 1.5 if weight_kg > 90 else 1.0

        return {
            "metric":                          "weight_kg",
            "expected_change_per_month":       0.0,
            "tolerance":                       tolerance,
            "upgrade_difficulty_after_months": 3,
        }

    # ── Improve Endurance ──────────────────────────────────────────────────
    elif goal == "improve_endurance":
        # Beginners improve faster (more room for improvement)
        if exp_level == 1:   base_rate = 0.15
        elif exp_level == 2: base_rate = 0.10
        else:                base_rate = 0.05

        if age > 50:   base_rate *= 0.70
        elif age > 40: base_rate *= 0.85

        return {
            "metric":                          "session_duration_hours",
            "expected_change_per_month":       round(base_rate, 2),
            "tolerance":                       0.05,
            "upgrade_difficulty_after_months": 2,
        }

    # ── Default fallback ───────────────────────────────────────────────────
    return {
        "metric":                          "weight_kg",
        "expected_change_per_month":       -1.0,
        "tolerance":                       0.5,
        "upgrade_difficulty_after_months": 2,
    }


# ── Public API ─────────────────────────────────────────────────────────────────

def generate_programme(profile, objective, diet_preference="Balanced"):
    """
    Generate a full sport programme from user profile + objective.

    Args:
        profile:         UserProfile instance
        objective:       Objective instance
        diet_preference: str — Vegan / Vegetarian / Paleo / Keto / Low-Carb / Balanced

    Returns:
        dict — full programme ready to be saved in DB
    """
    age            = profile.age or 30
    gender         = profile.gender or "male"
    weight_kg      = profile.weight or 70
    height_cm      = profile.height or 170
    activity_level = profile.activity_level or "moderately_active"
    goal           = objective.goal

    bmi             = _calc_bmi(weight_kg, height_cm)
    difficulty      = _predict_difficulty(age, gender, weight_kg, height_cm, activity_level)
    tdee            = _calc_tdee(weight_kg, height_cm, age, gender, activity_level)
    workout_types   = GOAL_TO_WORKOUT.get(goal, ["Cardio"])
    meal_plan, calorie_target = _get_meals(diet_preference, tdee, goal)
    weekly_schedule = _get_weekly_schedule(workout_types, difficulty, activity_level)

    # Dynamic progress rules calculated for this specific user
    progress_rules = _get_progress_rules(goal, profile, objective)

    return {
        "status":          "pending_confirmation",
        "goal":            goal,
        "difficulty":      difficulty,
        "workout_types":   workout_types,
        "bmi":             bmi,
        "tdee":            tdee,
        "calorie_target":  calorie_target,
        "diet_preference": diet_preference,
        "weekly_schedule": weekly_schedule,
        "daily_meals":     meal_plan,
        "progress_rules":  progress_rules,
        "summary": {
            "days_per_week":           sum(1 for d in weekly_schedule.values() if d["type"] == "workout"),
            "rest_days":               sum(1 for d in weekly_schedule.values() if d["type"] == "rest"),
            "calorie_target":          calorie_target,
            "difficulty_level":        difficulty,
            "expected_monthly_change": progress_rules["expected_change_per_month"],
            "metric":                  progress_rules["metric"],
        }
    }


def evaluate_progress(objective, progress_logs, current_programme, profile=None):
    """
    Evaluate user progress and decide if programme needs updating.

    Uses dynamic rules saved in the programme.

    Args:
        objective:         Objective instance
        progress_logs:     list of ProgressLog dicts
        current_programme: dict — the current saved programme
        profile:           UserProfile instance

    Returns:
        dict — {needs_update, reason, suggestion}
    """
    goal = objective.goal

    # Use dynamic rules saved in the programme, or recalculate if missing
    if "progress_rules" in current_programme:
        rules = current_programme["progress_rules"]
    elif profile:
        rules = _get_progress_rules(goal, profile, objective)
    else:
        rules = {
            "metric":                          "weight_kg",
            "expected_change_per_month":       -1.0,
            "tolerance":                       0.5,
            "upgrade_difficulty_after_months": 2,
        }

    if len(progress_logs) < 2:
        return {
            "needs_update":            False,
            "reason":                  "Not enough data yet (need at least 2 logs)",
            "suggestion":              "Keep logging your progress weekly.",
            "expected_monthly_change": rules["expected_change_per_month"],
            "metric":                  rules["metric"],
        }

    metric           = rules.get("metric", "weight_kg")
    expected_monthly = rules.get("expected_change_per_month", 0)
    tolerance        = rules.get("tolerance", 0.5)

    first_log = progress_logs[0]
    last_log  = progress_logs[-1]

    if metric not in first_log or metric not in last_log:
        return {"needs_update": False, "reason": f"Missing metric: {metric}"}

    actual_change = last_log[metric] - first_log[metric]

    from datetime import datetime
    try:
        d1     = datetime.fromisoformat(first_log["date"])
        d2     = datetime.fromisoformat(last_log["date"])
        months = max((d2 - d1).days / 30, 0.1)
    except Exception:
        months = len(progress_logs) / 4

    monthly_rate = actual_change / months
    gap          = abs(monthly_rate - expected_monthly)

    if gap > tolerance:
        if expected_monthly < 0 and monthly_rate > -tolerance:
            reason     = f"Weight loss too slow ({monthly_rate:.2f} kg/month, expected {expected_monthly})"
            suggestion = "Increase workout frequency or intensity. Consider switching to HIIT."
        elif expected_monthly > 0 and monthly_rate < tolerance:
            reason     = f"Muscle gain too slow ({monthly_rate:.2f} kg/month, expected {expected_monthly})"
            suggestion = "Increase protein intake and add more Strength sessions."
        else:
            reason     = f"Progress off target (actual: {monthly_rate:.2f}/month, expected: {expected_monthly})"
            suggestion = "Review your programme — consider upgrading difficulty level."

        return {
            "needs_update":            True,
            "reason":                  reason,
            "suggestion":              suggestion,
            "actual_monthly_change":   round(monthly_rate, 2),
            "expected_monthly_change": expected_monthly,
            "metric":                  metric,
        }

    # Check if ready to upgrade difficulty
    current_diff  = current_programme.get("difficulty", "Beginner")
    upgrade_after = rules.get("upgrade_difficulty_after_months", 2)

    if months >= upgrade_after:
        diff_order  = ["Beginner", "Intermediate", "Advanced"]
        current_idx = diff_order.index(current_diff) if current_diff in diff_order else 0
        if current_idx < 2:
            next_diff = diff_order[current_idx + 1]
            return {
                "needs_update":            True,
                "reason":                  f"Ready to level up after {months:.1f} months of good progress!",
                "suggestion":              f"Upgrade difficulty from {current_diff} to {next_diff}.",
                "new_difficulty":          next_diff,
                "actual_monthly_change":   round(monthly_rate, 2),
                "expected_monthly_change": expected_monthly,
                "metric":                  metric,
            }

    return {
        "needs_update":            False,
        "reason":                  f"Progress on track ({monthly_rate:.2f} {metric}/month)",
        "suggestion":              "Keep up the good work!",
        "actual_monthly_change":   round(monthly_rate, 2),
        "expected_monthly_change": expected_monthly,
        "metric":                  metric,
    }