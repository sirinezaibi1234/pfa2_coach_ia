from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app import db
from app.models.training_session import TrainingSession
from app.models.user import User

training_bp = Blueprint("training", __name__)

VALID_WORKOUT_TYPES = {"yoga", "strength", "cardio", "hitt"}
VALID_INTENSITIES = {"low", "medium", "high"}

WORKOUT_LABELS = {
    "yoga": "Yoga",
    "strength": "Strength",
    "cardio": "Cardio",
    "hitt": "HITT",
}


def _get_current_user():
    return User.query.get_or_404(int(get_jwt_identity()))


def _parse_session_date(raw_date):
    if not raw_date:
        return None

    try:
        return datetime.strptime(raw_date, "%Y-%m-%d").date()
    except (TypeError, ValueError):
        return None


def _workout_name(workout_type: str) -> str:
    return WORKOUT_LABELS.get(workout_type, workout_type.title())


@training_bp.route("/logs", methods=["GET"])
@jwt_required()
def get_logs():
    user = _get_current_user()
    selected_date = _parse_session_date(request.args.get("date"))

    query = TrainingSession.query.filter_by(user_id=user.id)
    if selected_date:
        query = query.filter_by(session_date=selected_date)

    logs = query.order_by(TrainingSession.session_date.desc(), TrainingSession.created_at.desc()).all()

    return jsonify({"logs": [log.to_dict() for log in logs]}), 200


@training_bp.route("/logs", methods=["POST"])
@jwt_required()
def create_log():
    user = _get_current_user()
    data = request.get_json() or {}

    workout_type = (data.get("workout_type") or "").strip().lower()
    intensity = (data.get("intensity") or "").strip().lower()
    duration_minutes = data.get("duration_minutes")
    session_date = _parse_session_date(data.get("session_date"))

    if workout_type not in VALID_WORKOUT_TYPES:
        return jsonify({"error": "workout_type is invalid"}), 400
    if intensity not in VALID_INTENSITIES:
        return jsonify({"error": "intensity is invalid"}), 400
    if session_date is None:
        return jsonify({"error": "session_date must be in YYYY-MM-DD format"}), 400

    try:
        duration_minutes = int(duration_minutes)
    except (TypeError, ValueError):
        return jsonify({"error": "duration_minutes must be a positive integer"}), 400

    if duration_minutes <= 0:
        return jsonify({"error": "duration_minutes must be greater than 0"}), 400

    distance_km = data.get("distance_km")
    try:
        distance_km = float(distance_km) if distance_km not in (None, "") else None
    except (TypeError, ValueError):
        return jsonify({"error": "distance_km must be numeric when provided"}), 400

    notes = (data.get("notes") or "").strip() or None

    log = TrainingSession(
        user_id=user.id,
        session_date=session_date,
        workout_name=_workout_name(workout_type),
        workout_type=workout_type,
        intensity=intensity,
        duration_minutes=duration_minutes,
        distance_km=distance_km,
        notes=notes,
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({"message": "Training log created", "log": log.to_dict()}), 201


@training_bp.route("/logs/<int:log_id>", methods=["DELETE"])
@jwt_required()
def delete_log(log_id):
    user = _get_current_user()
    log = TrainingSession.query.filter_by(id=log_id, user_id=user.id).first()

    if not log:
        return jsonify({"error": "Training log not found"}), 404

    db.session.delete(log)
    db.session.commit()

    return jsonify({"message": "Training log deleted"}), 200