import jwt
from flask import request, jsonify
from functools import wraps
import os
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models.user import User

SECRET = "secret123"

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        if "Authorization" in request.headers:
            token = request.headers["Authorization"].split(" ")[1]

        if not token:
            return jsonify({"message": "Token manquant"}), 401

        try:
            data = jwt.decode(token, SECRET, algorithms=["HS256"])
            request.user = data
        except:
            return jsonify({"message": "Token invalide"}), 401

        return f(*args, **kwargs)

    return decorated
def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user or user.role != "admin":
            return jsonify({"message": "Accès refusé"}), 403

        return f(*args, **kwargs)

    return decorated