# app/services/water_service.py
from datetime import date as date_type
from app import db
from app.models.water_log import WaterLog


class WaterService:

    @staticmethod
    def get_or_create(user_id: int, date_str: str) -> WaterLog:
        """Retourne l'entrée existante ou en crée une vide."""
        d = date_type.fromisoformat(date_str)
        log = WaterLog.query.filter_by(user_id=user_id, date=d).first()
        if not log:
            log = WaterLog(user_id=user_id, date=d, glasses=0)
            db.session.add(log)
            db.session.commit()
        return log

    @staticmethod
    def get(user_id: int, date_str: str) -> WaterLog | None:
        d = date_type.fromisoformat(date_str)
        return WaterLog.query.filter_by(user_id=user_id, date=d).first()

    @staticmethod
    def upsert(user_id: int, date_str: str, glasses: int) -> WaterLog:
        """Crée ou met à jour le nombre de verres pour un jour donné."""
        if not (0 <= glasses <= 20):
            raise ValueError("glasses must be between 0 and 20")

        d = date_type.fromisoformat(date_str)
        log = WaterLog.query.filter_by(user_id=user_id, date=d).first()
        if log:
            log.glasses = glasses
        else:
            log = WaterLog(user_id=user_id, date=d, glasses=glasses)
            db.session.add(log)
        db.session.commit()
        return log