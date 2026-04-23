import requests
import os

class NutritionService:
    def __init__(self):
        self.app_id = os.getenv("EDAMAM_APP_ID")
        self.app_key = os.getenv("EDAMAM_APP_KEY")
        self.base_url = "https://api.edamam.com/api/food-database/v2/parser"

    def fetch_nutrition(self, food_name):
        if not self.app_id or not self.app_key:
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