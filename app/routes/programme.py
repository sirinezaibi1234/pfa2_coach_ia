"""
app/routes/programme.py
All endpoints for sport programme generation, confirmation, and progress tracking.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

from app import db
from app.models.user import User
from app.models.user_profile import UserProfile
from app.models.objective import Objective
from app.models.programme import Programme, ProgressLog
from app.services.programme_service import generate_programme, evaluate_progress

programme_bp = Blueprint("programme", __name__)


def _get_current_user():
    return User.query.get_or_404(int(get_jwt_identity()))


# ── Generate initial programme ─────────────────────────────────────────────────
@programme_bp.route("/generate", methods=["POST"])
@jwt_required()
def generate():
    """
    Generate a new programme based on user profile + active objective.
    Body (optional): { "diet_preference": "Vegan" }
    """
    user      = _get_current_user()
    profile   = UserProfile.query.filter_by(user_id=user.id).first()
    objective = Objective.query.filter_by(user_id=user.id, is_active=True).first()

    if not profile:
        return jsonify({"error": "Please complete your profile first"}), 400
    if not objective:
        return jsonify({"error": "Please set an active objective first"}), 400

    data      = request.get_json() or {}
    diet_pref = data.get("diet_preference", "Balanced")

    VALID_DIETS = ["Vegan", "Vegetarian", "Paleo", "Keto", "Low-Carb", "Balanced"]
    if diet_pref not in VALID_DIETS:
        return jsonify({"error": f"diet_preference must be one of {VALID_DIETS}"}), 400

    # Archive any existing active programme
    old = Programme.query.filter_by(user_id=user.id, status="active").first()
    if old:
        old.status = "archived"

    programme_data = generate_programme(profile, objective, diet_pref)

    prog = Programme(
        user_id         = user.id,
        status          = "pending_confirmation",
        goal            = objective.goal,
        difficulty      = programme_data["difficulty"],
        diet_preference = diet_pref,
        calorie_target  = programme_data["calorie_target"],
        tdee            = programme_data["tdee"],
        programme_data  = programme_data,
    )
    db.session.add(prog)
    db.session.commit()

    return jsonify({
        "message":   "Programme generated — please review and confirm",
        "programme": prog.to_dict(),
    }), 201


# ── Get current programme ──────────────────────────────────────────────────────
@programme_bp.route("/me", methods=["GET"])
@jwt_required()
def get_my_programme():
    user = _get_current_user()
    prog = Programme.query.filter_by(user_id=user.id)\
                    .filter(Programme.status.in_(["pending_confirmation", "active", "confirmed"]))\
                    .order_by(Programme.created_at.desc()).first()

    if not prog:
        return jsonify({"error": "No active programme found. Call /generate first."}), 404

    return jsonify({"programme": prog.to_dict()}), 200


# ── Confirm programme ──────────────────────────────────────────────────────────
@programme_bp.route("/confirm", methods=["POST"])
@jwt_required()
def confirm():
    """User reviews the generated programme and confirms it."""
    user = _get_current_user()
    prog = Programme.query.filter_by(
        user_id=user.id, status="pending_confirmation"
    ).order_by(Programme.created_at.desc()).first()

    if not prog:
        return jsonify({"error": "No pending programme to confirm"}), 404

    prog.status       = "active"
    prog.confirmed_at = datetime.utcnow()
    db.session.commit()

    return jsonify({
        "message":   "Programme confirmed and activated!",
        "programme": prog.to_dict(),
    }), 200


# ── Adjust programme before confirming ────────────────────────────────────────
@programme_bp.route("/adjust", methods=["PATCH"])
@jwt_required()
def adjust():
    """
    User can tweak the pending programme before confirming.
    Body: { "diet_preference": "Keto", "difficulty": "Beginner" }
    """
    user = _get_current_user()
    prog = Programme.query.filter_by(
        user_id=user.id, status="pending_confirmation"
    ).order_by(Programme.created_at.desc()).first()

    if not prog:
        return jsonify({"error": "No pending programme to adjust"}), 404

    data       = request.get_json() or {}
    profile    = UserProfile.query.filter_by(user_id=user.id).first()
    objective  = Objective.query.filter_by(user_id=user.id, is_active=True).first()
    diet_pref  = data.get("diet_preference", prog.diet_preference)
    difficulty = data.get("difficulty", prog.difficulty)

    VALID_DIFFS = ["Beginner", "Intermediate", "Advanced"]
    if difficulty not in VALID_DIFFS:
        return jsonify({"error": f"difficulty must be one of {VALID_DIFFS}"}), 400

    new_data               = generate_programme(profile, objective, diet_pref)
    new_data["difficulty"] = difficulty

    prog.diet_preference = diet_pref
    prog.difficulty      = difficulty
    prog.calorie_target  = new_data["calorie_target"]
    prog.programme_data  = new_data
    db.session.commit()

    return jsonify({
        "message":   "Programme adjusted — confirm when ready",
        "programme": prog.to_dict(),
    }), 200


# ── Log progress ───────────────────────────────────────────────────────────────
@programme_bp.route("/progress/log", methods=["POST"])
@jwt_required()
def log_progress():
    """
    Log user progress.
    Body: { "weight_kg": 75.5, "body_fat_pct": 20.1, "session_duration_hours": 1.2, "notes": "..." }
    """
    user = _get_current_user()
    data = request.get_json() or {}

    prog = Programme.query.filter_by(user_id=user.id, status="active")\
                    .order_by(Programme.created_at.desc()).first()

    log = ProgressLog(
        user_id                = user.id,
        programme_id           = prog.id if prog else None,
        weight_kg              = data.get("weight_kg"),
        body_fat_pct           = data.get("body_fat_pct"),
        session_duration_hours = data.get("session_duration_hours"),
        notes                  = data.get("notes"),
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({
        "message": "Progress logged successfully",
        "log":     log.to_dict(),
    }), 201


# ── Get progress history ───────────────────────────────────────────────────────
@programme_bp.route("/progress", methods=["GET"])
@jwt_required()
def get_progress():
    user = _get_current_user()
    logs = ProgressLog.query.filter_by(user_id=user.id)\
                      .order_by(ProgressLog.logged_at.asc()).all()
    return jsonify({"progress": [l.to_dict() for l in logs]}), 200


# ── Review progress → update programme if needed ──────────────────────────────
@programme_bp.route("/review", methods=["POST"])
@jwt_required()
def review():
    """
    User manually triggers a progress review.
    AI evaluates logs and returns whether the programme needs updating.
    """
    user = _get_current_user()
    prog = Programme.query.filter_by(user_id=user.id, status="active")\
                    .order_by(Programme.created_at.desc()).first()

    if not prog:
        return jsonify({"error": "No active programme to review"}), 404

    objective = Objective.query.filter_by(user_id=user.id, is_active=True).first()
    logs      = ProgressLog.query.filter_by(user_id=user.id, programme_id=prog.id)\
                            .order_by(ProgressLog.logged_at.asc()).all()

    logs_data = [l.to_dict() for l in logs]
    result    = evaluate_progress(objective, logs_data, prog.programme_data)

    if result.get("needs_update"):
        new_diff = result.get("new_difficulty")
        if new_diff:
            profile  = UserProfile.query.filter_by(user_id=user.id).first()
            new_data = generate_programme(profile, objective, prog.diet_preference)
            new_data["difficulty"] = new_diff
            prog.difficulty     = new_diff
            prog.programme_data = new_data
            prog.status         = "pending_confirmation"
            db.session.commit()
            result["action"] = "Programme updated — please confirm the new version"
        else:
            result["action"] = "Consider adjusting your programme via /adjust"

    return jsonify(result), 200