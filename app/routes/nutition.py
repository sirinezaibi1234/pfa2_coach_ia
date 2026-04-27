# app/routes/nutrition.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.meal_service import MealService
from app.services.nutrition_service import NutritionService

nutrition_bp = Blueprint("nutrition", __name__)
service = NutritionService()

@nutrition_bp.route("/meals", methods=["GET"])
@jwt_required()
def get_meals():
    user_id  = int(get_jwt_identity())
    date_str = request.args.get("date")
    if not date_str:
        return jsonify({"error": "date is required"}), 400
    meals = MealService.get_by_date(user_id, date_str)
    return jsonify({"meals": [m.to_dict() for m in meals]}), 200


@nutrition_bp.route("/log_meal", methods=["POST"])
@jwt_required()
def log_meal():
    user_id = int(get_jwt_identity())
    data    = request.get_json()
    if not data or not all(k in data for k in ("meal", "food_items", "calories", "date")):
        return jsonify({"error": "meal, food_items, calories, date sont requis"}), 400
    try:
        meal = MealService.create(user_id, data)
        return jsonify({"meal": meal.to_dict()}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@nutrition_bp.route("/meal/<int:meal_id>", methods=["DELETE"])
@jwt_required()
def delete_meal(meal_id):
    user_id = int(get_jwt_identity())
    MealService.delete(user_id, meal_id)
    return jsonify({"deleted": True}), 200 
@nutrition_bp.route("/meal/<int:meal_id>", methods=["GET"])
@jwt_required()
def get_detail_meal(meal_id):
    user_id = int(get_jwt_identity())
    meal = MealService.get_by_id(user_id, meal_id)
    if not meal:
        return jsonify({"error": "Meal not found"}), 404
    return jsonify({"meal": meal.to_dict()}), 200

# @nutrition_bp.route('/analyze-food', methods=['POST'])
# def analyze_food():
#     data = request.json
#     food_name = data.get('food_name') # Ex: "100g avocado"
    
#     # 1. Optionnel : Vérifier d'abord en BDD (Postgres)
#     # 2. Si non trouvé, appeler le service
#     result = service.fetch_nutrition(food_name)
    
#     return jsonify(result), 200
# @nutrition_bp.route('/test-edamam', methods=['POST'])
# def test_edamam():
#     data = request.json
#     food_name = data.get('food_name')
    
#     # Appel direct au service (sans passer par la BDD pour l'instant)
#     result = service.fetch_nutrition(food_name) 
    
#     if result:
#         return jsonify(result), 200
#     return jsonify({"error": "Erreur API"}), 400