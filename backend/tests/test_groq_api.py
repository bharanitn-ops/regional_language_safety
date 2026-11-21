import pytest
from httpx import AsyncClient, ASGITransport
from main import app

@pytest.mark.asyncio
async def test_groq_status_endpoint():
    """Verify GET /api/v1/groq/status reports configured status."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/groq/status")
        assert response.status_code == 200
        data = response.json()
        assert "groq_api_configured" in data
        assert "available_models" in data
        assert len(data["available_models"]) > 0

@pytest.mark.asyncio
async def test_groq_models_endpoint():
    """Verify GET /api/v1/groq/models returns model descriptors."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/groq/models")
        assert response.status_code == 200
        models = response.json()
        assert isinstance(models, list)
        model_ids = [m["id"] for m in models]
        assert "qwen/qwen3.8-27b" in model_ids
        assert "openai/gpt-oss-120b" in model_ids

@pytest.mark.asyncio
async def test_groq_adapter_registration():
    """Verify factory returns GroqAdapter for groq models."""
    from app.services.model_adapter.factory import get_model_adapter
    from app.services.model_adapter.groq_adapter import GroqAdapter
    
    adapter = get_model_adapter("qwen/qwen3.8-27b")
    assert isinstance(adapter, GroqAdapter)
    assert adapter.model_id == "qwen/qwen3.8-27b"
