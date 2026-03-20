# app/client/huggingface_client.py
import os
import time
import base64
import requests
from dotenv import load_dotenv

load_dotenv()


class HuggingFaceClient:

    # ─────────────────────────────────────────
    # 1. INITIALISATION  (@PostConstruct + @Value)
    # ─────────────────────────────────────────
    TEXT_PROVIDERS = [
        ("https://router.huggingface.co/sambanova/v1/chat/completions", "Meta-Llama-3.1-8B-Instruct"),
        ("https://router.huggingface.co/cerebras/v1/chat/completions",  "llama3.1-8b"),
        ("https://router.huggingface.co/sambanova/v1/chat/completions", "Meta-Llama-3.2-3B-Instruct"),
    ]

    VISION_URL   = "https://router.huggingface.co/sambanova/v1/chat/completions"
    VISION_MODEL = "Llama-4-Maverick-17B-128E-Instruct"

    def __init__(self):
        self.token = os.getenv("HF_API_KEY")
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }

        # équivalent du @PostConstruct
        if not self.token:
            print("⚠️  Token HuggingFace NON CHARGÉ !")
        else:
            print(f"✅ Token HuggingFace chargé: {self.token[:8]}...")


    # ─────────────────────────────────────────
    # 2. MÉTHODE PRIVÉE : appel HTTP générique
    #    équivalent de callChatCompletions()
    # ─────────────────────────────────────────
    def _call_chat_completions(self, url: str, model: str,
                                prompt: str, max_tokens: int = 600) -> str:
        body = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": max_tokens
        }

        response = requests.post(url, headers=self.headers, json=body)

        if not response.text or response.text.strip() == "":
            raise Exception("Réponse vide du provider")

        data = response.json()

        if "error" in data:
            raise Exception(f"API error: {data['error']}")

        return data["choices"][0]["message"]["content"]


    # ─────────────────────────────────────────
    # 3. MODÈLE TEXTE avec fallback multi-provider
    #    équivalent de callTextModel()
    # ─────────────────────────────────────────
    def call_text_model(self, prompt: str) -> str:
        last_exception = None

        for url, model in self.TEXT_PROVIDERS:
            for attempt in range(1, 3):   # 2 tentatives par provider
                try:
                    print(f"[HF TEXT] Essai {attempt} — {model}")
                    result = self._call_chat_completions(url, model, prompt)
                    print(f"[HF TEXT SUCCESS] {model}")
                    return result

                except Exception as e:
                    print(f"[HF TEXT FAIL] {model} | tentative {attempt} | {e}")
                    last_exception = e

                    if attempt == 1:
                        time.sleep(1)   # attendre 1s avant 2ème tentative

        raise Exception(f"Tous les providers ont échoué. Dernière erreur: {last_exception}")


    # ─────────────────────────────────────────
    # 4. MODÈLE VISION (image + texte)
    #    équivalent de callVisionModel()
    # ─────────────────────────────────────────
    def call_vision_model(self, image_bytes: bytes) -> str:
        base64_image = base64.b64encode(image_bytes).decode("utf-8")

        body = {
            "model": self.VISION_MODEL,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": (
                                "You are a nutrition expert. Describe this meal in detail: "
                                "identify all ingredients, estimate portion sizes, "
                                "and calculate approximate macronutrients "
                                "(calories, proteins, carbs, fats)."
                            )
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            "max_tokens": 400
        }

        for attempt in range(1, 4):   # 3 tentatives
            try:
                print(f"[HF VISION] Tentative {attempt} — {self.VISION_MODEL}")
                response = requests.post(
                    self.VISION_URL,
                    headers=self.headers,
                    json=body
                )
                data = response.json()
                result = data["choices"][0]["message"]["content"]
                print("[HF VISION SUCCESS]")
                return result

            except Exception as e:
                print(f"[HF VISION FAIL] tentative {attempt} | {e}")
                if attempt < 3:
                    time.sleep(1.5)   # attendre 1.5s avant prochaine tentative

        print("[HF VISION FALLBACK] Utilisation description générique")
        return "a balanced meal with proteins, carbohydrates and vegetables"


    # ─────────────────────────────────────────
    # 5. ANALYSE DE SENTIMENT
    #    équivalent de callSentimentModel()
    # ─────────────────────────────────────────
    def call_sentiment_model(self, text: str) -> str:
        prompt = (
            "Analyze the sentiment of this text. "
            "Respond with JSON only: {\"sentiment\": \"POSITIVE\", \"score\": 0.95}. "
            f"Text: {text}"
        )

        try:
            return self.call_text_model(prompt).strip()
        except Exception as e:
            return f'{{"error": "Sentiment analysis failed: {e}"}}'