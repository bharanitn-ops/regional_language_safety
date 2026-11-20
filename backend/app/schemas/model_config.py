from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class ModelConfigBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    identifier: str = Field(..., min_length=2, max_length=200)
    version: str = Field(default="1.0", max_length=50)
    provider: str = Field(default="Hosted-OpenWeight", max_length=50)
    quantization: str = Field(default="none", max_length=30)
    endpoint_url: Optional[str] = None
    api_key_env: Optional[str] = None
    context_window: str = Field(default="8192", max_length=30)
    parameters: str = Field(default="8B", max_length=30)
    supported_languages: List[str] = Field(
        default_factory=lambda: [
            "English",
            "Kannada Native (ಕನ್ನಡ)",
            "Romanized Kannada",
            "Kanglish (Code-Mixed)"
        ]
    )
    inference_config: Dict[str, Any] = Field(
        default_factory=lambda: {
            "temperature": 0.7,
            "max_tokens": 512,
            "top_p": 0.9,
            "timeout": 30
        }
    )
    is_default: bool = False

class ModelConfigCreate(ModelConfigBase):
    id: Optional[str] = None

class ModelConfigUpdate(BaseModel):
    name: Optional[str] = None
    identifier: Optional[str] = None
    version: Optional[str] = None
    provider: Optional[str] = None
    quantization: Optional[str] = None
    endpoint_url: Optional[str] = None
    api_key_env: Optional[str] = None
    connection_status: Optional[str] = None
    status_message: Optional[str] = None
    context_window: Optional[str] = None
    parameters: Optional[str] = None
    supported_languages: Optional[List[str]] = None
    inference_config: Optional[Dict[str, Any]] = None
    is_default: Optional[bool] = None

class ModelConfigResponse(ModelConfigBase):
    id: str
    connection_status: str = "CONFIGURED_UNTESTED"
    status_message: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class ModelTestRequest(BaseModel):
    prompt: str = Field(default="Verify model connectivity and Kannada multilingual safety response.", max_length=1000)
    modality: str = Field(default="ENGLISH")
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)

class ModelTestResponse(BaseModel):
    model_id: str
    available: bool
    status: str
    latency_ms: float
    generated_text: Optional[str] = None
    error: Optional[str] = None
    troubleshooting_info: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
