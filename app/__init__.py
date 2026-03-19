from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os

load_dotenv()

db = SQLAlchemy()
jwt = JWTManager()


def create_app():
    app = Flask(__name__)

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
    from app.routes.programme import programme_bp          # ← NEW

    app.register_blueprint(auth_bp,       url_prefix="/api/auth")
    app.register_blueprint(users_bp,      url_prefix="/api/users")
    app.register_blueprint(profile_bp,    url_prefix="/api/profile")
    app.register_blueprint(programme_bp,  url_prefix="/api/programme")   # ← NEW

    # Create tables
    with app.app_context():
        from app.models.user import User
        from app.models.user_profile import UserProfile
        from app.models.objective import Objective
        from app.models.programme import Programme, ProgressLog     # ← NEW

        db.create_all()

    return app