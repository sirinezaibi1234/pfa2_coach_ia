from app import db
from app.models.user import User

ALLOWED_ROLES = ["user", "admin"]


class UserService:

    @staticmethod
    def get_all_users():
        """Return all users (active and inactive) — admin use"""
        return User.query.order_by(User.created_at.desc()).all()

    @staticmethod
    def get_active_users():
        """Return only active users"""
        return User.query.filter_by(is_active=True).all()

    @staticmethod
    def get_user_by_id(user_id):
        """Get a user by ID or 404"""
        return User.query.get_or_404(user_id)

    @staticmethod
    def update_user(user_id, data):
        """Update username, email, or password of a user"""
        user = User.query.get_or_404(user_id)

        if "username" in data:
            existing = User.query.filter_by(username=data["username"]).first()
            if existing and existing.id != user.id:
                raise ValueError("Username already taken")
            user.username = data["username"]

        if "email" in data:
            existing = User.query.filter_by(email=data["email"]).first()
            if existing and existing.id != user.id:
                raise ValueError("Email already in use")
            user.email = data["email"]

        if "password" in data:
            user.set_password(data["password"])

        db.session.commit()
        return user

    @staticmethod
    def deactivate_user(user_id):
        """Soft delete — sets is_active to False"""
        user = User.query.get_or_404(user_id)
        user.is_active = False
        db.session.commit()
        return user

    @staticmethod
    def change_user_role(user_id, new_role):
        """Admin: change a user's role"""
        if new_role not in ALLOWED_ROLES:
            raise ValueError(f"Invalid role. Allowed: {ALLOWED_ROLES}")
        user = User.query.get_or_404(user_id)
        user.role = new_role
        db.session.commit()
        return user