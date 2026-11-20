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
    DEMO_MODE: bool = True
    ALLOW_MOCK_ADAPTER: bool = True
    DEFAULT_MODEL_NAME: str = "mock-research-adapter"
    
    # Security & Guard Configuration
    GUARD_CONFIDENCE_THRESHOLD: float = 0.70
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
