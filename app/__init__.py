from flask import Flask, app
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os
from flask_cors import CORS

load_dotenv()

db = SQLAlchemy()
jwt = JWTManager()


def _get_allowed_origins():
    raw_origins = os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001",
    )
    return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]


def create_app():
    app = Flask(__name__)
    CORS(
        app,
        resources={r"/api/*": {"origins": _get_allowed_origins()}},
        supports_credentials=False,
    )
    # Config
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "jwt-dev-secret")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 3600))

    # Extensions
    db.init_app(app)
    jwt.init_app(app)

    # Blueprints
    from app.routes.auth import auth_bp
    from app.routes.users import users_bp
    from app.routes.profile import profile_bp
    from app.routes.programme import programme_bp
    from app.routes.ai import ai_bp
    from app.routes.nutrition_routes import nutrition_bp
    from app.routes.water import water_bp
    from app.routes.admin_routes import admin_bp
    

    app.register_blueprint(auth_bp,      url_prefix="/api/auth")
    app.register_blueprint(users_bp,     url_prefix="/api/users")
    app.register_blueprint(profile_bp,   url_prefix="/api/profile")
    app.register_blueprint(programme_bp, url_prefix="/api/programme")
    app.register_blueprint(ai_bp,        url_prefix="/api/ai")
    app.register_blueprint(nutrition_bp, url_prefix="/api/nutrition")
    app.register_blueprint(water_bp,     url_prefix="/api/water")
    app.register_blueprint(admin_bp,    url_prefix="/api/admin")

    
    # Create tables
    with app.app_context():
        from app.models.user import User
        from app.models.user_profile import UserProfile
        from app.models.objective import Objective
        from app.models.programme import Programme, ProgressLog
        from app.models.meal import Meal
        from app.models.water_log import WaterLog
        from app.models.nutrition import Food, MealLog

        db.create_all()

    return app