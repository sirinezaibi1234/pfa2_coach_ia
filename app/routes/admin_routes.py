from flask import Blueprint, jsonify, request
from app.services.admin_service import *
from app.services.auth_service import admin_required
from flask_jwt_extended import jwt_required, get_jwt_identity

admin_bp = Blueprint("admin", __name__)

# 📋 users
@admin_bp.route("/users", methods=["GET"])
@jwt_required()
@admin_required
def get_users():
    users = get_all_users()
    return jsonify([u.to_dict() for u in users])

# ❌ delete
@admin_bp.route("/users/<int:id>", methods=["DELETE"])
@jwt_required()
@admin_required
def delete(id):
    if delete_user(id):
        return jsonify({"message": "Deleted"})
    return jsonify({"message": "Not found"}), 404

# 🔄 toggle
@admin_bp.route("/users/toggle/<int:id>", methods=["PUT"])
@jwt_required()
@admin_required
def toggle(id):
    user = toggle_user(id)
    if user:
        return jsonify({"is_active": user.is_active})
    return jsonify({"message": "Not found"}), 404

# ✏️ update
@admin_bp.route("/users/<int:id>", methods=["PUT"])
@jwt_required()
@admin_required
def update(id):
    data = request.json
    user = update_user(id, data)
    if user:
        return jsonify({"message": "Updated"})
    return jsonify({"message": "Not found"}), 404

# 🔑 reset password
@admin_bp.route("/users/reset-password/<int:id>", methods=["PUT"])
@jwt_required()
@admin_required
def reset(id):
    new_pass = reset_password(id)
    if new_pass:
        return jsonify({"newPassword": new_pass})
    return jsonify({"message": "Not found"}), 404

# 📊 stats
@admin_bp.route("/stats", methods=["GET"])
@jwt_required()
@admin_required
def stats():
    return jsonify(get_stats())

# 🧪 test
@admin_bp.route("/test", methods=["GET"])
@jwt_required()
def test():
    return {"user_id": get_jwt_identity()}