from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Import your existing modules
from api.gemini import GeminiAPI
from utils.prompts import get_system_prompt

# Load environment variables
load_dotenv()

# Create Flask app
app = Flask(__name__)

# ── CORS Configuration ────────────────────────────────
# Read allowed origins from env var; fall back to localhost for local dev.
# In production set: ALLOWED_ORIGINS=https://your-frontend.onrender.com
_raw_origins = os.environ.get("ALLOWED_ORIGINS", "http://127.0.0.1:5000,http://localhost:3000")
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]

CORS(app, origins=ALLOWED_ORIGINS, supports_credentials=True)

# Initialize Gemini API (wraps Groq under the hood)
gemini_api = GeminiAPI()


# ── Health Check (required by Render) ─────────────────
@app.route('/health')
def health():
    return jsonify({"status": "ok"})


# ── Root ──────────────────────────────────────────────
@app.route('/')
def home():
    return jsonify({"message": "ADHD AI Assistant Backend is running!"})


# ── Main chat endpoint ────────────────────────────────
@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()

        user_message = data.get('message', '')
        prompt_mode = data.get('mode', 'minimal')
        test_mode = data.get('test_mode', False)
        conversation_history = data.get('conversation_history', [])

        if not user_message.strip():
            return jsonify({"error": "Message cannot be empty"}), 400

        if test_mode:
            mock_responses = {
                "minimal": "This is a mock minimal response.",
                "direct": "Mock direct response - straight to the point.",
                "supportive": "Mock supportive response - you're doing great!",
                "structured": "Mock structured response:\n1. Step one\n2. Step two"
            }
            return jsonify({
                "response": mock_responses.get(prompt_mode, "Mock response"),
                "mode": prompt_mode,
                "model": "mock-model",
                "usage": {"input_tokens": 0, "output_tokens": 0},
                "success": True
            })

        system_prompt = get_system_prompt(prompt_mode)

        response = gemini_api.send_message(
            message=user_message,
            system_prompt=system_prompt,
            conversation_history=conversation_history
        )

        if "error" in response and response["error"] is True:
            return jsonify({
                "error": response["content"],
                "success": False
            }), 500

        return jsonify({
            "response": response["content"],
            "mode": prompt_mode,
            "model": response.get("model", "unknown"),
            "usage": response.get("usage", {}),
            "success": True
        })

    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        return jsonify({
            "error": "Something went wrong processing your message",
            "success": False
        }), 500


# ── Available modes ───────────────────────────────────
@app.route('/modes', methods=['GET'])
def get_modes():
    return jsonify({
        "modes": ["minimal", "direct", "supportive", "structured"],
        "default": "minimal",
        "success": True
    })


# ── API status ────────────────────────────────────────
@app.route('/status', methods=['GET'])
def status():
    try:
        api = GeminiAPI()
        return jsonify({
            "api_configured": True,
            "model": api.model_name,
            "success": True
        })
    except ValueError as e:
        return jsonify({
            "api_configured": False,
            "error": str(e),
            "success": False
        }), 500


# ── Entry point ───────────────────────────────────────
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))

    try:
        test_api = GeminiAPI()
        print(f"Groq API successfully initialized (model: {test_api.model_name})")
    except ValueError as e:
        print(f"Warning: {e}")
        print("Make sure to set your GROQ_API_KEY in the .env file")

    print(f"Starting ADHD AI Assistant Backend on port {port}...")
    app.run(debug=False, host='0.0.0.0', port=port)