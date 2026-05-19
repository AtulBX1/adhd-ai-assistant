import os
import logging
from groq import Groq

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GeminiAPI:  # Keep same class name so app.py doesn't need changes
    def __init__(self):
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY is not set in your .env file.")
        self.client = Groq(api_key=api_key)
        self.model_name = "llama-3.3-70b-versatile"  # Free, fast, powerful
        logger.info(f"Initialized Groq API with model: {self.model_name}")

    def send_message(self, message: str, system_prompt: str, conversation_history=None) -> dict:
        try:
            messages = [{"role": "system", "content": system_prompt}]
            if conversation_history:
                # conversation_history is a list of {role, content} dicts
                # Only include user/assistant messages, limit to last 20 for token efficiency
                for msg in conversation_history[-20:]:
                    if msg.get('role') in ('user', 'assistant'):
                        messages.append({"role": msg['role'], "content": msg['content']})
            messages.append({"role": "user", "content": message})

            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                max_tokens=1000,
            )

            return {
                "content": response.choices[0].message.content,
                "model": self.model_name,
                "usage": {},
                "error": False
            }
        except Exception as e:
            logger.error(f"Groq API error: {str(e)}")
            return {
                "content": f"An unexpected error occurred: {str(e)}",
                "model": self.model_name,
                "usage": {},
                "error": True
            }