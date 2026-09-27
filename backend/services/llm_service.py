import os
import json
import httpx
from typing import Optional, Dict, Any, List
from config import settings

class LLMService:
    def __init__(self):
        self.use_ollama = settings.USE_OLLAMA
        self.ollama_base_url = settings.OLLAMA_BASE_URL.rstrip('/')
        self.ollama_model = settings.OLLAMA_MODEL
        self.groq_key = settings.GROQ_API_KEY
        self.openai_key = settings.OPENAI_API_KEY
        self.gemini_key = settings.GEMINI_API_KEY

    async def generate_response(self, system_prompt: str, user_prompt: str) -> Optional[str]:
        # 1. Try Local Ollama First
        if self.use_ollama:
            try:
                async with httpx.AsyncClient(timeout=120.0) as client:
                    # Use Ollama native /api/chat endpoint
                    resp = await client.post(
                        f"{self.ollama_base_url}/api/chat",
                        json={
                            "model": self.ollama_model,
                            "messages": [
                                {"role": "system", "content": system_prompt},
                                {"role": "user", "content": user_prompt}
                            ],
                            "stream": False,
                            "options": {
                                "temperature": 0.2
                            }
                        }
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        content = data.get("message", {}).get("content")
                        if content and len(content.strip()) > 20:
                            print(f"[LLMService] Response successfully generated via local Ollama ({self.ollama_model}).")
                            return content.strip()
            except Exception as e:
                print(f"[LLMService] Local Ollama call failed/unavailable ({e}). Trying fallback...")

        # 2. Try Groq if configured
        if self.groq_key:
            try:
                async with httpx.AsyncClient(timeout=15.0) as client:
                    resp = await client.post(
                        "https://api.groq.com/openai/v1/chat/completions",
                        headers={"Authorization": f"Bearer {self.groq_key}", "Content-Type": "application/json"},
                        json={
                            "model": "llama-3.3-70b-versatile",
                            "messages": [
                                {"role": "system", "content": system_prompt},
                                {"role": "user", "content": user_prompt}
                            ],
                            "temperature": 0.2
                        }
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        return data["choices"][0]["message"]["content"]
            except Exception as e:
                print(f"[LLMService] Groq call failed: {e}. Falling back to internal engine.")

        # 3. Try OpenAI if configured
        if self.openai_key:
            try:
                async with httpx.AsyncClient(timeout=15.0) as client:
                    resp = await client.post(
                        "https://api.openai.com/v1/chat/completions",
                        headers={"Authorization": f"Bearer {self.openai_key}", "Content-Type": "application/json"},
                        json={
                            "model": "gpt-4o-mini",
                            "messages": [
                                {"role": "system", "content": system_prompt},
                                {"role": "user", "content": user_prompt}
                            ],
                            "temperature": 0.2
                        }
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        return data["choices"][0]["message"]["content"]
            except Exception as e:
                print(f"[LLMService] OpenAI call failed: {e}. Falling back to internal engine.")

        # If LLM unavailable, return None to trigger internal causal synthesis
        return None

llm_service = LLMService()
