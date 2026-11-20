from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.core.config import settings
from app.core.database import get_db
from app.services.model_adapter.factory import list_available_adapters
from app.schemas.health import HealthResponse, SystemInfoResponse

router = APIRouter(tags=["Health & System"])

@router.get("/health", response_model=HealthResponse)
async def check_health(db: AsyncSession = Depends(get_db)):
    """Health check endpoint verifying system, database connectivity and model status."""
    db_status = "connected"
    try:
        await db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return HealthResponse(
        status="healthy" if db_status == "connected" else "degraded",
        version=settings.VERSION,
        project_name=settings.PROJECT_NAME,
        database=db_status,
        active_adapter=settings.DEFAULT_MODEL_NAME,
        available_adapters=list_available_adapters(),
        demo_mode=settings.DEMO_MODE,
        modalities_supported=["ENGLISH", "KANNADA_NATIVE", "KANNADA_ROMANIZED", "KANGLISH"],
        timestamp=datetime.now(timezone.utc).isoformat()
    )

@router.get("/system/info", response_model=SystemInfoResponse)
async def system_info():
    """Returns platform research scope, supported language modalities and models."""
    return SystemInfoResponse(
        project_name=settings.PROJECT_NAME,
        version=settings.VERSION,
        description=settings.DESCRIPTION,
        research_scope="Multilingual cross-script AI safety evaluation focusing on Kannada, Romanized Kannada, and Kanglish code-mixing.",
        problem_statement="AI models exhibit safety disparities between English and Indic languages. Kannada script, transliteration, and code-mixing present distinctive alignment challenges.",
        modalities=[
            {"code": "ENGLISH", "label": "English (Standard Latin)", "description": "Canonical safety benchmark baseline"},
            {"code": "KANNADA_NATIVE", "label": "Kannada Native (ಕನ್ನಡ)", "description": "Native Brahmic script representations"},
            {"code": "KANNADA_ROMANIZED", "label": "Romanized Kannada", "description": "Kannada language transliterated in Latin script"},
            {"code": "KANGLISH", "label": "Kanglish (Code-Mixed)", "description": "Colloquial blend of English lexicon and Kannada grammar"}
        ],
        models_configured=[
            {"id": "mock-research-adapter", "name": "BhashaShield Research Baseline (Simulation)", "type": "Deterministic Baseline", "description": "Research sandbox demonstrating cross-lingual refusal vulnerabilities"},
            {"id": "llama3-8b-instruct", "name": "Llama-3-8B-Instruct (Adapter)", "type": "Open Weight", "description": "Meta open-weight model integration layer"},
            {"id": "sarvam-2b-indic", "name": "Sarvam-2B Indic (Adapter)", "type": "Indic Specialized", "description": "Indic regional language open-weight adapter"},
            {"id": "mistral-7b-instruct", "name": "Mistral-7B-Instruct (Adapter)", "type": "Open Weight", "description": "Mistral AI foundation model integration"}
        ]
    )
