from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.routes.auth import admin_required
from app.services.user_service import UserService

users_bp = Blueprint("users", __name__)


# ─── Admin only ───────────────────────────────────────────────────────────────

@users_bp.route("/", methods=["GET"])
@admin_required
def list_all_users():
    """Admin: get all users"""
    users = UserService.get_all_users()
    return jsonify({"users": [u.to_dict() for u in users]}), 200


@users_bp.route("/<int:user_id>", methods=["GET"])
@admin_required
def get_user(user_id):
    """Admin: get any user by ID"""
    user = UserService.get_user_by_id(user_id)
    return jsonify({"user": user.to_dict()}), 200


@users_bp.route("/<int:user_id>/deactivate", methods=["PUT"])
@admin_required
def deactivate_user(user_id):
    """Admin: deactivate any user"""
    user = UserService.deactivate_user(user_id)
    return jsonify({"message": f"User {user.username} deactivated"}), 200


@users_bp.route("/<int:user_id>/role", methods=["PUT"])
@admin_required
def change_role(user_id):
    """Admin: change a user's role"""
    data = request.get_json()
    if not data or "role" not in data:
        return jsonify({"error": "role is required"}), 400

    user = UserService.change_user_role(user_id, data["role"])
    return jsonify({"message": f"Role updated to {user.role}", "user": user.to_dict()}), 200


# ─── Authenticated user (own profile) ────────────────────────────────────────

@users_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    """User: get own profile"""
    user_id = int(get_jwt_identity())            # ← str → int
    user = UserService.get_user_by_id(user_id)
    return jsonify({"user": user.to_dict()}), 200


@users_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    """User: update own profile"""
    user_id = int(get_jwt_identity())            # ← str → int
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    try:
        user = UserService.update_user(user_id, data)
        return jsonify({"message": "Profile updated", "user": user.to_dict()}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@users_bp.route("/profile", methods=["DELETE"])
@jwt_required()
def delete_account():
    """User: deactivate own account"""
    user_id = int(get_jwt_identity())            # ← str → int
    user = UserService.deactivate_user(user_id)
    return jsonify({"message": "Account deactivated"}), 200