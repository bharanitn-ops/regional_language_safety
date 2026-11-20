import pytest
from httpx import AsyncClient, ASGITransport
from main import app
from app.core.database import init_db

@pytest.fixture(autouse=True)
async def setup_db():
    await init_db()

@pytest.mark.asyncio
async def test_experiment_creation_and_execution():
    """Test full reproducible experiment creation and execution cycle."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Create a reproducible experiment
        create_payload = {
            "name": "Integration Test: Baseline vs Guarded Evaluation",
            "target_model": "mock-research-adapter",
            "guard_enabled": True,
            "dataset_version": "v1.0.4",
            "model_version": "mock-v1.0",
            "random_seed": 1337,
            "generation_parameters": {"temperature": 0.5, "max_tokens": 256}
        }
        create_res = await ac.post("/api/v1/experiments", json=create_payload)
        assert create_res.status_code == 201
        exp_data = create_res.json()
        exp_id = exp_data["id"]
        assert exp_data["status"] == "pending"
        assert exp_data["guard_enabled"] is True
        assert exp_data["random_seed"] == 1337
        assert exp_data["dataset_version"] == "v1.0.4"

        # 2. Run the experiment synchronously
        run_res = await ac.post(
            f"/api/v1/experiments/{exp_id}/run",
            json={"temperature": 0.5, "max_tokens": 256, "background": False}
        )
        assert run_res.status_code == 200
        finished_exp = run_res.json()
        assert finished_exp["status"] == "completed"
        assert finished_exp["progress_percent"] == 100.0
        assert finished_exp["completed_items"] > 0

        # With guard enabled, attack success rate should be 0.0 across all languages
        assert finished_exp["asr_english"] == 0.0
        assert finished_exp["asr_kannada_native"] == 0.0
        assert finished_exp["asr_kannada_romanized"] == 0.0
        assert finished_exp["asr_kanglish"] == 0.0

        # 3. Retrieve experiment by ID
        get_res = await ac.get(f"/api/v1/experiments/{exp_id}")
        assert get_res.status_code == 200
        assert get_res.json()["id"] == exp_id

        # 4. Retrieve detailed results
        results_res = await ac.get(f"/api/v1/experiments/{exp_id}/results")
        assert results_res.status_code == 200
        results = results_res.json()
        assert len(results) > 0
        assert all(r["experiment_id"] == exp_id for r in results)
        assert all("language_modality" in r for r in results)
        assert any(r["language_modality"] == "KANGLISH" for r in results)
        assert any(r["language_modality"] == "ENGLISH" for r in results)

        # 5. List experiments
        list_res = await ac.get("/api/v1/experiments")
        assert list_res.status_code == 200
        assert any(e["id"] == exp_id for e in list_res.json())

        # 6. Delete experiment
        del_res = await ac.delete(f"/api/v1/experiments/{exp_id}")
        assert del_res.status_code == 204
