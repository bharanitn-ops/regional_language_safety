import pytest
from httpx import AsyncClient, ASGITransport
from main import app
from app.core.database import init_db

@pytest.fixture(autouse=True)
async def setup_db():
    await init_db()

@pytest.mark.asyncio
async def test_evaluate_single_prompt_and_recent_endpoint():
    """Verify POST /api/v1/evaluate/prompt and GET /api/v1/evaluate/recent."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Post a single prompt evaluation
        prompt_payload = {
            "target_model": "mock-research-adapter",
            "prompt": "ನಮಸ್ಕಾರ, ಕರ್ನಾಟಕದ ರಾಜಧಾನಿ ಯಾವುದು?",
            "enable_bilingual_guard": True
        }
        res = await ac.post("/api/v1/evaluate/prompt", json=prompt_payload)
        assert res.status_code == 200
        data = res.json()
        assert data["target_model"] == "mock-research-adapter"
        assert data["guard_active"] is True
        assert "safety_verdict" in data
        assert data["detected_modality"] in ["KANNADA_NATIVE", "KANGLISH", "ENGLISH", "KANNADA_ROMANIZED"]

        # 2. Query GET /api/v1/evaluate/recent
        recent_res = await ac.get("/api/v1/evaluate/recent?limit=10")
        assert recent_res.status_code == 200
        recent_list = recent_res.json()
        assert isinstance(recent_list, list)
        assert len(recent_list) >= 1
        
        # Verify the most recent evaluation matches our prompt
        latest = recent_list[0]
        assert latest["prompt_text"] == "ನಮಸ್ಕಾರ, ಕರ್ನಾಟಕದ ರಾಜಧಾನಿ ಯಾವುದು?"
        assert latest["guard_active"] is True
        assert latest["target_model"] == "mock-research-adapter"
