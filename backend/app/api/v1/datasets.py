import uuid
import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.models.dataset import Dataset
from app.models.test_case import TestCase
from app.schemas.dataset import DatasetCreate, DatasetUpdate, DatasetResponse

router = APIRouter(prefix="/datasets", tags=["Datasets"])

@router.get("", response_model=List[DatasetResponse])
async def list_datasets(db: AsyncSession = Depends(get_db)):
    """Retrieve all registered benchmark datasets with live test case counts."""
    stmt = select(Dataset).order_by(Dataset.created_at.desc())
    result = await db.execute(stmt)
    datasets = result.scalars().all()

    # Preload test case counts per dataset
    tc_counts_stmt = select(TestCase.dataset_version, func.count(TestCase.id)).group_by(TestCase.dataset_version)
    tc_counts_res = await db.execute(tc_counts_stmt)
    counts_map = dict(tc_counts_res.all())

    # Total test cases in canonical bank
    total_tc_res = await db.execute(select(func.count(TestCase.id)))
    total_tc = total_tc_res.scalar() or 0

    response = []
    for d in datasets:
        # If canonical dataset, count all test cases or by version
        count = counts_map.get(d.version, 0)
        if d.id == "canonical-r2-v1" or count == 0:
            count = max(count, total_tc)

        last_updated_str = d.updated_at.strftime("%Y-%m-%d") if d.updated_at else (d.created_at.strftime("%Y-%m-%d") if d.created_at else "2026-11-20")

        response.append(
            DatasetResponse(
                id=d.id,
                name=d.name,
                version=d.version,
                description=d.description or "",
                languages=d.languages,
                categories=d.categories,
                validation_status=d.validation_status or "validated",
                validationStatus=d.validation_status or "validated",
                review_status=d.review_status or "Approved",
                reviewStatus=d.review_status or "Approved",
                author=d.author or "AI Research R2 Core Team",
                test_case_count=count,
                testCaseCount=count,
                last_updated=last_updated_str,
                lastUpdated=last_updated_str,
                created_at=d.created_at,
                updated_at=d.updated_at,
            )
        )
    return response

@router.post("", response_model=DatasetResponse, status_code=status.HTTP_201_CREATED)
async def create_dataset(payload: DatasetCreate, db: AsyncSession = Depends(get_db)):
    """Create a new dataset entry in the database."""
    dataset_id = payload.id or f"ds-{uuid.uuid4().hex[:8]}"

    # Check if ID already exists
    existing = await db.execute(select(Dataset).where(Dataset.id == dataset_id))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Dataset with ID '{dataset_id}' already exists."
        )

    ds = Dataset(
        id=dataset_id,
        name=payload.name,
        version=payload.version,
        description=payload.description or "",
        validation_status=payload.validation_status,
        review_status=payload.review_status,
        author=payload.author,
    )
    ds.languages = payload.languages
    ds.categories = payload.categories

    db.add(ds)
    await db.commit()
    await db.refresh(ds)

    last_updated_str = ds.created_at.strftime("%Y-%m-%d") if ds.created_at else "2026-11-20"

    return DatasetResponse(
        id=ds.id,
        name=ds.name,
        version=ds.version,
        description=ds.description or "",
        languages=ds.languages,
        categories=ds.categories,
        validation_status=ds.validation_status,
        validationStatus=ds.validation_status,
        review_status=ds.review_status,
        reviewStatus=ds.review_status,
        author=ds.author,
        test_case_count=0,
        testCaseCount=0,
        last_updated=last_updated_str,
        lastUpdated=last_updated_str,
        created_at=ds.created_at,
        updated_at=ds.updated_at,
    )

@router.get("/{dataset_id}", response_model=DatasetResponse)
async def get_dataset(dataset_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve details of a specific benchmark dataset by ID."""
    stmt = select(Dataset).where(Dataset.id == dataset_id)
    res = await db.execute(stmt)
    ds = res.scalar_one_or_none()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")

    # Count test cases for this dataset version
    tc_count_res = await db.execute(
        select(func.count(TestCase.id)).where(TestCase.dataset_version == ds.version)
    )
    count = tc_count_res.scalar() or 0
    if ds.id == "canonical-r2-v1" and count == 0:
        total_tc = await db.execute(select(func.count(TestCase.id)))
        count = total_tc.scalar() or 0

    last_updated_str = ds.updated_at.strftime("%Y-%m-%d") if ds.updated_at else ds.created_at.strftime("%Y-%m-%d")

    return DatasetResponse(
        id=ds.id,
        name=ds.name,
        version=ds.version,
        description=ds.description or "",
        languages=ds.languages,
        categories=ds.categories,
        validation_status=ds.validation_status,
        validationStatus=ds.validation_status,
        review_status=ds.review_status,
        reviewStatus=ds.review_status,
        author=ds.author,
        test_case_count=count,
        testCaseCount=count,
        last_updated=last_updated_str,
        lastUpdated=last_updated_str,
        created_at=ds.created_at,
        updated_at=ds.updated_at,
    )

@router.put("/{dataset_id}", response_model=DatasetResponse)
async def update_dataset(dataset_id: str, payload: DatasetUpdate, db: AsyncSession = Depends(get_db)):
    """Update metadata for an existing dataset."""
    stmt = select(Dataset).where(Dataset.id == dataset_id)
    res = await db.execute(stmt)
    ds = res.scalar_one_or_none()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")

    update_dict = payload.model_dump(exclude_unset=True)
    if "languages" in update_dict:
        ds.languages = update_dict.pop("languages")
    if "categories" in update_dict:
        ds.categories = update_dict.pop("categories")

    for k, v in update_dict.items():
        setattr(ds, k, v)

    await db.commit()
    await db.refresh(ds)

    last_updated_str = ds.updated_at.strftime("%Y-%m-%d") if ds.updated_at else ds.created_at.strftime("%Y-%m-%d")

    return DatasetResponse(
        id=ds.id,
        name=ds.name,
        version=ds.version,
        description=ds.description or "",
        languages=ds.languages,
        categories=ds.categories,
        validation_status=ds.validation_status,
        validationStatus=ds.validation_status,
        review_status=ds.review_status,
        reviewStatus=ds.review_status,
        author=ds.author,
        test_case_count=0,
        testCaseCount=0,
        last_updated=last_updated_str,
        lastUpdated=last_updated_str,
        created_at=ds.created_at,
        updated_at=ds.updated_at,
    )

@router.delete("/{dataset_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_dataset(dataset_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a dataset from the persistent database."""
    stmt = select(Dataset).where(Dataset.id == dataset_id)
    res = await db.execute(stmt)
    ds = res.scalar_one_or_none()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")

    await db.delete(ds)
    await db.commit()
    return None

@router.get("/{dataset_id}/export/json")
async def export_dataset_json(dataset_id: str, db: AsyncSession = Depends(get_db)):
    """Export benchmark dataset and paired test cases as a JSON artifact."""
    from fastapi import Response
    ds_stmt = select(Dataset).where(Dataset.id == dataset_id)
    ds_res = await db.execute(ds_stmt)
    ds = ds_res.scalar_one_or_none()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")

    tc_stmt = select(TestCase)
    tc_res = await db.execute(tc_stmt)
    test_cases = tc_res.scalars().all()

    export_obj = {
        "dataset_id": ds.id,
        "name": ds.name,
        "version": ds.version,
        "description": ds.description,
        "languages": ds.languages,
        "categories": ds.categories,
        "validation_status": ds.validation_status,
        "review_status": ds.review_status,
        "author": ds.author,
        "exported_at": ds.updated_at.isoformat() if ds.updated_at else None,
        "total_test_cases": len(test_cases),
        "test_cases": [
            {
                "id": tc.id,
                "benchmark_id": tc.benchmark_id,
                "category": tc.category,
                "risk_level": tc.risk_level,
                "english_prompt": tc.english_prompt,
                "kannada_native_prompt": tc.kannada_native_prompt,
                "kannada_romanized_prompt": tc.kannada_romanized_prompt,
                "kanglish_prompt": tc.kanglish_prompt,
                "reference_classification": tc.reference_classification,
                "notes": tc.notes
            }
            for tc in test_cases
        ]
    }
    return Response(
        content=json.dumps(export_obj, indent=2).encode("utf-8"),
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename=bhashashield_dataset_{ds.id}.json"}
    )

@router.get("/{dataset_id}/export/csv")
async def export_dataset_csv(dataset_id: str, db: AsyncSession = Depends(get_db)):
    """Export benchmark dataset and paired test cases as CSV."""
    import csv, io
    from fastapi import Response
    ds_stmt = select(Dataset).where(Dataset.id == dataset_id)
    ds_res = await db.execute(ds_stmt)
    ds = ds_res.scalar_one_or_none()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")

    tc_stmt = select(TestCase)
    tc_res = await db.execute(tc_stmt)
    test_cases = tc_res.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["# BhashaShield AI - Multilingual Benchmark Dataset"])
    writer.writerow(["Dataset Name", ds.name, "Version", ds.version])
    writer.writerow(["Benchmark ID", "Category", "Risk Level", "English Prompt", "Kannada Native Prompt", "Romanized Kannada Prompt", "Kanglish Prompt", "Reference Classification"])

    for tc in test_cases:
        writer.writerow([
            tc.benchmark_id,
            tc.category,
            tc.risk_level,
            tc.english_prompt,
            tc.kannada_native_prompt,
            tc.kannada_romanized_prompt,
            tc.kanglish_prompt,
            tc.reference_classification
        ])

    return Response(
        content=output.getvalue().encode("utf-8-sig"),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=bhashashield_dataset_{ds.id}.csv"}
    )
