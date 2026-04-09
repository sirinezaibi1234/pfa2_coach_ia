from app import db
from datetime import datetime


class TrainingSession(db.Model):
    __tablename__ = "training_sessions"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    session_date = db.Column(db.Date, nullable=False)
    workout_name = db.Column(db.String(140), nullable=True)
    workout_type = db.Column(db.String(30), nullable=False)
    intensity = db.Column(db.String(20), nullable=False)
    duration_minutes = db.Column(db.Integer, nullable=False)
    distance_km = db.Column(db.Float, nullable=True)
    notes = db.Column(db.Text, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship("User", backref=db.backref("training_sessions", lazy=True))

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "session_date": self.session_date.isoformat(),
            "date": self.session_date.isoformat(),
            "workout_name": self.workout_name or self.workout_type.title(),
            "workout_type": self.workout_type,
            "intensity": self.intensity,
            "duration_minutes": self.duration_minutes,
            "distance_km": self.distance_km,
            "notes": self.notes,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }