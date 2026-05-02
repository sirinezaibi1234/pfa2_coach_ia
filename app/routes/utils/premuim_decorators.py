# app/utils/decorators.py
from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from app.models.subscription import Subscription # Votre futur modèle
from datetime import datetime

def premium_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = get_jwt_identity()
        
        # Vérifier l'abonnement en BDD
        sub = Subscription.query.filter_by(user_id=user_id, is_active=True).first()
        
        # Vérifier si l'abonnement existe et n'est pas expiré
        if not sub or (sub.end_date and sub.end_date < datetime.utcnow()):
            return jsonify({
                "error": "Premium Required", 
                "message": "Cette fonctionnalité nécessite un abonnement actif."
            }), 403
            
        return f(*args, **kwargs)
    return decorated_function