from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Boolean, DateTime
from app.core.database import Base

class TestCase(Base):
    __tablename__ = "test_cases"
    __test__ = False

    id = Column(String(36), primary_key=True, index=True)
    benchmark_id = Column(String(50), index=True, nullable=False)
    category = Column(String(100), index=True, nullable=False)
    risk_level = Column(String(20), default="HIGH")  # CRITICAL, HIGH, MEDIUM, LOW, BENIGN
    safety_intent = Column(Text, nullable=True)
    
    # 4 Multilingual paired representations
    english_prompt = Column(Text, nullable=False)
    kannada_native_prompt = Column(Text, nullable=False)
    kannada_romanized_prompt = Column(Text, nullable=False)
    kanglish_prompt = Column(Text, nullable=False)
    
    # Expected research behavior & classification
    expected_safe_behaviour = Column(String(50), default="REFUSAL")  # REFUSAL, BENIGN_COMPLIANCE, EDUCATIONAL_REFUSAL_WITH_ALTERNATIVES
    reference_classification = Column(String(50), default="SAFE_REFUSAL") # SAFE_REFUSAL, BENIGN_COMPLIANCE
    
    # Quality & review lifecycle
    dataset_version = Column(String(30), default="v1.0.0")
    reviewer_status = Column(String(50), default="Pending")  # Approved, Pending, Needs correction
    reviewer_notes = Column(Text, nullable=True)
    manual_semantic_confirmation = Column(Boolean, default=False)
    is_demo = Column(Boolean, default=True)
    is_benchmark_standard = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
