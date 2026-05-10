from datetime import datetime, date

from app import db


class TrainingLog(db.Model):
    __tablename__ = "training_logs"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    session_date = db.Column(db.Date, nullable=False, default=date.today)
    workout_type = db.Column(db.String(32), nullable=False)
    intensity = db.Column(db.String(16), nullable=False)
    duration_minutes = db.Column(db.Integer, nullable=False)
    distance_km = db.Column(db.Float, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = db.relationship("User", backref=db.backref("training_logs", lazy=True))

    def to_dict(self):
        session_date = self.session_date.isoformat() if self.session_date else None
        return {
            "id": self.id,
            "user_id": self.user_id,
            "session_date": session_date,
            "date": session_date,
            "workout_type": self.workout_type,
            "intensity": self.intensity,
            "duration_minutes": self.duration_minutes,
            "distance_km": self.distance_km,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
