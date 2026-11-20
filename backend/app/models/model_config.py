import json
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Boolean, DateTime
from app.core.database import Base

class ModelConfig(Base):
    __tablename__ = "model_configs"

    id = Column(String(100), primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    identifier = Column(String(200), nullable=False)
    version = Column(String(50), default="1.0")
    provider = Column(String(50), default="Hosted-OpenWeight")  # Hosted-OpenWeight, HuggingFace, Ollama/Local, vLLM, Research-Simulation
    quantization = Column(String(30), default="none")            # none, 4-bit, 8-bit, float16, bfloat16
    
    endpoint_url = Column(String(300), nullable=True)
    api_key_env = Column(String(100), nullable=True)           # e.g. "HF_TOKEN"
    
    connection_status = Column(String(50), default="CONFIGURED_UNTESTED") # AVAILABLE, OFFLINE, CONFIGURED_UNTESTED, RESOURCE_CONSTRAINED
    status_message = Column(Text, nullable=True)
    
    context_window = Column(String(30), default="8192")
    parameters = Column(String(30), default="8B")
    supported_languages_json = Column(Text, default='["English", "Kannada Native (ಕನ್ನಡ)", "Romanized Kannada", "Kanglish"]')
    
    inference_config_json = Column(Text, default='{"temperature": 0.7, "max_tokens": 512, "top_p": 0.9, "timeout": 30}')
    
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    @property
    def supported_languages(self):
        try:
            return json.loads(self.supported_languages_json) if self.supported_languages_json else []
        except Exception:
            return []

    @supported_languages.setter
    def supported_languages(self, val):
        self.supported_languages_json = json.dumps(val)

    @property
    def inference_config(self):
        try:
            return json.loads(self.inference_config_json) if self.inference_config_json else {}
        except Exception:
            return {}

    @inference_config.setter
    def inference_config(self, val):
        self.inference_config_json = json.dumps(val)
