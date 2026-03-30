from datetime import date

def calculate_bmr(user):
    if user.gender == "male":
        return 10 * user.weight + 6.25 * user.height - 5 * user.age + 5
    else:
        return 10 * user.weight + 6.25 * user.height - 5 * user.age - 161


def activity_factor(level):
    factors = {
        "sedentary": 1.2,
        "light": 1.375,
        "moderate": 1.55,
        "active": 1.725
    }
    return factors.get(level, 1.2)


def calculate_tdee(user):
    bmr = calculate_bmr(user)
    factor = activity_factor(user.activity_level)
    return bmr * factor

def get_today_calories(db, user_id):
    meals = db.query(Meal).filter(
        Meal.user_id == user_id,
        Meal.meal_time >= date.today()
    ).all()

    return sum(meal.calories for meal in meals)
def calorie_status(consumed, tdee):
    ratio = consumed / tdee

    if ratio < 0.9:
        return "deficit"
    elif ratio <= 1.1:
        return "balanced"
    else:
        return "surplus"


def risk_level(consumed, tdee):
    diff = consumed - tdee

    if diff < 200:
        return "low"
    elif diff < 500:
        return "medium"
    else:
        return "high"