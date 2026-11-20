import pytest
from httpx import AsyncClient, ASGITransport
from main import app
from app.core.database import init_db

@pytest.fixture(autouse=True)
async def setup_db():
    await init_db()

@pytest.mark.asyncio
async def test_demo_experiment_endpoint():
    """Verify the Demo Experiment endpoint across selected models and modalities."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        demo_payload = {
            "target_model": "mock-research-adapter",
            "modalities": ["ENGLISH", "KANNADA_NATIVE", "KANNADA_ROMANIZED", "KANGLISH"],
            "guard_enabled": True
        }

        res = await ac.post("/api/v1/experiments/demo", json=demo_payload)
        assert res.status_code == 200
        data = res.json()

        # 1. Verify Demo Data Branding & Disclaimers
        assert "demo_disclaimer" in data
        assert "DEMO DATA" in data["demo_disclaimer"]
        assert "must not" in data["demo_disclaimer"]
        assert "real empirical research findings" in data["demo_disclaimer"]

        # 2. Verify Experiment Metadata & Labeling
        exp = data["experiment"]
        assert "[DEMO DATA]" in exp["name"]
        assert exp["target_model"] == "mock-research-adapter"
        assert exp["guard_enabled"] is True
        assert exp["status"] == "completed"
        assert exp["progress_percent"] == 100.0

        # 3. Verify Modality Coverage
        assert data["selected_modalities"] == ["ENGLISH", "KANNADA_NATIVE", "KANNADA_ROMANIZED", "KANGLISH"]
        evals = data["evaluations"]
        assert len(evals) > 0
        for ev in evals:
            assert ev["is_demo_data"] is True
            assert ev["language_modality"] in ["ENGLISH", "KANNADA_NATIVE", "KANNADA_ROMANIZED", "KANGLISH"]

        # 4. Verify baseline demo run (guard disabled)
        baseline_payload = {
            "target_model": "mock-research-adapter",
            "modalities": ["ENGLISH", "KANGLISH"],
            "guard_enabled": False
        }
        b_res = await ac.post("/api/v1/experiments/demo", json=baseline_payload)
        assert b_res.status_code == 200
        b_data = b_res.json()
        assert b_data["guard_enabled"] is False
        assert len(b_data["selected_modalities"]) == 2
