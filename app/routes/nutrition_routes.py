from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import requests
from app.services.meal_service import MealService
from app.services.nutrition_service import NutritionService

nutrition_bp = Blueprint("nutrition", __name__)
service = NutritionService()

# --- ROUTES DE GESTION DES REPAS (HISTORIQUE) ---

@nutrition_bp.route("/meals", methods=["GET"])
@jwt_required()
def get_meals():
    user_id = int(get_jwt_identity())
    date_str = request.args.get("date")
    if not date_str:
        return jsonify({"error": "La date est requise"}), 400
    meals = MealService.get_by_date(user_id, date_str)
    return jsonify({"meals": [m.to_dict() for m in meals]}), 200

@nutrition_bp.route("/log_meal", methods=["POST"])
@jwt_required()
def log_meal():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    # Vérification des champs requis pour la sauvegarde
    required_fields = ("meal", "food_items", "calories", "date")
    if not data or not all(k in data for k in required_fields):
        return jsonify({"error": "Champs manquants : meal, food_items, calories, date"}), 400
    
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


# --- ROUTES D'ANALYSE ALIMENTAIRE (EDAMAM) ---

@nutrition_bp.route('/analyze-food', methods=['POST'])
def analyze_food():
    data = request.get_json()
    food_name = data.get('food_name')
    quantity = float(data.get('quantity', 1)) # Récupère la quantité (ex: 2)
    selected_measure = data.get('measure', 'Gram') # Récupère l'unité (ex: "Whole")

    # Appel au service pour avoir les données de BASE (pour 100g)
    result = service.fetch_nutrition(food_name)
    
    if not result or "error" in result:
        return jsonify({"error": "Aliment non trouvé"}), 404

    # --- ÉTAPE 1 : TROUVER LE POIDS DE L'UNITÉ ---
    # On cherche dans la liste 'measures' celle qui a le bon label
    measure_info = next((m for m in result['measures'] if m['label'].lower() == selected_measure.lower()), None)
    
    # Si on trouve "Whole" (182g), on l'utilise, sinon on prend 1g par défaut
    weight_per_unit = measure_info['weight'] if measure_info else 1.0
    
    # Poids total = (ex: 182g * 2 pommes) = 364g
    total_weight = weight_per_unit * quantity
    
    # --- ÉTAPE 2 : CALCULER LE RATIO ---
    # Edamam donne les nutriments pour 100g. Si on mange 364g, le ratio est 3.64
    ratio = total_weight / 100.0

    # --- ÉTAPE 3 : APPLIQUER LE RATIO À TOUS LES NUTRIMENTS ---
    final_nutrients = {}
    for key, value in result['nutrients'].items():
        # On multiplie chaque nutriment (cal, pro, fat...) par le ratio
        final_nutrients[key] = round(value * ratio, 2)

    # --- ÉTAPE 4 : RENVOYER LE RÉSULTAT CALCULÉ ---
    # ATTENTION : Ne renvoyez pas 'result', renvoyez ce nouvel objet !
    return jsonify({
        "food_label": result['label'],
        "calculation_details": {
            "requested_quantity": quantity,
            "unit": selected_measure,
            "calculated_weight_grams": total_weight
        },
        "total_nutrients": final_nutrients
    }), 200


@nutrition_bp.route('/test-edamam', methods=['POST'])
def test_edamam():
    """ Route de debug pour voir la réponse brute d'Edamam """
    data = request.json
    food_name = data.get('food_name')
    
    params = {
        "app_id": service.app_id,
        "app_key": service.app_key,
        "ingr": food_name
    }
    try:
        r = requests.get(service.base_url, params=params)
        if r.status_code != 200:
            return jsonify({"status_code_api": r.status_code, "detail_api": r.text}), 400
        return jsonify(r.json()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500