from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app import db
from app.models.training_log import TrainingLog

training_bp = Blueprint("training", __name__)

_ALLOWED_WORKOUTS = {"cardio", "strength", "flexibility", "sports"}
_ALLOWED_INTENSITY = {"low", "medium", "high"}


def _parse_date(value: str):
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except (TypeError, ValueError):
        return None


@training_bp.route("/logs", methods=["GET"], strict_slashes=False)
@jwt_required()
def get_logs():
    user_id = int(get_jwt_identity())
    date_str = request.args.get("date")

    query = TrainingLog.query.filter_by(user_id=user_id)
    if date_str:
        session_date = _parse_date(date_str)
        if not session_date:
            return jsonify({"error": "date must be YYYY-MM-DD"}), 400
        query = query.filter(TrainingLog.session_date == session_date)

    logs = query.order_by(
        TrainingLog.session_date.desc(),
        TrainingLog.created_at.desc(),
    ).all()

    return jsonify({"logs": [log.to_dict() for log in logs]}), 200


@training_bp.route("/logs", methods=["POST"], strict_slashes=False)
@jwt_required()
def create_log():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    required_fields = ("workout_type", "intensity", "duration_minutes", "session_date")
    if not all(field in data for field in required_fields):
        return jsonify({"error": "workout_type, intensity, duration_minutes, session_date are required"}), 400

    workout_type = str(data.get("workout_type", "")).lower().strip()
    intensity = str(data.get("intensity", "")).lower().strip()
    session_date = _parse_date(data.get("session_date"))

    if workout_type not in _ALLOWED_WORKOUTS:
        return jsonify({"error": "workout_type is invalid"}), 400
    if intensity not in _ALLOWED_INTENSITY:
        return jsonify({"error": "intensity is invalid"}), 400
    if not session_date:
        return jsonify({"error": "session_date must be YYYY-MM-DD"}), 400

    try:
        duration_minutes = int(data.get("duration_minutes"))
    except (TypeError, ValueError):
        return jsonify({"error": "duration_minutes must be an integer"}), 400

    if duration_minutes <= 0:
        return jsonify({"error": "duration_minutes must be greater than 0"}), 400

    distance_km = data.get("distance_km")
    if distance_km is not None:
        try:
            distance_km = float(distance_km)
        except (TypeError, ValueError):
            return jsonify({"error": "distance_km must be a number"}), 400

    notes = data.get("notes")
    if notes is not None:
        notes = str(notes).strip() or None

    log = TrainingLog(
        user_id=user_id,
        session_date=session_date,
        workout_type=workout_type,
        intensity=intensity,
        duration_minutes=duration_minutes,
        distance_km=distance_km,
        notes=notes,
    )

    db.session.add(log)
    db.session.commit()

    return jsonify({"message": "Training log created", "log": log.to_dict()}), 201


@training_bp.route("/logs/<int:log_id>", methods=["DELETE"], strict_slashes=False)
@jwt_required()
def delete_log(log_id: int):
    user_id = int(get_jwt_identity())
    log = TrainingLog.query.filter_by(id=log_id, user_id=user_id).first()
    if not log:
        return jsonify({"error": "Training log not found"}), 404

    db.session.delete(log)
    db.session.commit()

    return jsonify({"message": "Training log deleted"}), 200
