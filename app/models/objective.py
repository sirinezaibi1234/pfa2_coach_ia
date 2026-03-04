from app import db
from datetime import datetime


VALID_GOALS = ["lose_weight", "gain_muscle", "maintain_weight", "improve_endurance"]


class Objective(db.Model):
    __tablename__ = "objectives"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    goal = db.Column(db.String(30), nullable=False)         # e.g. "lose_weight"
    target_weight = db.Column(db.Float, nullable=True)      # optional target weight in kg
    duration_months = db.Column(db.Integer, nullable=True)  # e.g. 6 months
    is_active = db.Column(db.Boolean, default=True)         # only one active at a time

    start_date = db.Column(db.DateTime, default=datetime.utcnow)
    end_date = db.Column(db.DateTime, nullable=True)        # calculated from duration

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    user = db.relationship("User", backref=db.backref("objectives", lazy=True))

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "goal": self.goal,
            "target_weight": self.target_weight,
            "duration_months": self.duration_months,
            "is_active": self.is_active,
            "start_date": self.start_date.isoformat(),
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }

    def __repr__(self):
        return f"<Objective user_id={self.user_id} goal={self.goal}>"