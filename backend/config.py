import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "CompanyBrain"
    APP_VERSION: str = "1.0.1"
    DEBUG: bool = True
    
    # Ollama Local LLM Configuration (Default & Prioritized)
    USE_OLLAMA: bool = os.getenv("USE_OLLAMA", "true").lower() in ("true", "1", "t")
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama3.2:3b")
    
    # Hindsight Configuration (Vectorize / Hindsight API)
    HINDSIGHT_API_KEY: str = os.getenv("HINDSIGHT_API_KEY", "")
    HINDSIGHT_BASE_URL: str = os.getenv("HINDSIGHT_BASE_URL", "https://api.vectorize.io/v1/hindsight")
    HINDSIGHT_PROJECT_ID: str = os.getenv("HINDSIGHT_PROJECT_ID", "companybrain_novastack")
    
    # Cloud LLM Provider Fallbacks (Groq, OpenAI, Gemini)
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Storage and Data Paths
    DATA_PATH: str = os.getenv("DATA_PATH", os.path.join(os.path.dirname(__file__), "data", "novastack_dataset.json"))
    PERSISTENT_MEMORY_PATH: str = os.getenv("PERSISTENT_MEMORY_PATH", os.path.join(os.path.dirname(__file__), "data", "memory_store.json"))

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
