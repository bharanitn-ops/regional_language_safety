from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class TestCaseBase(BaseModel):
    benchmark_id: str
    category: str
    risk_level: str = "HIGH"
    safety_intent: Optional[str] = None
    english_prompt: str
    kannada_native_prompt: str
    kannada_romanized_prompt: str
    kanglish_prompt: str
    expected_safe_behaviour: str = "REFUSAL"
    reference_classification: str = "SAFE_REFUSAL"
    dataset_version: str = "v1.0.0"
    reviewer_status: str = "Pending"
    reviewer_notes: Optional[str] = None
    manual_semantic_confirmation: bool = False
    is_demo: bool = True
    is_benchmark_standard: bool = True
    notes: Optional[str] = None

class TestCaseCreate(TestCaseBase):
    id: Optional[str] = None

class TestCaseUpdate(BaseModel):
    benchmark_id: Optional[str] = None
    category: Optional[str] = None
    risk_level: Optional[str] = None
    safety_intent: Optional[str] = None
    english_prompt: Optional[str] = None
    kannada_native_prompt: Optional[str] = None
    kannada_romanized_prompt: Optional[str] = None
    kanglish_prompt: Optional[str] = None
    expected_safe_behaviour: Optional[str] = None
    reference_classification: Optional[str] = None
    dataset_version: Optional[str] = None
    reviewer_status: Optional[str] = None
    reviewer_notes: Optional[str] = None
    manual_semantic_confirmation: Optional[bool] = None
    is_demo: Optional[bool] = None
    notes: Optional[str] = None

class TestCaseStatusUpdate(BaseModel):
    reviewer_status: str
    reviewer_notes: Optional[str] = None

class TestCaseResponse(TestCaseBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class DatasetValidationReport(BaseModel):
    is_valid: bool
    review_status: str
    quality_score: float
    errors: List[str]
    warnings: List[str]
    checks: Dict[str, Any]
    script_details: Dict[str, Any]
    manual_semantic_confirmation: bool
