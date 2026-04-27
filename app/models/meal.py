# app/models/meal.py
from app import db
from datetime import datetime

class Meal(db.Model):
    __tablename__ = "meals"

    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    meal_type  = db.Column(db.String(20), nullable=False)  # breakfast/lunch/dinner/snack
    food_items = db.Column(db.Text, nullable=False)        # JSON string ["Chicken", "Rice"]
    calories   = db.Column(db.Integer, nullable=False)
    protein    = db.Column(db.Float, default=0)
    carbs      = db.Column(db.Float, default=0)
    fat        = db.Column(db.Float, default=0)
    fiber      = db.Column(db.Float, default=0)
    date       = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        import json
        return {
            "id":         self.id,
            "meal":       self.meal_type,
            "foodItems":  json.loads(self.food_items),  # camelCase pour le front
            "calories":   self.calories,
            "protein":    self.protein,
            "carbs":      self.carbs,
            "fat":        self.fat,
            "fiber":      self.fiber,
            "date":       self.date.isoformat(),
        }