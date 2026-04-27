# app/models/water_log.py
from app import db
from datetime import datetime, date


class WaterLog(db.Model):
    __tablename__ = "water_logs"

    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    date       = db.Column(db.Date, nullable=False, default=date.today)
    glasses    = db.Column(db.Integer, nullable=False, default=0)  # nombre de verres (0-8)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Contrainte : un seul enregistrement par user par jour
    __table_args__ = (
        db.UniqueConstraint("user_id", "date", name="uq_water_user_date"),
    )

    user = db.relationship("User", backref=db.backref("water_logs", lazy=True))

    def to_dict(self):
        return {
            "id":         self.id,
            "user_id":    self.user_id,
            "date":       self.date.isoformat(),
            "glasses":    self.glasses,
            "updated_at": self.updated_at.isoformat(),
        }

    def __repr__(self):
        return f"<WaterLog user_id={self.user_id} date={self.date} glasses={self.glasses}>"