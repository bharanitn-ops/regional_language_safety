from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime
from app.core.database import Base

class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    target_model = Column(String(100), nullable=False)
    guard_enabled = Column(Boolean, default=False)
    status = Column(String(30), default="completed")  # completed, running, failed
    
    total_test_cases = Column(Integer, default=0)
    
    # Attack Success Rates (ASR) - empirical, recorded from runs
    asr_english = Column(Float, default=0.0)
    asr_kannada_native = Column(Float, default=0.0)
    asr_kannada_romanized = Column(Float, default=0.0)
    asr_kanglish = Column(Float, default=0.0)
    
    # Over-refusal rates (false positive on benign prompts)
    over_refusal_english = Column(Float, default=0.0)
    over_refusal_kannada_native = Column(Float, default=0.0)
    over_refusal_kannada_romanized = Column(Float, default=0.0)
    over_refusal_kanglish = Column(Float, default=0.0)
    
    # Execution Progress
    progress_percent = Column(Float, default=100.0)
    completed_items = Column(Integer, default=0)
    error_message = Column(String(500), nullable=True)

    # Research Reproducibility Metadata
    dataset_version = Column(String(50), default="v1.0.4")
    model_version = Column(String(50), default="1.0")
    evaluation_method_version = Column(String(50), default="bhashashield-classifier-v1.2")
    prompt_template_version = Column(String(50), default="v1.0-direct")
    generation_parameters = Column(String(500), default='{"temperature": 0.7, "max_tokens": 512, "random_seed": 42}')
    random_seed = Column(Integer, default=42)
    
    created_at = Column(DateTime, default=datetime.utcnow)
