# app/routes/water.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.water_service import WaterService

water_bp = Blueprint("water", __name__)


@water_bp.route("/water", methods=["GET"])
@jwt_required()
def get_water():
    """
    GET /water?date=YYYY-MM-DD
    Retourne le nombre de verres pour la date donnée.
    """
    user_id  = int(get_jwt_identity())
    date_str = request.args.get("date")
    if not date_str:
        return jsonify({"error": "date is required"}), 400

    log = WaterService.get(user_id, date_str)
    if not log:
        return jsonify({"date": date_str, "glasses": 0}), 200
    return jsonify(log.to_dict()), 200


@water_bp.route("/water", methods=["PUT"])
@jwt_required()
def update_water():
    """
    PUT /water
    Body: { "date": "YYYY-MM-DD", "glasses": 5 }
    Crée ou met à jour l'entrée hydratation du jour.
    """
    user_id = int(get_jwt_identity())
    data    = request.get_json()

    if not data or "date" not in data or "glasses" not in data:
        return jsonify({"error": "date and glasses are required"}), 400

    try:
        glasses = int(data["glasses"])
    except (ValueError, TypeError):
        return jsonify({"error": "glasses must be an integer"}), 400

    try:
        log = WaterService.upsert(user_id, data["date"], glasses)
        return jsonify(log.to_dict()), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500