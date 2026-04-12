import requests
import os

class NutritionService:
    def __init__(self):
        # On récupère les clés depuis le .env
        self.app_id = os.getenv("EDAMAM_APP_ID")
        self.app_key = os.getenv("EDAMAM_APP_KEY")
        self.base_url = "https://api.edamam.com/api/food-database/v2/parser"
        print(f"DEBUG - ID: {self.app_id}, KEY: {self.app_key}")

    def fetch_nutrition(self, food_name):
        # 1. Vérification de la présence des clés
        if not self.app_id or not self.app_key:
            return {"error": "Cles API manquantes dans le .env"}

        # 2. Préparation des paramètres
        params = {
            "app_id": self.app_id,
            "app_key": self.app_key,
            "ingr": food_name
        }
        
        # Debug visuel dans votre terminal pour vérifier l'URL générée
        print(f"DEBUG - URL appelee: {self.base_url}?app_id={self.app_id}&ingr={food_name}")
        
        # 3. Requête à l'API
        try:
            response = requests.get(self.base_url, params=params)
            # Renvoie le JSON si succès (200), sinon renvoie l'erreur détaillée
            if response.status_code == 200:
                return response.json()
            else:
                return {
                    "error": f"API Error {response.status_code}",
                    "details": response.text
                }
        except Exception as e:
            return {"error": "Connection Error", "details": str(e)}