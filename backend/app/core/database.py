import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

from app.core.config import settings

logger = logging.getLogger("bhashashield.database")

# Ensure SQLite path works cleanly
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

Base = declarative_base()

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_db() -> None:
    """Create all database tables and seed canonical benchmark test cases, datasets & models if empty."""
    from app.models.test_case import TestCase
    from app.models.experiment import Experiment
    from app.models.evaluation import EvaluationResult
    from app.models.dataset import Dataset
    from app.models.model_config import ModelConfig
    from app.services.model_adapter.factory import DEFAULT_MODELS_METADATA
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
        # SQLite schema migration for experiments table if missing Phase 5 columns
        def migrate_sqlite_columns(sync_conn):
            from sqlalchemy import text
            res = sync_conn.execute(text("PRAGMA table_info(experiments)"))
            cols = [row[1] for row in res.fetchall()]
            if cols:  # If table exists
                expected_cols = {
                    "progress_percent": "FLOAT DEFAULT 100.0",
                    "completed_items": "INTEGER DEFAULT 0",
                    "error_message": "VARCHAR(500)",
                    "dataset_version": "VARCHAR(50) DEFAULT 'v1.0.4'",
                    "model_version": "VARCHAR(50) DEFAULT '1.0'",
                    "evaluation_method_version": "VARCHAR(50) DEFAULT 'bhashashield-classifier-v1.2'",
                    "prompt_template_version": "VARCHAR(50) DEFAULT 'v1.0-direct'",
                    "generation_parameters": "VARCHAR(500)",
                    "random_seed": "INTEGER DEFAULT 42"
                }
                for col_name, col_type in expected_cols.items():
                    if col_name not in cols:
                        sync_conn.execute(text(f"ALTER TABLE experiments ADD COLUMN {col_name} {col_type}"))
        await conn.run_sync(migrate_sqlite_columns)
    
    # Seed initial canonical benchmark test cases, datasets, and model configs
    async with AsyncSessionLocal() as session:
        from sqlalchemy import select, func
        
        # 1. Seed Datasets if empty
        ds_count_res = await session.execute(select(func.count()).select_from(Dataset))
        if (ds_count_res.scalar() or 0) == 0:
            logger.info("Initializing benchmark datasets in database...")
            ds1 = Dataset(
                id="canonical-r2-v1",
                name="Canonical R2 Multilingual Safety Bank",
                version="v1.0.4",
                description="Standardized 4-way paired benchmark probes across Cyber Exploitation, Phishing, Shellcode Evasion, and Benign Cultural Controls.",
                validation_status="validated",
                review_status="Approved",
                author="AI Research R2 Core Team"
            )
            ds1.languages = ["English", "Kannada Native (ಕನ್ನಡ)", "Romanized Kannada", "Kanglish (Code-Mixed)"]
            ds1.categories = ["Cybersecurity safety", "Fraud and scam prevention", "Harmful-content boundary testing", "Benign educational questions"]
            session.add(ds1)

            ds2 = Dataset(
                id="dialect-kanglish-v1",
                name="Extended Regional Dialect & Code-Mixing Bank",
                version="v0.8.2",
                description="Colloquial conversational Kanglish expressions, phonetically transliterated queries, and North Karnataka dialectal probes.",
                validation_status="draft",
                review_status="Pending",
                author="Linguistic Evaluation Team"
            )
            ds2.languages = ["English", "Kannada Native (ಕನ್ನಡ)", "Romanized Kannada", "Kanglish (Code-Mixed)"]
            ds2.categories = ["Cybersecurity safety", "Fraud and scam prevention", "Harmless everyday questions"]
            session.add(ds2)
            await session.commit()
            logger.info("Seeded canonical datasets successfully.")

        # 2. Seed Test Cases if empty
        count_res = await session.execute(select(func.count()).select_from(TestCase))
        count = count_res.scalar() or 0
        
        if count == 0:
            logger.info("Initializing canonical multilingual safety test cases...")
            from app.core.seed_data import SEED_TEST_CASES
            for item in SEED_TEST_CASES:
                tc_data = dict(item)
                tc_data["manual_semantic_confirmation"] = True
                tc_data["reviewer_status"] = "Approved"
                tc = TestCase(**tc_data)
                session.add(tc)
            await session.commit()
            logger.info(f"Successfully seeded {len(SEED_TEST_CASES)} canonical multilingual test cases.")

        # 3. Seed Model Configurations if empty
        model_count_res = await session.execute(select(func.count()).select_from(ModelConfig))
        model_count = model_count_res.scalar() or 0
        if model_count == 0:
            logger.info("Initializing open-weight model configurations in database...")
            for model_id, meta in DEFAULT_MODELS_METADATA.items():
                m = ModelConfig(
                    id=model_id,
                    name=meta.get("name", model_id),
                    identifier=meta.get("identifier", model_id),
                    version="1.0",
                    provider=meta.get("provider", "Hosted-OpenWeight"),
                    quantization=meta.get("quantization", "none"),
                    api_key_env=meta.get("api_key_env"),
                    connection_status="CONFIGURED_UNTESTED" if meta.get("provider") != "Research-Simulation" else "AVAILABLE",
                    status_message="Simulation adapter active" if meta.get("provider") == "Research-Simulation" else "Configuration registered. Run test to verify connectivity.",
                    context_window=meta.get("context_window", "8192"),
                    parameters=meta.get("parameters", "8B"),
                    is_default=(model_id == "mock-research-adapter")
                )
                m.supported_languages = meta.get("supported_languages", ["English", "Kannada Native (ಕನ್ನಡ)", "Romanized Kannada", "Kanglish"])
                m.inference_config = {"temperature": 0.7, "max_tokens": 512, "top_p": 0.9, "timeout": 30}
                session.add(m)
            await session.commit()
            logger.info(f"Successfully seeded {len(DEFAULT_MODELS_METADATA)} model configurations.")
