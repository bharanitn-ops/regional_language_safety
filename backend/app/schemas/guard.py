from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class GuardConfigModel(BaseModel):
    classifier_selection: str = Field(default="rule_based_hybrid", description="Classifier engine: rule_based_hybrid, semantic_multilingual, strict_indic")
    decision_threshold: float = Field(default=0.75, ge=0.0, le=1.0)
    language_confidence_threshold: float = Field(default=0.50, ge=0.0, le=1.0)
    safety_policy: str = Field(default="standard_research", description="Policy profile: standard_research, strict_defensive, permissive_research")
    language_detection_enabled: bool = True
    input_normalization_enabled: bool = True
    output_verification_enabled: bool = True
    review_mode: str = Field(default="conservative_fallback", description="conservative_fallback or human_review_flag")
    guard_enabled: bool = True
    config_version: str = "bsg-v1.0.0"

class GuardInspectRequest(BaseModel):
    prompt: str
    target_model: str = "mock-research-adapter"
    forced_modality: Optional[str] = None
    config: Optional[GuardConfigModel] = None

class PipelineStageTrace(BaseModel):
    stage_number: int
    stage_name: str
    status: str
    details: Dict[str, Any]

class GuardInspectResponse(BaseModel):
    # Core compatibility fields
    original_prompt: str
    detected_modality: str
    confidence: float
    detected_tokens: List[str]
    is_evasion_candidate: bool
    normalized_semantic_prompt: str
    pre_generation_intervention: bool
    sanitized_prompt: str
    direct_model_output_unprotected: str
    guarded_model_output_protected: str
    defense_verdict: str  # DEFENSE_ACTIVE, PASSED_DIRECT, CONTAINED_OUTPUT
    explanation: str

    # Phase 7 Pipeline fields
    policy_decision: str = "ALLOW"  # ALLOW, BLOCK, REVIEW
    policy_decision_rationale: Optional[str] = None
    input_classification: str = "CLEARLY_BENIGN"  # CLEARLY_BENIGN, SAFETY_SENSITIVE, REQUIRING_REFUSAL, UNCERTAIN
    output_verification_status: str = "VERIFIED_SAFE"  # VERIFIED_SAFE, CONTAINED_POST_GENERATION, SKIPPED
    output_violation_detected: bool = False
    baseline_latency_ms: float = 0.0
    guarded_latency_ms: float = 0.0
    latency_overhead_ms: float = 0.0
    pipeline_trace: List[Dict[str, Any]] = Field(default_factory=list)
    guard_config: Optional[Dict[str, Any]] = None

class BsgWorkflowStep(BaseModel):
    step_number: int
    step_id: str
    step_name: str
    status: str
    summary: str
    details: Dict[str, Any]

class BsgWorkflowDemoRequest(BaseModel):
    prompt: str
    target_model: str = "mock-research-adapter"
    forced_modality: Optional[str] = None
    config: Optional[GuardConfigModel] = None

class BsgWorkflowDemoResponse(BaseModel):
    prompt: str
    target_model: str
    is_illustrative_data: bool = True
    disclaimer: str = (
        "ILLUSTRATIVE DEMO RESULT - Results shown here illustrate the proposed Bilingual Safety Guard "
        "workflow and are simulated for demonstration purposes until full empirical benchmark runs are completed."
    )
    workflow_steps: List[BsgWorkflowStep]
    baseline_output: str
    baseline_safety_status: str
    baseline_latency_ms: float
    guarded_output: str
    guarded_safety_status: str
    guarded_latency_ms: float
    latency_overhead_ms: float
    defense_verdict: str
    policy_decision: str
    input_classification: str
    detected_modality: str
    explanation: str

