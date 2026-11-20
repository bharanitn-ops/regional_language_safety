import uuid
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.test_case import TestCase
from app.schemas.test_case import TestCaseResponse, TestCaseCreate, TestCaseUpdate, DatasetValidationReport
from app.services.dataset.validator import DatasetQualityValidator

from pydantic import BaseModel

class ReviewStatusUpdateRequest(BaseModel):
    reviewer_status: str
    reviewer_notes: Optional[str] = None
    manual_semantic_confirmation: Optional[bool] = None

router = APIRouter(prefix="/test-cases", tags=["Test Cases"])

@router.get("", response_model=List[TestCaseResponse])
async def list_test_cases(
    category: Optional[str] = Query(None, description="Filter by risk category"),
    risk_level: Optional[str] = Query(None, description="Filter by risk level"),
    reviewer_status: Optional[str] = Query(None, description="Filter by review status"),
    dataset_version: Optional[str] = Query(None, description="Filter by dataset version"),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve test cases from the research benchmark repository."""
    stmt = select(TestCase)
    if category and category != "all":
        stmt = stmt.where(TestCase.category == category)
    if risk_level and risk_level != "all":
        stmt = stmt.where(TestCase.risk_level == risk_level)
    if reviewer_status and reviewer_status != "all":
        stmt = stmt.where(TestCase.reviewer_status == reviewer_status)
    if dataset_version and dataset_version != "all":
        stmt = stmt.where(TestCase.dataset_version == dataset_version)
        
    result = await db.execute(stmt.order_by(TestCase.created_at.desc()))
    return result.scalars().all()

@router.get("/{test_case_id}", response_model=TestCaseResponse)
async def get_test_case(test_case_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve a specific benchmark test case by ID."""
    stmt = select(TestCase).where(TestCase.id == test_case_id)
    result = await db.execute(stmt)
    tc = result.scalar_one_or_none()
    if not tc:
        raise HTTPException(status_code=404, detail="Test case not found")
    return tc

@router.post("", response_model=TestCaseResponse, status_code=201)
async def create_test_case(payload: TestCaseCreate, db: AsyncSession = Depends(get_db)):
    """Create a new multilingual test case pair."""
    tc_id = payload.id or str(uuid.uuid4())
    tc_data = payload.model_dump()
    tc_data["id"] = tc_id
    tc = TestCase(**tc_data)
    db.add(tc)
    await db.commit()
    await db.refresh(tc)
    return tc

@router.put("/{test_case_id}", response_model=TestCaseResponse)
async def update_test_case(
    test_case_id: str,
    payload: TestCaseUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update an existing multilingual test case."""
    stmt = select(TestCase).where((TestCase.id == test_case_id) | (TestCase.benchmark_id == test_case_id))
    result = await db.execute(stmt)
    tc = result.scalars().first()
    if not tc:
        raise HTTPException(status_code=404, detail="Test case not found")
        
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(tc, field, value)
        
    await db.commit()
    await db.refresh(tc)
    return tc

@router.patch("/{test_case_id}/review-status", response_model=TestCaseResponse)
async def update_review_status(
    test_case_id: str,
    payload: ReviewStatusUpdateRequest,
    db: AsyncSession = Depends(get_db)
):
    """Update review status and semantic verification for a benchmark test case."""
    stmt = select(TestCase).where((TestCase.id == test_case_id) | (TestCase.benchmark_id == test_case_id))
    result = await db.execute(stmt)
    tc = result.scalars().first()
    if not tc:
        raise HTTPException(status_code=404, detail="Test case not found")
        
    tc.reviewer_status = payload.reviewer_status
    if payload.reviewer_notes is not None:
        tc.reviewer_notes = payload.reviewer_notes
    if payload.manual_semantic_confirmation is not None:
        tc.manual_semantic_confirmation = payload.manual_semantic_confirmation
        
    await db.commit()
    await db.refresh(tc)
    return tc

@router.delete("/{test_case_id}", status_code=204)
async def delete_test_case(
    test_case_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Delete a benchmark test case by ID or benchmark_id."""
    stmt = select(TestCase).where((TestCase.id == test_case_id) | (TestCase.benchmark_id == test_case_id))
    result = await db.execute(stmt)
    tc = result.scalars().first()
    if not tc:
        raise HTTPException(status_code=404, detail="Test case not found")
        
    await db.delete(tc)
    await db.commit()
    return None

@router.post("/validate", response_model=DatasetValidationReport)
async def validate_test_case_payload(
    payload: Dict[str, Any],
    db: AsyncSession = Depends(get_db)
):
    """Validate a multilingual test case against linguistic, script, duplicate, and metadata quality rules."""
    stmt = select(TestCase)
    result = await db.execute(stmt)
    existing = [
        {
            "id": tc.id,
            "benchmark_id": tc.benchmark_id,
            "english_prompt": tc.english_prompt,
            "kannada_native_prompt": tc.kannada_native_prompt,
        }
        for tc in result.scalars().all()
    ]
    report = DatasetQualityValidator.validate_test_case(payload, existing_cases=existing)
    return report
