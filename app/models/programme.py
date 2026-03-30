"""
app/models/programme.py
"""
from app import db
from datetime import datetime


class Programme(db.Model):
    __tablename__ = "programmes"

    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    # Status: pending_confirmation → confirmed → active → archived
    status     = db.Column(db.String(30), default="pending_confirmation")

    goal            = db.Column(db.String(30), nullable=False)
    difficulty      = db.Column(db.String(20), nullable=False)
    diet_preference = db.Column(db.String(30), nullable=False, default="Balanced")
    calorie_target  = db.Column(db.Integer, nullable=True)
    tdee            = db.Column(db.Integer, nullable=True)

    # Full programme stored as JSON
    programme_data  = db.Column(db.JSON, nullable=False)

    created_at   = db.Column(db.DateTime, default=datetime.utcnow)
    confirmed_at = db.Column(db.DateTime, nullable=True)
    updated_at   = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship("User", backref=db.backref("programmes", lazy=True))

    def to_dict(self):
        return {
            "id":              self.id,
            "user_id":         self.user_id,
            "status":          self.status,
            "goal":            self.goal,
            "difficulty":      self.difficulty,
            "diet_preference": self.diet_preference,
            "calorie_target":  self.calorie_target,
            "tdee":            self.tdee,
            "programme_data":  self.programme_data,
            "created_at":      self.created_at.isoformat(),
            "confirmed_at":    self.confirmed_at.isoformat() if self.confirmed_at else None,
            "updated_at":      self.updated_at.isoformat(),
        }


class ProgressLog(db.Model):
    __tablename__ = "progress_logs"

    id           = db.Column(db.Integer, primary_key=True)
    user_id      = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    programme_id = db.Column(db.Integer, db.ForeignKey("programmes.id"), nullable=True)

    # Metrics
    weight_kg              = db.Column(db.Float, nullable=True)
    body_fat_pct           = db.Column(db.Float, nullable=True)
    session_duration_hours = db.Column(db.Float, nullable=True)
    notes                  = db.Column(db.Text, nullable=True)

    logged_at = db.Column(db.DateTime, default=datetime.utcnow)

    user      = db.relationship("User", backref=db.backref("progress_logs", lazy=True))
    programme = db.relationship("Programme", backref=db.backref("progress_logs", lazy=True))

    def to_dict(self):
        return {
            "id":                     self.id,
            "user_id":                self.user_id,
            "programme_id":           self.programme_id,
            "weight_kg":              self.weight_kg,
            "body_fat_pct":           self.body_fat_pct,
            "session_duration_hours": self.session_duration_hours,
            "notes":                  self.notes,
            "date":                   self.logged_at.isoformat(),
        }