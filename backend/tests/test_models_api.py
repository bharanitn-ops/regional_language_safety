import pytest
from httpx import AsyncClient, ASGITransport
from main import app
from app.core.database import init_db

@pytest.fixture(autouse=True)
async def setup_db():
    await init_db()

@pytest.mark.asyncio
async def test_models_api_endpoints():
    """Test listing, registering, inspecting, and testing open-weight models."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. List models (should include seeded models)
        res = await ac.get("/api/v1/models")
        assert res.status_code == 200
        models = res.json()
        assert len(models) >= 4
        assert any(m["id"] == "mock-research-adapter" for m in models)
        assert any(m["id"] == "llama3-8b-instruct" for m in models)

        # Also verify mounting on /api/models
        res_alias = await ac.get("/api/models")
        assert res_alias.status_code == 200

        # 2. Get specific model
        res_get = await ac.get("/api/v1/models/mock-research-adapter")
        assert res_get.status_code == 200
        assert res_get.json()["id"] == "mock-research-adapter"
        assert res_get.json()["connection_status"] == "AVAILABLE"

        # 3. Test model execution / probe
        test_payload = {
            "prompt": "Test connectivity probe for Kannada multilingual evaluation",
            "modality": "ENGLISH",
            "temperature": 0.7
        }
        res_test = await ac.post("/api/v1/models/mock-research-adapter/test", json=test_payload)
        assert res_test.status_code == 200
        test_res = res_test.json()
        assert test_res["available"] is True
        assert test_res["status"] == "AVAILABLE"
        assert test_res["latency_ms"] > 0
        assert test_res["generated_text"] is not None

        # 4. Register a new custom open-weight model
        new_model_payload = {
            "id": "qwen2-7b-indic-test",
            "name": "Qwen 2 7B Indic Test Edition",
            "identifier": "Qwen/Qwen2-7B-Instruct",
            "version": "2.0",
            "provider": "Hosted-OpenWeight",
            "quantization": "4-bit",
            "context_window": "32768",
            "parameters": "7B",
            "supported_languages": ["English", "Kannada Native (ಕನ್ನಡ)", "Kanglish"]
        }
        create_res = await ac.post("/api/v1/models", json=new_model_payload)
        assert create_res.status_code == 201
        created_model = create_res.json()
        assert created_model["id"] == "qwen2-7b-indic-test"
        assert created_model["quantization"] == "4-bit"

        # 5. Patch model configuration
        patch_res = await ac.patch(
            "/api/v1/models/qwen2-7b-indic-test",
            json={"context_window": "65536", "quantization": "8-bit"}
        )
        assert patch_res.status_code == 200
        assert patch_res.json()["context_window"] == "65536"
        assert patch_res.json()["quantization"] == "8-bit"

        # 6. Delete custom model
        del_res = await ac.delete("/api/v1/models/qwen2-7b-indic-test")
        assert del_res.status_code == 204

        # Cannot delete default mock
        del_mock = await ac.delete("/api/v1/models/mock-research-adapter")
        assert del_mock.status_code == 400
