# app/utils/decorators.py
from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.models.user import User


def admin_required(fn):
    """
    Decorator qui vérifie que le user connecté a le rôle 'admin'.
    À utiliser sur toutes les routes admin après @jwt_required().

    Usage:
        @admin_bp.route('/users')
        @admin_required
        def get_users():
            ...
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        # 1. Vérifier que le token JWT est présent et valide
        verify_jwt_in_request()

        # 2. Récupérer l'id du user depuis le token
        user_id = int(get_jwt_identity())

        # 3. Charger le user depuis la base
        user = User.query.get(user_id)

        # 4. Vérifier l'existence et le rôle
        if not user:
            return jsonify({"error": "Utilisateur introuvable"}), 404

        if not user.is_admin():
            return jsonify({"error": "Accès refusé. Droits administrateur requis."}), 403

        if not user.is_active:
            return jsonify({"error": "Compte désactivé"}), 403

        # 5. Tout est ok, on exécute la route
        return fn(*args, **kwargs)

    return wrapper