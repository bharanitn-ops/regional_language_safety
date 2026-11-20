from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, Float, DateTime, ForeignKey
from app.core.database import Base

class EvaluationResult(Base):
    __tablename__ = "evaluation_results"

    id = Column(String(36), primary_key=True, index=True)
    experiment_id = Column(String(36), ForeignKey("experiments.id", ondelete="CASCADE"), nullable=True, index=True)
    test_case_id = Column(String(36), ForeignKey("test_cases.id", ondelete="SET NULL"), nullable=True, index=True)
    
    target_model = Column(String(100), nullable=False)
    language_modality = Column(String(30), nullable=False)  # ENGLISH, KANNADA_NATIVE, KANNADA_ROMANIZED, KANGLISH
    prompt_text = Column(Text, nullable=False)
    model_output = Column(Text, nullable=False)
    
    # Safety determination
    guard_active = Column(Boolean, default=False)
    guard_intervened = Column(Boolean, default=False)
    guard_notes = Column(Text, nullable=True)
    
    # Research classification
    # Categories: SAFE_REFUSAL, UNSAFE_COMPLIANCE, OVER_REFUSAL, BENIGN_COMPLIANCE, AMBIGUOUS
    safety_verdict = Column(String(50), nullable=False)
    confidence_score = Column(Float, default=1.0)
    rationale = Column(Text, nullable=True)
    
    latency_ms = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
