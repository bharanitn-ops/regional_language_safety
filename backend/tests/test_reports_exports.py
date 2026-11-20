import pytest
import io
import csv
import json
from httpx import AsyncClient, ASGITransport
from main import app
from app.core.database import init_db

@pytest.fixture(autouse=True)
async def setup_db():
    await init_db()

@pytest.mark.asyncio
async def test_full_17_section_report_structure():
    """Verify that GET /api/v1/reports/{id}/full returns all 17 specified sections."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # First ensure we have an experiment
        list_res = await ac.get("/api/v1/experiments")
        assert list_res.status_code == 200
        experiments = list_res.json()

        if not experiments:
            # Create & run one
            create_res = await ac.post("/api/v1/experiments", json={
                "name": "Phase 8 Verification Experiment",
                "target_model": "mock-research-adapter",
                "guard_enabled": True,
            })
            assert create_res.status_code == 201
            exp_id = create_res.json()["id"]
            run_res = await ac.post(f"/api/v1/experiments/{exp_id}/run", json={"background": False})
            assert run_res.status_code == 200
        else:
            exp_id = experiments[0]["id"]

        # Call full 17-section report
        report_res = await ac.get(f"/api/v1/reports/{exp_id}/full")
        assert report_res.status_code == 200
        data = report_res.json()

        # Check all 17 numbered sections
        assert "section_01_project_title" in data
        assert "BhashaShield AI" in data["section_01_project_title"]

        assert "section_02_experiment_id" in data
        assert data["section_02_experiment_id"] == exp_id

        assert "section_03_research_objective" in data
        assert len(data["section_03_research_objective"]) > 20

        assert "section_04_hypothesis" in data
        assert "open-weight language models" in data["section_04_hypothesis"]

        assert "section_05_research_questions" in data
        rqs = data["section_05_research_questions"]
        assert len(rqs) == 5
        rq_ids = [rq["id"] for rq in rqs]
        assert rq_ids == ["RQ1", "RQ2", "RQ3", "RQ4", "RQ5"]

        assert "section_06_model_details" in data
        model_details = data["section_06_model_details"]
        assert "model_identifier" in model_details
        assert "quantization" in model_details
        assert "parameters" in model_details

        assert "section_07_dataset_details" in data
        ds_details = data["section_07_dataset_details"]
        assert "total_benchmark_cases" in ds_details
        assert ds_details["paired_representations"] == 4

        assert "section_08_language_coverage" in data
        langs = data["section_08_language_coverage"]
        assert len(langs) == 4
        lang_codes = [l["code"] for l in langs]
        assert "ENGLISH" in lang_codes
        assert "KANNADA_NATIVE" in lang_codes
        assert "KANNADA_ROMANIZED" in lang_codes
        assert "KANGLISH" in lang_codes

        assert "section_09_methodology" in data
        assert data["section_09_methodology"]["independent_evaluation"] is True

        assert "section_10_evaluation_metrics" in data
        metrics_def = data["section_10_evaluation_metrics"]
        assert "unsafe_compliance_rate_ucr" in metrics_def
        assert "appropriate_refusal_rate_arr" in metrics_def
        assert "over_refusal_rate_orr" in metrics_def
        assert "language_safety_gap" in metrics_def

        assert "section_11_results" in data
        results = data["section_11_results"]
        assert "summary_table" in results
        assert len(results["summary_table"]) == 4
        for row in results["summary_table"]:
            assert "unsafe_compliance_ci_95" in row
            assert len(row["unsafe_compliance_ci_95"]) == 2

        assert "section_12_baseline_comparison" in data
        assert "section_13_guard_enabled_comparison" in data
        assert "relative_mitigation_efficacy_pct" in data["section_13_guard_enabled_comparison"]

        assert "section_14_failure_analysis" in data
        assert "taxonomy_distribution" in data["section_14_failure_analysis"]

        assert "section_15_statistical_uncertainty" in data
        assert "is_exploratory_dataset" in data["section_15_statistical_uncertainty"]

        assert "section_16_limitations" in data
        assert isinstance(data["section_16_limitations"], list)
        assert len(data["section_16_limitations"]) >= 3

        assert "section_17_conclusion" in data
        assert len(data["section_17_conclusion"]) > 50

@pytest.mark.asyncio
async def test_csv_report_export():
    """Verify that GET /api/v1/reports/{id}/export/csv generates a multi-section valid CSV."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        list_res = await ac.get("/api/v1/experiments")
        exp_id = list_res.json()[0]["id"]

        csv_res = await ac.get(f"/api/v1/reports/{exp_id}/export/csv")
        assert csv_res.status_code == 200
        assert "text/csv" in csv_res.headers["content-type"]
        assert "attachment; filename=" in csv_res.headers["content-disposition"]

        csv_content = csv_res.text
        assert "# BhashaShield AI - Scientific Evaluation Report (CSV Export)" in csv_content
        assert "# METRIC SUMMARY BY MODALITY" in csv_content
        assert "# EVALUATION DETAIL RECORDS" in csv_content
        assert "Kanglish (Code-Mixed)" in csv_content
        assert "Kannada Native Script" in csv_content

@pytest.mark.asyncio
async def test_json_report_export():
    """Verify that GET /api/v1/reports/{id}/export/json returns downloadable JSON whitepaper."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        list_res = await ac.get("/api/v1/experiments")
        exp_id = list_res.json()[0]["id"]

        json_res = await ac.get(f"/api/v1/reports/{exp_id}/export/json")
        assert json_res.status_code == 200
        assert "application/json" in json_res.headers["content-type"]
        assert "attachment; filename=" in json_res.headers["content-disposition"]

        parsed = json_res.json()
        assert parsed["section_02_experiment_id"] == exp_id
        assert "section_17_conclusion" in parsed

@pytest.mark.asyncio
async def test_dataset_json_and_csv_exports():
    """Verify that GET /api/v1/datasets/{id}/export/json and csv download valid artifacts."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        dss_res = await ac.get("/api/v1/datasets")
        assert dss_res.status_code == 200
        dss = dss_res.json()
        assert len(dss) > 0
        ds_id = dss[0]["id"]

        # 1. JSON Export
        j_res = await ac.get(f"/api/v1/datasets/{ds_id}/export/json")
        assert j_res.status_code == 200
        assert "application/json" in j_res.headers["content-type"]
        assert "attachment; filename=" in j_res.headers["content-disposition"]
        ds_obj = j_res.json()
        assert ds_obj["dataset_id"] == ds_id
        assert "test_cases" in ds_obj
        assert len(ds_obj["test_cases"]) > 0

        # 2. CSV Export
        c_res = await ac.get(f"/api/v1/datasets/{ds_id}/export/csv")
        assert c_res.status_code == 200
        assert "text/csv" in c_res.headers["content-type"]
        assert "attachment; filename=" in c_res.headers["content-disposition"]
        c_text = c_res.text
        assert "Benchmark ID" in c_text
        assert "English Prompt" in c_text
        assert "Kannada Native Prompt" in c_text
        assert "Kanglish Prompt" in c_text

@pytest.mark.asyncio
async def test_pdf_report_export():
    """Verify that GET /api/v1/reports/{id}/export/pdf generates a valid PDF document."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        list_res = await ac.get("/api/v1/experiments")
        exp_id = list_res.json()[0]["id"]

        pdf_res = await ac.get(f"/api/v1/reports/{exp_id}/export/pdf")
        assert pdf_res.status_code == 200
        assert "application/pdf" in pdf_res.headers["content-type"]
        assert "attachment; filename=" in pdf_res.headers["content-disposition"]
        assert pdf_res.content.startswith(b"%PDF-")
        assert len(pdf_res.content) > 1000

@pytest.mark.asyncio
async def test_demo_report_and_csv_labeling():
    """Verify that demo experiment reports and CSV exports clearly label demo results."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Run demo experiment
        demo_req = {
            "target_model": "mock-research-adapter",
            "modalities": ["ENGLISH", "KANGLISH"],
            "guard_enabled": True
        }
        demo_res = await ac.post("/api/v1/experiments/demo", json=demo_req)
        assert demo_res.status_code == 200
        demo_exp = demo_res.json()["experiment"]
        demo_id = demo_exp["id"]

        # Check full report labeling
        rep_res = await ac.get(f"/api/v1/reports/{demo_id}/full")
        assert rep_res.status_code == 200
        rep_data = rep_res.json()
        assert rep_data["is_demo_data"] is True
        assert rep_data["demo_disclaimer"] is not None
        assert "DEMO DATA" in rep_data["demo_disclaimer"]

        # Check CSV export labeling
        csv_res = await ac.get(f"/api/v1/reports/{demo_id}/export/csv")
        assert csv_res.status_code == 200
        csv_text = csv_res.text
        assert "[DEMO DATA NOTICE]" in csv_text
        assert "DO NOT CITE" in csv_text
        assert "DEMO DATA (Sample/Illustrative)" in csv_text

        # Check PDF export for demo experiment
        pdf_res = await ac.get(f"/api/v1/reports/{demo_id}/export/pdf")
        assert pdf_res.status_code == 200
        assert pdf_res.content.startswith(b"%PDF-")

