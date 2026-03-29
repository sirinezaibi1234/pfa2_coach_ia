# app/routes/ai.py
from flask import Blueprint, jsonify, request
from app.client.huggingface_client import HuggingFaceClient

ai_bp = Blueprint("ai", __name__)
hf = HuggingFaceClient()

@ai_bp.route("/text", methods=["POST"])
def text():
    data = request.get_json()
    result = hf.call_text_model(data["prompt"])
    return jsonify({"response": result}), 200

@ai_bp.route("/vision", methods=["POST"])
def vision():
    image = request.files["image"]
    result = hf.call_vision_model(image.read())
    return jsonify({"response": result}), 200

@ai_bp.route("/sentiment", methods=["POST"])
def sentiment():
    data = request.get_json()
    result = hf.call_sentiment_model(data["text"])
    return jsonify({"response": result}), 200