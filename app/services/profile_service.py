from app import db
from app.models.user_profile import UserProfile
from app.models.objective import Objective, VALID_GOALS
from datetime import datetime
from dateutil.relativedelta import relativedelta


class ProfileService:

    @staticmethod
    def get_profile(user_id):
        """Get user profile, or None if not created yet"""
        return UserProfile.query.filter_by(user_id=user_id).first()

    @staticmethod
    def create_or_update_profile(user_id, data):
        """Create profile if it doesn't exist, otherwise update it"""
        profile = UserProfile.query.filter_by(user_id=user_id).first()

        # Validate gender
        if "gender" in data and data["gender"] not in ["male", "female", "other"]:
            raise ValueError("Gender must be: male, female, or other")

        # Validate activity level
        valid_activity = ["sedentary", "lightly_active", "moderately_active", "very_active", "extra_active"]
        if "activity_level" in data and data["activity_level"] not in valid_activity:
            raise ValueError(f"Activity level must be one of: {valid_activity}")

        if not profile:
            profile = UserProfile(user_id=user_id)
            db.session.add(profile)

        # Update fields
        if "weight" in data:
            profile.weight = data["weight"]
        if "height" in data:
            profile.height = data["height"]
        if "age" in data:
            profile.age = data["age"]
        if "gender" in data:
            profile.gender = data["gender"]
        if "activity_level" in data:
            profile.activity_level = data["activity_level"]
        if "health_conditions" in data:
            # Accept list or string
            if isinstance(data["health_conditions"], list):
                profile.health_conditions = ",".join(data["health_conditions"])
            else:
                profile.health_conditions = data["health_conditions"]
        if "allergies" in data:
            if isinstance(data["allergies"], list):
                profile.allergies = ",".join(data["allergies"])
            else:
                profile.allergies = data["allergies"]

        db.session.commit()
        return profile


class ObjectiveService:

    @staticmethod
    def get_active_objective(user_id):
        """Get the current active objective for a user"""
        return Objective.query.filter_by(user_id=user_id, is_active=True).first()

    @staticmethod
    def get_all_objectives(user_id):
        """Get all objectives (history) for a user"""
        return Objective.query.filter_by(user_id=user_id).order_by(Objective.created_at.desc()).all()

    @staticmethod
    def create_objective(user_id, data):
        """Create a new objective — deactivates the previous one"""
        if "goal" not in data:
            raise ValueError("goal is required")

        if data["goal"] not in VALID_GOALS:
            raise ValueError(f"Invalid goal. Choose from: {VALID_GOALS}")

        # Deactivate current active objective
        current = Objective.query.filter_by(user_id=user_id, is_active=True).first()
        if current:
            current.is_active = False

        # Calculate end date if duration provided
        end_date = None
        if "duration_months" in data and data["duration_months"]:
            end_date = datetime.utcnow() + relativedelta(months=data["duration_months"])

        objective = Objective(
            user_id=user_id,
            goal=data["goal"],
            target_weight=data.get("target_weight"),
            duration_months=data.get("duration_months"),
            is_active=True,
            end_date=end_date,
        )

        db.session.add(objective)
        db.session.commit()
        return objective

    @staticmethod
    def update_objective(user_id, data):
        """Update the current active objective"""
        objective = Objective.query.filter_by(user_id=user_id, is_active=True).first()
        if not objective:
            raise ValueError("No active objective found")

        if "goal" in data:
            if data["goal"] not in VALID_GOALS:
                raise ValueError(f"Invalid goal. Choose from: {VALID_GOALS}")
            objective.goal = data["goal"]

        if "target_weight" in data:
            objective.target_weight = data["target_weight"]

        if "duration_months" in data:
            objective.duration_months = data["duration_months"]
            objective.end_date = datetime.utcnow() + relativedelta(months=data["duration_months"])

        db.session.commit()
        return objective