from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class EvaluatePromptRequest(BaseModel):
    prompt: str
    target_model: str = "mock-research-adapter"
    forced_modality: Optional[str] = None  # None for auto-detect, or ENGLISH, KANNADA_NATIVE, KANNADA_ROMANIZED, KANGLISH
    enable_bilingual_guard: bool = False
    temperature: float = 0.7

class EvaluationResultResponse(BaseModel):
    id: str
    target_model: str
    detected_modality: str
    script_stats: Dict[str, Any]
    prompt_text: str
    model_output: str
    guard_active: bool
    guard_intervened: bool
    guard_notes: Optional[str] = None
    safety_verdict: str  # SAFE_REFUSAL, UNSAFE_COMPLIANCE, OVER_REFUSAL, BENIGN_COMPLIANCE, AMBIGUOUS
    confidence_score: float
    rationale: str
    latency_ms: float
    demo_mode_notice: Optional[str] = None
    created_at: datetime

class EvaluationItemDetail(BaseModel):
    id: str
    experiment_id: Optional[str] = None
    test_case_id: Optional[str] = None
    target_model: str
    language_modality: str
    prompt_text: str
    model_output: str
    guard_active: bool
    guard_intervened: bool
    guard_notes: Optional[str] = None
    safety_verdict: str
    confidence_score: float
    rationale: Optional[str] = None
    latency_ms: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class RunBatchEvaluationRequest(BaseModel):
    target_model: str = "mock-research-adapter"
    enable_bilingual_guard: bool = False
    test_case_ids: Optional[List[str]] = None
    modalities_to_evaluate: List[str] = ["ENGLISH", "KANNADA_NATIVE", "KANNADA_ROMANIZED", "KANGLISH"]

class CreateExperimentRequest(BaseModel):
    name: str
    target_model: str = "mock-research-adapter"
    guard_enabled: bool = False
    dataset_version: str = "v1.0.4"
    model_version: str = "1.0"
    random_seed: int = 42
    test_case_ids: Optional[List[str]] = None
    generation_parameters: Optional[Dict[str, Any]] = None

class RunExperimentRequest(BaseModel):
    test_case_ids: Optional[List[str]] = None
    temperature: float = 0.7
    max_tokens: int = 512
    random_seed: int = 42
    background: bool = False

class ExperimentResponse(BaseModel):
    id: str
    name: str
    target_model: str
    guard_enabled: bool
    status: str
    total_test_cases: int
    progress_percent: float = 100.0
    completed_items: int = 0
    error_message: Optional[str] = None
    dataset_version: Optional[str] = "v1.0.4"
    model_version: Optional[str] = "1.0"
    evaluation_method_version: Optional[str] = "bhashashield-classifier-v1.2"
    prompt_template_version: Optional[str] = "v1.0-direct"
    generation_parameters: Optional[str] = None
    random_seed: Optional[int] = 42
    asr_english: float = 0.0
    asr_kannada_native: float = 0.0
    asr_kannada_romanized: float = 0.0
    asr_kanglish: float = 0.0
    over_refusal_english: float = 0.0
    over_refusal_kannada_native: float = 0.0
    over_refusal_kannada_romanized: float = 0.0
    over_refusal_kanglish: float = 0.0
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
