# app/routes/ai.py
from flask import Blueprint, jsonify, request
from app.client.huggingface_client import HuggingFaceClient
import json

ai_bp = Blueprint("ai", __name__)
hf = HuggingFaceClient()


def _extract_user_message(prompt: str) -> str:
    for line in (prompt or "").splitlines():
        if line.strip().lower().startswith("user message:"):
            return line.split(":", 1)[1].strip()
    return ""


def _local_text_fallback(prompt: str) -> str:
    user_message = _extract_user_message(prompt) or ""
    text = (user_message or prompt or "").lower()

    if any(key in text for key in ("calories", "calorie", "kcal", "meal", "repas", "nutrition", "macros", "protein")):
        return (
            "Mode hors ligne actif. Je ne peux pas contacter le modele externe pour l instant.\n\n"
            "Plan nutrition rapide:\n"
            "1) Assiette type: 1/2 legumes, 1/4 proteines, 1/4 glucides complets.\n"
            "2) Vise 1.6 a 2.0 g de proteines/kg/jour.\n"
            "3) Limite les calories liquides et ajoute 500 ml d eau avant les repas.\n"
            "4) Surveille les portions d huile/sauces (fort impact calorique).\n"
            f"Question recue: {user_message or 'non precisee'}. Donne moi ton repas exact pour un calcul plus fin."
        )

    if any(key in text for key in ("workout", "training", "entrainement", "exercise", "seance", "musculation", "cardio")):
        return (
            "Mode hors ligne actif. Coach local: \n"
            "- Echauffement 8-10 min\n"
            "- 4 exercices full-body (3 series chacun)\n"
            "- 15-20 min cardio modere\n"
            "- Retour au calme 5 min\n"
            "Progression: ajoute 1-2 repetitions par semaine si execution propre.\n"
            f"Details demandes: {user_message or 'non precise'}."
        )

    if any(key in text for key in ("eau", "hydration", "water", "boire")):
        return (
            "Mode hors ligne actif. Hydratation express:\n"
            "- 30-35 ml d eau/kg/jour\n"
            "- 1 verre au lever, 1 avant chaque repas\n"
            "- Ajuste +250-500 ml si entrainement\n"
            f"Contexte: {user_message or 'non precise'}."
        )

    if any(key in text for key in ("objectif", "perte", "prise", "poids", "seche", "masse")):
        return (
            "Mode hors ligne actif. Objectif: on peut clarifier.\n"
            "Indique ton poids actuel, ta taille, et ton objectif (perte, maintien, prise).\n"
            "Ensuite je propose un plan calories + entrainement adapte."
        )

    return (
        "Mode hors ligne actif. Je ne peux pas joindre le service IA externe actuellement, "
        "mais je reste disponible en mode coach local. Dis moi ton objectif, ton repas, "
        "ou ta seance, et je te proposerai un plan concret."
    )


def _local_sentiment_fallback(_: str) -> str:
    return json.dumps({"sentiment": "NEUTRAL", "score": 0.5})


def _local_vision_fallback() -> str:
    return (
        "Mode hors ligne actif. Estimation generique repas: 500-750 kcal selon portion.\n"
        "Recommandations: ajouter legumes fibres, proteine maigre, limiter sauces sucrees/huilees, "
        "et ajuster portion glucides selon objectif."
    )

@ai_bp.route("/text", methods=["POST"])
def text():
    data = request.get_json() or {}
    prompt = (data.get("prompt") or "").strip()
    if not prompt:
        return jsonify({"error": "prompt is required"}), 400

    try:
        result = hf.call_text_model(prompt)
        return jsonify({"response": result, "provider": "huggingface", "fallback": False}), 200
    except Exception as e:
        fallback = _local_text_fallback(prompt)
        return jsonify({
            "response": fallback,
            "provider": "local-fallback",
            "fallback": True,
            "warning": f"text generation failed: {e}",
        }), 200

@ai_bp.route("/vision", methods=["POST"])
def vision():
    image = request.files.get("image")
    if not image:
        return jsonify({"error": "image file is required"}), 400

    prompt = request.form.get("prompt")

    try:
        result = hf.call_vision_model(image.read(), prompt=prompt)
        return jsonify({"response": result, "provider": "huggingface", "fallback": False}), 200
    except Exception as e:
        return jsonify({
            "response": _local_vision_fallback(),
            "provider": "local-fallback",
            "fallback": True,
            "warning": f"vision analysis failed: {e}",
        }), 200

@ai_bp.route("/sentiment", methods=["POST"])
def sentiment():
    data = request.get_json() or {}
    text = (data.get("text") or "").strip()
    if not text:
        return jsonify({"error": "text is required"}), 400

    try:
        result = hf.call_sentiment_model(text)
        return jsonify({"response": result, "provider": "huggingface", "fallback": False}), 200
    except Exception as e:
        return jsonify({
            "response": _local_sentiment_fallback(text),
            "provider": "local-fallback",
            "fallback": True,
            "warning": f"sentiment analysis failed: {e}",
        }), 200