from app import db
from datetime import datetime


class UserProfile(db.Model):
    __tablename__ = "user_profiles"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), unique=True, nullable=False)

    # Physical info
    weight = db.Column(db.Float, nullable=True)          # in kg
    height = db.Column(db.Float, nullable=True)          # in cm
    age = db.Column(db.Integer, nullable=True)
    gender = db.Column(db.String(10), nullable=True)     # "male" / "female" / "other"

    # Activity level
    # sedentary, lightly_active, moderately_active, very_active, extra_active
    activity_level = db.Column(db.String(30), nullable=True)

    # Health conditions & allergies (stored as text, comma-separated)
    health_conditions = db.Column(db.Text, nullable=True)  # e.g. "diabetes, hypertension"
    allergies = db.Column(db.Text, nullable=True)           # e.g. "gluten, lactose"

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    user = db.relationship("User", backref=db.backref("profile", uselist=False))

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "weight": self.weight,
            "height": self.height,
            "age": self.age,
            "gender": self.gender,
            "activity_level": self.activity_level,
            "health_conditions": self.health_conditions.split(",") if self.health_conditions else [],
            "allergies": self.allergies.split(",") if self.allergies else [],
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }

    def __repr__(self):
        return f"<UserProfile user_id={self.user_id}>"