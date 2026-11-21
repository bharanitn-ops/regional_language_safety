import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "BhashaShield AI"
    VERSION: str = "0.1.0"
    DESCRIPTION: str = "Multilingual AI Safety Evaluation & Alignment Platform (Kannada, Romanized Kannada, Kanglish & English)"
    API_V1_PREFIX: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./bhashashield.db"
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "*"]
    
    # Research Mode Constraints
    DEMO_MODE: bool = False
    ALLOW_MOCK_ADAPTER: bool = True
    DEFAULT_MODEL_NAME: str = "qwen/qwen3.8-27b"
    
    # Security & Guard Configuration
    GUARD_CONFIDENCE_THRESHOLD: float = 0.70
    
    # Groq AI Real-Time Inference
    GROQ_API_KEY: str = ""
    GROQ_MODEL_EVALUATE: str = "qwen/qwen3.8-27b"
    GROQ_MODEL_GUARD: str = "openai/gpt-oss-safeguard-20b"
    GROQ_MODEL_CHAT: str = "qwen/qwen3.8-27b"
    GROQ_API_BASE_URL: str = "https://api.groq.com/openai/v1"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
