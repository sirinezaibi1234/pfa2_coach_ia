import requests
import os

class NutritionService:
    def __init__(self):
        self.app_id = os.getenv("EDAMAM_APP_ID")
        self.app_key = os.getenv("EDAMAM_APP_KEY")
        self.base_url = "https://api.edamam.com/api/food-database/v2/parser"

        # Fallback nutrients per 100g for common foods (approximate)
        self.fallback_foods = {
            "egg": {
                "label": "Egg",
                "nutrients": {"ENERC_KCAL": 143, "PROCNT": 13, "CHOCDF": 1.1, "FAT": 9.5, "FIBTG": 0},
                "measures": [
                    {"label": "Gram", "weight": 100},
                    {"label": "Serving_Size", "weight": 100},
                    {"label": "Whole", "weight": 50},
                ],
            },
            "apple": {
                "label": "Apple",
                "nutrients": {"ENERC_KCAL": 52, "PROCNT": 0.3, "CHOCDF": 14, "FAT": 0.2, "FIBTG": 2.4},
                "measures": [
                    {"label": "Gram", "weight": 100},
                    {"label": "Serving_Size", "weight": 100},
                    {"label": "Whole", "weight": 182},
                ],
            },
            "banana": {
                "label": "Banana",
                "nutrients": {"ENERC_KCAL": 89, "PROCNT": 1.1, "CHOCDF": 23, "FAT": 0.3, "FIBTG": 2.6},
                "measures": [
                    {"label": "Gram", "weight": 100},
                    {"label": "Serving_Size", "weight": 100},
                    {"label": "Whole", "weight": 118},
                ],
            },
            "chicken": {
                "label": "Chicken breast",
                "nutrients": {"ENERC_KCAL": 165, "PROCNT": 31, "CHOCDF": 0, "FAT": 3.6, "FIBTG": 0},
                "measures": [
                    {"label": "Gram", "weight": 100},
                    {"label": "Serving_Size", "weight": 100},
                ],
            },
            "rice": {
                "label": "Cooked rice",
                "nutrients": {"ENERC_KCAL": 130, "PROCNT": 2.7, "CHOCDF": 28, "FAT": 0.3, "FIBTG": 0.4},
                "measures": [
                    {"label": "Gram", "weight": 100},
                    {"label": "Serving_Size", "weight": 100},
                ],
            },
        }

    def _fallback_lookup(self, food_name):
        if not food_name:
            return None
        needle = str(food_name).lower()
        for key, data in self.fallback_foods.items():
            if key in needle:
                return data
        return None

    def fetch_nutrition(self, food_name):
        if not self.app_id or not self.app_key:
            fallback = self._fallback_lookup(food_name)
            if fallback:
                return fallback
            return {"error": "Cles API manquantes dans le .env"}

        params = {
            "app_id": self.app_id,
            "app_key": self.app_key,
            "ingr": food_name
        }
        
        try:
            response = requests.get(self.base_url, params=params)
            
            if response.status_code == 200:
                data = response.json()
                
                # C'EST ICI QUE ÇA CHANGE :
                # On ne renvoie pas tout le JSON brut, on extrait les 3 piliers
                if data.get('hints'):
                    first_hint = data['hints'][0]
                    return {
                        "label": first_hint['food'].get('label'),
                        "nutrients": first_hint['food'].get('nutrients'), # Micros + Macros
                        "measures": first_hint.get('measures')           # Unités de mesure
                    }
                else:
                    return {"error": "Aliment non trouvé dans la base Edamam"}
            else:
                return {"error": f"API Error {response.status_code}", "details": response.text}
                
        except Exception as e:
            return {"error": "Connection Error", "details": str(e)}