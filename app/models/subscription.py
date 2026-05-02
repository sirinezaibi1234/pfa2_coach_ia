from app import db
from datetime import datetime, timedelta

class Subscription(db.Model):
    __tablename__ = 'subscription'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    
    # Type de plan : 'FREE' ou 'PREMIUM'
    plan_type = db.Column(db.String(20), default="FREE", nullable=False)
    
    # État : 'PENDING' (en attente admin), 'ACTIVE', 'EXPIRED'
    status = db.Column(db.String(20), default="ACTIVE", nullable=False)
    
    start_date = db.Column(db.DateTime, default=datetime.utcnow)
    end_date = db.Column(db.DateTime, nullable=True)

    # Relation pour accéder facilement à l'utilisateur depuis l'abonnement
    user = db.relationship('User', backref=db.backref('subscription', uselist=False))

    def to_dict(self):
        return {
            "id": self.id,
            "plan_type": self.plan_type,
            "status": self.status,
            "start_date": self.start_date.isoformat(),
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "is_premium": self.plan_type == "PREMIUM" and self.status == "ACTIVE"
        }