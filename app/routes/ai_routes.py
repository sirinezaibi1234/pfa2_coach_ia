from flask import Blueprint, request, jsonify
from app.services.ai_service import AIService
from app.services.nutrition_service import NutritionService
import os

ai_bp = Blueprint('ai', __name__)
ai_service = AIService()
nutrition_service = NutritionService()

@ai_bp.route('/scan-plate', methods=['POST'])
def scan_plate():
    if 'image' not in request.files:
        return jsonify({"error": "Image manquante"}), 400
        
    image = request.files['image']
    temp_path = "temp_upload.jpg"
    image.save(temp_path)

    # 1. Identifier les aliments avec Roboflow
    detected_labels = ai_service.detect_food(temp_path)
    
    if not detected_labels:
        os.remove(temp_path)
        return jsonify({"message": "Aucun aliment identifié", "foods": []}), 200

    # 2. Chercher les infos nutritionnelles pour chaque aliment trouvé
    results = []
    for food in detected_labels:
        nutri_info = nutrition_service.fetch_nutrition(food)
        if nutri_info:
            results.append({
                "food_name": food,
                "nutrition": nutri_info # Contient calories, protéines, etc.
            })

    os.remove(temp_path)
    return jsonify({
        "detected_count": len(results),
        "foods": results
    }), 200