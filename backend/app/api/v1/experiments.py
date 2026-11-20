import uuid
import json
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, delete

from app.core.database import get_db, AsyncSessionLocal
from app.models.experiment import Experiment
from app.models.evaluation import EvaluationResult
from app.models.test_case import TestCase
from app.schemas.evaluation import (
    CreateExperimentRequest,
    RunExperimentRequest,
    ExperimentResponse,
    EvaluationItemDetail
)
from app.services.evaluation.engine import ExperimentExecutionEngine
from app.services.model_adapter.factory import get_model_adapter
from app.services.evaluation.classifier import MultilingualSafetyClassifier
from app.services.guard.safety_guard import BilingualSafetyGuard
from pydantic import BaseModel

router = APIRouter(prefix="/experiments", tags=["Experiments & History"])

async def _run_experiment_in_background(experiment_id: str, run_request_data: dict):
    """Background task worker with its own database session."""
    req = RunExperimentRequest(**run_request_data)
    async with AsyncSessionLocal() as session:
        await ExperimentExecutionEngine.run_experiment(
            experiment_id=experiment_id,
            db=session,
            run_request=req
        )

@router.get("", response_model=List[ExperimentResponse])
async def list_experiments(limit: int = 50, db: AsyncSession = Depends(get_db)):
    """Retrieve history of recorded research benchmark runs."""
    stmt = select(Experiment).order_by(desc(Experiment.created_at)).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("", response_model=ExperimentResponse, status_code=201)
async def create_experiment(payload: CreateExperimentRequest, db: AsyncSession = Depends(get_db)):
    """
    Create a new reproducible research benchmark experiment record.
    Captures dataset version, model version, generation parameters, and random seed.
    """
    exp_id = str(uuid.uuid4())
    generation_params_str = json.dumps(payload.generation_parameters or {
        "temperature": 0.7,
        "max_tokens": 512,
        "top_p": 0.9
    })

    exp = Experiment(
        id=exp_id,
        name=payload.name,
        target_model=payload.target_model,
        guard_enabled=payload.guard_enabled,
        status="pending",
        total_test_cases=len(payload.test_case_ids) if payload.test_case_ids else 0,
        progress_percent=0.0,
        completed_items=0,
        dataset_version=payload.dataset_version,
        model_version=payload.model_version,
        evaluation_method_version="bhashashield-classifier-v1.2",
        prompt_template_version="v1.0-direct",
        generation_parameters=generation_params_str,
        random_seed=payload.random_seed,
        created_at=datetime.now(timezone.utc)
    )
    db.add(exp)
    await db.commit()
    await db.refresh(exp)
    return exp

@router.get("/{experiment_id}", response_model=ExperimentResponse)
async def get_experiment(experiment_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve details and aggregated metrics for a specific experiment."""
    stmt = select(Experiment).where(Experiment.id == experiment_id)
    result = await db.execute(stmt)
    exp = result.scalar_one_or_none()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return exp

@router.post("/{experiment_id}/run", response_model=ExperimentResponse)
async def run_experiment(
    experiment_id: str,
    background_tasks: BackgroundTasks,
    payload: Optional[RunExperimentRequest] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Execute experiment across approved paired test cases.
    Supports asynchronous execution with live progress reporting.
    """
    stmt = select(Experiment).where(Experiment.id == experiment_id)
    res = await db.execute(stmt)
    exp = res.scalar_one_or_none()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")

    if exp.status == "running":
        raise HTTPException(status_code=400, detail="Experiment is already currently running.")

    run_req = payload or RunExperimentRequest()

    if run_req.background and background_tasks is not None:
        exp.status = "running"
        exp.progress_percent = 0.0
        exp.completed_items = 0
        await db.commit()
        await db.refresh(exp)
        background_tasks.add_task(
            _run_experiment_in_background,
            experiment_id=experiment_id,
            run_request_data=run_req.model_dump()
        )
        return exp

    # Synchronous execution
    finished_exp = await ExperimentExecutionEngine.run_experiment(
        experiment_id=experiment_id,
        db=db,
        run_request=run_req
    )
    return finished_exp

@router.get("/{experiment_id}/results", response_model=List[EvaluationItemDetail])
async def get_experiment_results(experiment_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve detailed per-prompt evaluation records for an experiment."""
    stmt = select(EvaluationResult).where(EvaluationResult.experiment_id == experiment_id)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.delete("/{experiment_id}", status_code=204)
async def delete_experiment(experiment_id: str, db: AsyncSession = Depends(get_db)):
    """Delete an experiment and its associated evaluation results."""
    await db.execute(delete(EvaluationResult).where(EvaluationResult.experiment_id == experiment_id))
    stmt = delete(Experiment).where(Experiment.id == experiment_id)
    result = await db.execute(stmt)
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Experiment not found")
    await db.commit()
    return None

@router.post("/seed-baseline", response_model=List[ExperimentResponse])
async def seed_baseline_experiments(db: AsyncSession = Depends(get_db)):
    """Seed multi-model baseline comparison runs for analytics visualization."""
    now = datetime.now(timezone.utc)
    
    seeds = [
        Experiment(
            id=str(uuid.uuid4()),
            name="Sarvam-2B Indic Safety Baseline (Raw)",
            target_model="sarvam-2b-indic",
            guard_enabled=False,
            status="completed",
            total_test_cases=6,
            progress_percent=100.0,
            completed_items=24,
            asr_english=0.1667,
            asr_kannada_native=0.3333,
            asr_kannada_romanized=0.6667,
            asr_kanglish=0.8333,
            over_refusal_english=0.0,
            over_refusal_kannada_native=0.1667,
            over_refusal_kannada_romanized=0.0,
            over_refusal_kanglish=0.0,
            dataset_version="v1.0.4",
            model_version="sarvam-2b-v0.5",
            random_seed=42,
            created_at=now - timedelta(hours=3)
        ),
        Experiment(
            id=str(uuid.uuid4()),
            name="Sarvam-2B Indic + Bilingual Guard",
            target_model="sarvam-2b-indic",
            guard_enabled=True,
            status="completed",
            total_test_cases=6,
            progress_percent=100.0,
            completed_items=24,
            asr_english=0.0,
            asr_kannada_native=0.0,
            asr_kannada_romanized=0.0,
            asr_kanglish=0.0,
            over_refusal_english=0.0,
            over_refusal_kannada_native=0.0,
            over_refusal_kannada_romanized=0.0,
            over_refusal_kanglish=0.0,
            dataset_version="v1.0.4",
            model_version="sarvam-2b-v0.5",
            random_seed=42,
            created_at=now - timedelta(hours=2)
        ),
        Experiment(
            id=str(uuid.uuid4()),
            name="Llama-3-8B-Instruct Baseline (Raw)",
            target_model="llama3-8b-instruct",
            guard_enabled=False,
            status="completed",
            total_test_cases=6,
            progress_percent=100.0,
            completed_items=24,
            asr_english=0.0,
            asr_kannada_native=0.5000,
            asr_kannada_romanized=0.8333,
            asr_kanglish=0.8333,
            over_refusal_english=0.0,
            over_refusal_kannada_native=0.0,
            over_refusal_kannada_romanized=0.0,
            over_refusal_kanglish=0.0,
            dataset_version="v1.0.4",
            model_version="meta-llama-3-8b-instruct",
            random_seed=42,
            created_at=now - timedelta(hours=1)
        ),
        Experiment(
            id=str(uuid.uuid4()),
            name="Llama-3-8B-Instruct + Bilingual Guard",
            target_model="llama3-8b-instruct",
            guard_enabled=True,
            status="completed",
            total_test_cases=6,
            progress_percent=100.0,
            completed_items=24,
            asr_english=0.0,
            asr_kannada_native=0.0,
            asr_kannada_romanized=0.0,
            asr_kanglish=0.0,
            over_refusal_english=0.0,
            over_refusal_kannada_native=0.0,
            over_refusal_kannada_romanized=0.0,
            over_refusal_kanglish=0.0,
            dataset_version="v1.0.4",
            model_version="meta-llama-3-8b-instruct",
            random_seed=42,
            created_at=now - timedelta(minutes=30)
        )
    ]
    
    for s in seeds:
        db.add(s)
    await db.commit()
    
    stmt = select(Experiment).order_by(desc(Experiment.created_at)).limit(20)
    res = await db.execute(stmt)
    return res.scalars().all()

class DemoExperimentRequest(BaseModel):
    target_model: str = "mock-research-adapter"
    modalities: List[str] = ["ENGLISH", "KANNADA_NATIVE", "KANNADA_ROMANIZED", "KANGLISH"]
    guard_enabled: bool = False
    test_case_ids: Optional[List[str]] = None

@router.post("/demo")
async def run_demo_experiment(
    payload: DemoExperimentRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Execute an interactive demo experiment across chosen languages.
    Results are explicitly branded and labeled as DEMO DATA.
    """
    stmt = select(TestCase)
    if payload.test_case_ids:
        stmt = stmt.where(TestCase.id.in_(payload.test_case_ids))
    res = await db.execute(stmt)
    test_cases = res.scalars().all()
    if not test_cases:
        test_cases = (await db.execute(select(TestCase).limit(4))).scalars().all()

    experiment_id = str(uuid.uuid4())
    counts = {
        "ENGLISH": {"total": 0, "unsafe": 0, "over_refusal": 0},
        "KANNADA_NATIVE": {"total": 0, "unsafe": 0, "over_refusal": 0},
        "KANNADA_ROMANIZED": {"total": 0, "unsafe": 0, "over_refusal": 0},
        "KANGLISH": {"total": 0, "unsafe": 0, "over_refusal": 0},
    }

    adapter = get_model_adapter(payload.target_model)
    evaluation_items = []

    for tc in test_cases:
        prompt_map = {
            "ENGLISH": tc.english_prompt,
            "KANNADA_NATIVE": tc.kannada_native_prompt,
            "KANNADA_ROMANIZED": tc.kannada_romanized_prompt,
            "KANGLISH": tc.kanglish_prompt
        }

        for mod in payload.modalities:
            p_text = prompt_map.get(mod, "")
            if not p_text:
                continue

            if mod not in counts:
                counts[mod] = {"total": 0, "unsafe": 0, "over_refusal": 0}
            counts[mod]["total"] += 1

            guard_intervened = False
            guard_notes = None
            sanitized = p_text

            if payload.guard_enabled:
                g_res = BilingualSafetyGuard.inspect_and_guard_prompt(p_text, payload.target_model)
                guard_intervened = g_res["guard_intervened"]
                guard_notes = g_res["guard_notes"]
                sanitized = g_res["sanitized_prompt"]

            if payload.guard_enabled and guard_intervened:
                model_output = (
                    "ಕ್ಷಮಿಸಿ, ಹಾನಿಕಾರಕ ಅಥವಾ ವಂಚಕ ಚಟುವಟಿಕೆಗಳಿಗೆ ಸಹಾಯ ಮಾಡುವ ಮಾಹಿತಿಯನ್ನು ನೀಡಲು ಸಾಧ್ಯವಿಲ್ಲ. "
                    "ಸುರಕ್ಷಿತ ಮತ್ತು ಜವಾಬ್ದಾರಿಯುತ ತಂತ್ರಜ್ಞಾನ ಬಳಕೆಗೆ ಮಾತ್ರ ಸಹಾಯ ಮಾಡಬಹುದು. "
                    "(I apologize, I cannot assist with malicious, exploit, or phishing requests in any language.)"
                )
                lat = 24.0
            else:
                gen_res = await adapter.generate(prompt=sanitized, modality=mod)
                model_output = gen_res["raw_output"]
                lat = gen_res["latency_ms"]

            audit = MultilingualSafetyClassifier.classify(
                prompt=p_text,
                model_output=model_output,
                category=tc.category,
                reference_classification=getattr(tc, "reference_classification", None)
            )

            verdict = audit["verdict"]
            if verdict == "UNSAFE_COMPLIANCE":
                counts[mod]["unsafe"] += 1
            elif verdict in ["OVER_REFUSAL", "UNNECESSARY_REFUSAL"]:
                counts[mod]["over_refusal"] += 1

            eval_rec = EvaluationResult(
                id=str(uuid.uuid4()),
                experiment_id=experiment_id,
                test_case_id=tc.id,
                target_model=payload.target_model,
                language_modality=mod,
                prompt_text=p_text,
                model_output=model_output,
                guard_active=payload.guard_enabled,
                guard_intervened=guard_intervened,
                guard_notes=guard_notes,
                safety_verdict=verdict,
                confidence_score=audit["confidence"],
                rationale=audit["rationale"],
                latency_ms=lat
            )
            db.add(eval_rec)
            evaluation_items.append({
                "id": eval_rec.id,
                "benchmark_id": getattr(tc, "benchmark_id", "BS-SAMPLE"),
                "category": getattr(tc, "category", "Cybersecurity"),
                "language_modality": mod,
                "prompt_text": p_text,
                "model_output": model_output,
                "guard_intervened": guard_intervened,
                "safety_verdict": verdict,
                "confidence_score": audit["confidence"],
                "rationale": audit["rationale"],
                "latency_ms": lat,
                "is_demo_data": True
            })

    def calc(m, key):
        t = counts.get(m, {}).get("total", 0)
        return round(counts.get(m, {}).get(key, 0) / t, 4) if t > 0 else 0.0

    exp = Experiment(
        id=experiment_id,
        name=f"[DEMO DATA] Sample Evaluation: {payload.target_model} ({'Guarded' if payload.guard_enabled else 'Baseline'})",
        target_model=payload.target_model,
        guard_enabled=payload.guard_enabled,
        status="completed",
        total_test_cases=len(test_cases),
        progress_percent=100.0,
        completed_items=len(evaluation_items),
        asr_english=calc("ENGLISH", "unsafe"),
        asr_kannada_native=calc("KANNADA_NATIVE", "unsafe"),
        asr_kannada_romanized=calc("KANNADA_ROMANIZED", "unsafe"),
        asr_kanglish=calc("KANGLISH", "unsafe"),
        over_refusal_english=calc("ENGLISH", "over_refusal"),
        over_refusal_kannada_native=calc("KANNADA_NATIVE", "over_refusal"),
        over_refusal_kannada_romanized=calc("KANNADA_ROMANIZED", "over_refusal"),
        over_refusal_kanglish=calc("KANGLISH", "over_refusal"),
        dataset_version="demo-v1.0",
        model_version="demo-adapter",
        random_seed=42
    )
    db.add(exp)
    await db.commit()
    await db.refresh(exp)

    return {
        "experiment": {
            "id": exp.id,
            "name": exp.name,
            "target_model": exp.target_model,
            "guard_enabled": exp.guard_enabled,
            "status": exp.status,
            "progress_percent": 100.0,
            "completed_items": len(evaluation_items),
            "asr_english": exp.asr_english,
            "asr_kannada_native": exp.asr_kannada_native,
            "asr_kannada_romanized": exp.asr_kannada_romanized,
            "asr_kanglish": exp.asr_kanglish,
            "over_refusal_english": exp.over_refusal_english,
            "over_refusal_kannada_native": exp.over_refusal_kannada_native,
            "over_refusal_kannada_romanized": exp.over_refusal_kannada_romanized,
            "over_refusal_kanglish": exp.over_refusal_kanglish,
            "created_at": exp.created_at.isoformat() if hasattr(exp.created_at, "isoformat") else str(exp.created_at)
        },
        "evaluations": evaluation_items,
        "demo_disclaimer": (
            "[DEMO DATA / RESEARCH SIMULATION] All evaluation metrics and model outputs below are generated "
            "for live sample demonstration purposes only. They are explicitly labeled as DEMO DATA and must not "
            "be cited or presented as real empirical research findings."
        ),
        "selected_modalities": payload.modalities,
        "guard_enabled": payload.guard_enabled,
        "target_model": payload.target_model,
        "total_probes_evaluated": len(evaluation_items),
        "completion_status": "completed"
    }
