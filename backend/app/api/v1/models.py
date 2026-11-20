import logging
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.core.database import get_db
from app.models.model_config import ModelConfig
from app.schemas.model_config import (
    ModelConfigCreate,
    ModelConfigUpdate,
    ModelConfigResponse,
    ModelTestRequest,
    ModelTestResponse
)
from app.services.model_adapter.factory import get_model_adapter

logger = logging.getLogger("bhashashield.models")
router = APIRouter(prefix="/models", tags=["Open-Weight Model Management"])

@router.get("", response_model=List[ModelConfigResponse])
async def list_models(
    check_live: bool = Query(False, description="Whether to actively ping endpoints for live status"),
    db: AsyncSession = Depends(get_db)
):
    """
    List all configured open-weight model configurations.
    Never falsely reports a model as available.
    """
    stmt = select(ModelConfig).order_by(ModelConfig.created_at)
    result = await db.execute(stmt)
    models = result.scalars().all()

    if not check_live:
        return [
            ModelConfigResponse(
                id=m.id,
                name=m.name,
                identifier=m.identifier,
                version=m.version,
                provider=m.provider,
                quantization=m.quantization,
                endpoint_url=m.endpoint_url,
                api_key_env=m.api_key_env,
                connection_status=m.connection_status,
                status_message=m.status_message,
                context_window=m.context_window,
                parameters=m.parameters,
                supported_languages=m.supported_languages,
                inference_config=m.inference_config,
                is_default=m.is_default,
                created_at=m.created_at,
                updated_at=m.updated_at
            )
            for m in models
        ]

    # If live status check requested, query each adapter
    response_items = []
    for m in models:
        adapter = get_model_adapter(m.id, config={
            "identifier": m.identifier,
            "provider": m.provider,
            "endpoint_url": m.endpoint_url,
            "api_key_env": m.api_key_env,
            "quantization": m.quantization
        })
        try:
            status_info = await adapter.check_availability()
            m.connection_status = status_info.get("status", m.connection_status)
            m.status_message = status_info.get("details") or status_info.get("troubleshooting_info")
        except Exception as e:
            m.connection_status = "OFFLINE"
            m.status_message = f"Check failed: {str(e)}"
        
        response_items.append(
            ModelConfigResponse(
                id=m.id,
                name=m.name,
                identifier=m.identifier,
                version=m.version,
                provider=m.provider,
                quantization=m.quantization,
                endpoint_url=m.endpoint_url,
                api_key_env=m.api_key_env,
                connection_status=m.connection_status,
                status_message=m.status_message,
                context_window=m.context_window,
                parameters=m.parameters,
                supported_languages=m.supported_languages,
                inference_config=m.inference_config,
                is_default=m.is_default,
                created_at=m.created_at,
                updated_at=m.updated_at
            )
        )
    await db.commit()
    return response_items

@router.post("", response_model=ModelConfigResponse, status_code=201)
async def create_model_config(payload: ModelConfigCreate, db: AsyncSession = Depends(get_db)):
    """
    Register a new open-weight model configuration in the research registry.
    """
    model_id = payload.id or payload.identifier.split("/")[-1].lower()
    
    # Check duplicate
    existing = await db.execute(select(ModelConfig).where(ModelConfig.id == model_id))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail=f"Model configuration with id '{model_id}' already exists.")

    new_model = ModelConfig(
        id=model_id,
        name=payload.name,
        identifier=payload.identifier,
        version=payload.version,
        provider=payload.provider,
        quantization=payload.quantization,
        endpoint_url=payload.endpoint_url,
        api_key_env=payload.api_key_env,
        connection_status="CONFIGURED_UNTESTED",
        status_message="Registered; run test to verify connectivity.",
        context_window=payload.context_window,
        parameters=payload.parameters,
        is_default=payload.is_default,
        created_at=datetime.now(timezone.utc)
    )
    new_model.supported_languages = payload.supported_languages
    new_model.inference_config = payload.inference_config

    db.add(new_model)
    await db.commit()
    await db.refresh(new_model)

    return ModelConfigResponse(
        id=new_model.id,
        name=new_model.name,
        identifier=new_model.identifier,
        version=new_model.version,
        provider=new_model.provider,
        quantization=new_model.quantization,
        endpoint_url=new_model.endpoint_url,
        api_key_env=new_model.api_key_env,
        connection_status=new_model.connection_status,
        status_message=new_model.status_message,
        context_window=new_model.context_window,
        parameters=new_model.parameters,
        supported_languages=new_model.supported_languages,
        inference_config=new_model.inference_config,
        is_default=new_model.is_default,
        created_at=new_model.created_at,
        updated_at=new_model.updated_at
    )

@router.get("/{model_id}", response_model=ModelConfigResponse)
async def get_model_config(model_id: str, db: AsyncSession = Depends(get_db)):
    """
    Get detailed configuration and active status for a specific open-weight model.
    """
    stmt = select(ModelConfig).where(ModelConfig.id == model_id)
    res = await db.execute(stmt)
    model = res.scalar_one_or_none()
    if not model:
        raise HTTPException(status_code=404, detail=f"Model '{model_id}' not found.")

    adapter = get_model_adapter(model.id, config={
        "identifier": model.identifier,
        "provider": model.provider,
        "endpoint_url": model.endpoint_url,
        "api_key_env": model.api_key_env,
        "quantization": model.quantization
    })
    status_info = await adapter.check_availability()
    model.connection_status = status_info.get("status", model.connection_status)
    model.status_message = status_info.get("details") or status_info.get("troubleshooting_info")
    await db.commit()

    return ModelConfigResponse(
        id=model.id,
        name=model.name,
        identifier=model.identifier,
        version=model.version,
        provider=model.provider,
        quantization=model.quantization,
        endpoint_url=model.endpoint_url,
        api_key_env=model.api_key_env,
        connection_status=model.connection_status,
        status_message=model.status_message,
        context_window=model.context_window,
        parameters=model.parameters,
        supported_languages=model.supported_languages,
        inference_config=model.inference_config,
        is_default=model.is_default,
        created_at=model.created_at,
        updated_at=model.updated_at
    )

@router.post("/{model_id}/test", response_model=ModelTestResponse)
async def test_model_connectivity(
    model_id: str,
    payload: ModelTestRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Execute a live verification probe against a model adapter.
    Records latency, connection status, generated response, or troubleshooting info.
    Never reports a model as available unless verified.
    """
    stmt = select(ModelConfig).where(ModelConfig.id == model_id)
    res = await db.execute(stmt)
    model = res.scalar_one_or_none()

    custom_config = None
    if model:
        custom_config = {
            "name": model.name,
            "identifier": model.identifier,
            "provider": model.provider,
            "endpoint_url": model.endpoint_url,
            "api_key_env": model.api_key_env,
            "quantization": model.quantization
        }

    adapter = get_model_adapter(model_id, config=custom_config)
    
    # 1. Availability check
    avail = await adapter.check_availability()
    
    if not avail["available"]:
        if model:
            model.connection_status = avail["status"]
            model.status_message = avail.get("details")
            await db.commit()
        return ModelTestResponse(
            model_id=model_id,
            available=False,
            status=avail["status"],
            latency_ms=avail.get("latency_ms", 0.0),
            generated_text=None,
            error=avail.get("details"),
            troubleshooting_info=avail.get("troubleshooting_info"),
            metadata=avail
        )

    # 2. Test generation execution
    try:
        gen_result = await adapter.generate(
            prompt=payload.prompt,
            modality=payload.modality,
            temperature=payload.temperature
        )
        if model:
            model.connection_status = "AVAILABLE"
            model.status_message = f"Verified operational at {datetime.now(timezone.utc).strftime('%H:%M:%S UTC')}"
            await db.commit()

        return ModelTestResponse(
            model_id=model_id,
            available=True,
            status="AVAILABLE",
            latency_ms=gen_result["latency_ms"],
            generated_text=gen_result["raw_output"],
            metadata=gen_result.get("metadata", {})
        )
    except Exception as e:
        logger.error(f"Test generation error for model {model_id}: {str(e)}")
        if model:
            model.connection_status = "OFFLINE"
            model.status_message = f"Inference execution failed: {str(e)}"
            await db.commit()

        return ModelTestResponse(
            model_id=model_id,
            available=False,
            status="OFFLINE",
            latency_ms=0.0,
            error=str(e),
            troubleshooting_info=(
                f"Model adapter encountered an execution error.\n"
                f"Verify network connectivity, API key validity, or hardware memory."
            )
        )

@router.patch("/{model_id}", response_model=ModelConfigResponse)
async def update_model_config(
    model_id: str,
    payload: ModelConfigUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update configuration attributes for a model."""
    stmt = select(ModelConfig).where(ModelConfig.id == model_id)
    res = await db.execute(stmt)
    model = res.scalar_one_or_none()
    if not model:
        raise HTTPException(status_code=404, detail=f"Model '{model_id}' not found.")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "supported_languages" and value is not None:
            model.supported_languages = value
        elif field == "inference_config" and value is not None:
            model.inference_config = value
        elif hasattr(model, field):
            setattr(model, field, value)

    model.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(model)

    return ModelConfigResponse(
        id=model.id,
        name=model.name,
        identifier=model.identifier,
        version=model.version,
        provider=model.provider,
        quantization=model.quantization,
        endpoint_url=model.endpoint_url,
        api_key_env=model.api_key_env,
        connection_status=model.connection_status,
        status_message=model.status_message,
        context_window=model.context_window,
        parameters=model.parameters,
        supported_languages=model.supported_languages,
        inference_config=model.inference_config,
        is_default=model.is_default,
        created_at=model.created_at,
        updated_at=model.updated_at
    )

@router.delete("/{model_id}", status_code=204)
async def delete_model_config(model_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a custom model configuration."""
    if model_id == "mock-research-adapter":
        raise HTTPException(status_code=400, detail="Cannot delete default research baseline model.")

    stmt = delete(ModelConfig).where(ModelConfig.id == model_id)
    res = await db.execute(stmt)
    if res.rowcount == 0:
        raise HTTPException(status_code=404, detail=f"Model '{model_id}' not found.")
    await db.commit()
    return None
