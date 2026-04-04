# app/services/meal_service.py
import json
from datetime import date as date_type
from app import db
from app.models.meal import Meal

class MealService:

    @staticmethod
    def get_by_date(user_id: int, date_str: str):
        d = date_type.fromisoformat(date_str)
        return Meal.query.filter_by(user_id=user_id, date=d).all()

    @staticmethod
    def create(user_id: int, data: dict) -> Meal:
        food_items = data.get("food_items", [])
        meal = Meal(
            user_id    = user_id,
            meal_type  = data["meal"],
            food_items = json.dumps(food_items),
            calories   = int(data["calories"]),
            protein    = float(data.get("protein", 0)),
            carbs      = float(data.get("carbs", 0)),
            fat        = float(data.get("fat", 0)),
            fiber      = float(data.get("fiber", 0)),
            date       = date_type.fromisoformat(data["date"]),
        )
        db.session.add(meal)
        db.session.commit()
        return meal

    @staticmethod
    def delete(user_id: int, meal_id: int):
        meal = Meal.query.filter_by(id=meal_id, user_id=user_id).first_or_404()
        db.session.delete(meal)
        db.session.commit()