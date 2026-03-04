from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.profile_service import ProfileService, ObjectiveService

profile_bp = Blueprint("profile", __name__)


# ─── Profile Routes ───────────────────────────────────────────────────────────

@profile_bp.route("/", methods=["GET", "POST", "PUT"])
@jwt_required()
def profile():
    """GET: get profile | POST/PUT: create or update profile"""
    user_id = int(get_jwt_identity())

    if request.method == "GET":
        profile = ProfileService.get_profile(user_id)
        if not profile:
            return jsonify({"message": "Profile not created yet", "profile": None}), 200
        return jsonify({"profile": profile.to_dict()}), 200

    # POST or PUT
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
    try:
        profile = ProfileService.create_or_update_profile(user_id, data)
        return jsonify({
            "message": "Profile saved successfully",
            "profile": profile.to_dict()
        }), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


# ─── Objective Routes ─────────────────────────────────────────────────────────

@profile_bp.route("/objective", methods=["GET", "POST", "PUT"])
@jwt_required()
def objective():
    """GET: get active objective | POST: create new | PUT: update current"""
    user_id = int(get_jwt_identity())

    if request.method == "GET":
        objective = ObjectiveService.get_active_objective(user_id)
        if not objective:
            return jsonify({"message": "No active objective", "objective": None}), 200
        return jsonify({"objective": objective.to_dict()}), 200

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    try:
        if request.method == "POST":
            obj = ObjectiveService.create_objective(user_id, data)
            return jsonify({
                "message": "Objective created successfully",
                "objective": obj.to_dict()
            }), 201
        else:  # PUT
            obj = ObjectiveService.update_objective(user_id, data)
            return jsonify({
                "message": "Objective updated successfully",
                "objective": obj.to_dict()
            }), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@profile_bp.route("/objective/history", methods=["GET"])
@jwt_required()
def get_objective_history():
    """Get all past and current objectives"""
    user_id = int(get_jwt_identity())
    objectives = ObjectiveService.get_all_objectives(user_id)
    return jsonify({"objectives": [o.to_dict() for o in objectives]}), 200