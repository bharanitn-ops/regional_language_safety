from typing import Dict, Any, List
from pydantic import BaseModel

class HealthResponse(BaseModel):
    status: str
    version: str
    project_name: str
    database: str
    active_adapter: str
    available_adapters: List[str]
    demo_mode: bool
    modalities_supported: List[str]
    timestamp: str

class SystemInfoResponse(BaseModel):
    project_name: str
    version: str
    description: str
    research_scope: str
    problem_statement: str
    modalities: List[Dict[str, str]]
    models_configured: List[Dict[str, Any]]
