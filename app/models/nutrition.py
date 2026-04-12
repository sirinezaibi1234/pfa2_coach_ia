from app import db # Ou votre instance SQLAlchemy
from datetime import datetime

class Food(db.Model):
    """
    Catalogue des aliments (Cache pour l'API Edamam)
    """
    __tablename__ = 'foods'

    id = db.Column(db.Integer, primary_key=True)
    edamam_food_id = db.Column(db.String(255), unique=True, nullable=True)
    label = db.Column(db.String(255), nullable=False)
    
    # Nutriments pour 100g (valeurs standard renvoyées par l'API)
    calories = db.Column(db.Float, default=0.0)
    protein = db.Column(db.Float, default=0.0)
    fat = db.Column(db.Float, default=0.0)
    carbs = db.Column(db.Float, default=0.0)
    
    image_url = db.Column(db.Text, nullable=True)

    def __repr__(self):
        return f'<Food {self.label}>'


class MealLog(db.Model):
    """
    Journal des repas consommés par l'utilisateur
    """
    __tablename__ = 'meal_logs'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False) # Assurez-vous d'avoir une table users
    food_id = db.Column(db.Integer, db.ForeignKey('foods.id'), nullable=False)
    
    # Données spécifiques à la consommation
    weight_grams = db.Column(db.Float, nullable=False)
    total_calories = db.Column(db.Float, nullable=False) # Calculé : (weight/100) * food.calories
    
    # Source de la donnée
    # 'manual' pour saisie texte, 'yolo_vision' pour la détection photo
    entry_method = db.Column(db.String(50), default='manual')
    
    logged_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relations
    food = db.relationship('Food', backref='logs')

    def __repr__(self):
        return f'<MealLog {self.food.label} - {self.total_calories} kcal>'
    
