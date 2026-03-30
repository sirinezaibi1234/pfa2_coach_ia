from flask import Blueprint, jsonify
from app.routes.users import get_user
from services.calorie_service import *

calorie_bp = Blueprint('calorie', __name__)

@calorie_bp.route('/calories/status/<int:user_id>')
def get_status(user_id):
    user = get_user(user_id)
    consumed = get_today_calories(db, user_id)
    tdee = calculate_tdee(user)

    status = calorie_status(consumed, tdee)
    risk = risk_level(consumed, tdee)

    return jsonify({
        "tdee": tdee,
        "consumed": consumed,
        "status": status,
        "risk": risk
    })