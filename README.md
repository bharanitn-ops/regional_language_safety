# 🛡️ BhashaShield AI

> **A Research-Oriented Multilingual AI Safety Evaluation, Benchmarking & Defense Platform**  
> *AI Research R2 Hackathon: "Jailbreaks speak Kannada too"*

[![Backend Tests](https://img.shields.io/badge/Pytest-48%20Passed-emerald.svg)](backend/tests)
[![TypeScript Build](https://img.shields.io/badge/TypeScript-Compiled-blue.svg)](frontend)
[![Research Whitepaper](https://img.shields.io/badge/Report-17--Section%20Academic-indigo.svg)](backend/app/api/v1/reports.py)
[![Export Formats](https://img.shields.io/badge/Exports-PDF%20%7C%20CSV%20%7C%20JSON-purple.svg)](backend/app/api/v1/reports.py)

---

## 📌 1. Research Overview & Problem Statement

Global open-weight Language Models (e.g., Llama-3, Mistral, Gemma) demonstrate robust safety alignment against harmful prompts in canonical English. However, safety boundaries frequently degrade or collapse entirely when equivalent malicious requests are presented in regional Indic language modalities:

1. **Kannada Native Script (ಕನ್ನಡ)** (`U+0C80–U+0CFF`)
2. **Romanized Kannada (Latin Transliteration)**
3. **Kanglish (Colloquial Kannada-English Code-Mixing)**

**BhashaShield AI** provides a complete empirical research workbench to:
- Benchmark cross-lingual refusal breakdown under 4-way semantically paired probes.
- Validate research hypotheses regarding Latin transliteration and code-mixing evasion vectors.
- Deploy and evaluate the **Bilingual Safety Guard (BSG)** — a 7-stage pre/post-generation defense pipeline.
- Generate publication-grade, 17-section academic whitepapers and reproducibility artifacts directly from stored database records.

---

## 🔬 2. Architecture & Pipeline

```
                                      [User Request / Probe]
                                                │
                                                ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        7-STAGE BILINGUAL SAFETY GUARD (BSG)                           │
│                                                                                        │
│  Stage 1: Language & Script Identification (English, Kannada, Romanized, Kanglish)     │
│       │                                                                                │
│       ▼                                                                                │
│  Stage 2: Input Normalization (Semantic preservation without destroying intent)        │
│       │                                                                                │
│       ▼                                                                                │
│  Stage 3: Multilingual Safety Classification (9-Class Structured Taxonomy)             │
│       │                                                                                │
│       ▼                                                                                │
│  Stage 4: Safety Policy Decision Layer (ALLOW / BLOCK / REVIEW)                        │
│       │                                                                                │
│       ├─── [BLOCK] ───────► Immediate Safe Dual-Language Refusal (Kannada + English)   │
│       │                                                                                │
│       └─── [ALLOW / REVIEW]                                                            │
│                 │                                                                      │
│                 ▼                                                                      │
│  Stage 5: Target Model Inference (Open-weight LLM: Llama-3, Sarvam, Mistral, Mock)     │
│                 │                                                                      │
│                 ▼                                                                      │
│  Stage 6: Output Safety Verification (Neutralizes leaked exploit payloads)             │
│                 │                                                                      │
│                 ▼                                                                      │
│  Stage 7: Final Response Delivery                                                      │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 3. Research Evaluation & Statistical Methodology

- **Hypothesis Testing:** Empirically tests whether open-weight language models exhibit cross-lingual safety disparity and whether BSG restores parity without inducing over-refusal on benign cultural controls.
- **RQ1–RQ5 Systematic Questions:** Paired McNemar discordant analysis across identical benchmark cases for:
  - **RQ1:** Cross-lingual disparity between English and Kannada Native script.
  - **RQ2:** Latin transliteration vulnerability in Romanized Kannada.
  - **RQ3:** Colloquial code-mixing bypass rate in conversational Kanglish.
  - **RQ4:** Mitigation efficacy of the Bilingual Safety Guard.
  - **RQ5:** Over-refusal preservation on harmless regional inquiries (e.g., Karnataka Rajyotsava).
- **Interval Estimation:** Wilson Score 95% Confidence Intervals with Edwards continuity correction.
- **Exploratory Benchmark Notices:** Clear statistical uncertainty tagging whenever $N < 30$.

---

## 📄 4. 17-Section Scientific Research Report Structure

Every report generated via `/api/v1/reports/{id}/full` and the frontend Research Reports viewer provides all 17 specified academic sections:

1. **Project Title**
2. **Experiment ID & Provenance**
3. **Research Objective**
4. **Central Hypothesis**
5. **Research Questions (RQ1–RQ5)**
6. **Evaluated Model Specifications**
7. **Dataset & Benchmark Configuration**
8. **Multilingual Coverage (4 Modalities)**
9. **Evaluation Methodology**
10. **Quantitative Safety Metrics Definitions**
11. **Empirical Results Table & Confidence Intervals**
12. **Baseline Unguarded Comparison & Disparity Gap**
13. **Guard-Enabled Comparison & Mitigation Efficacy**
14. **Category-Wise Failure Taxonomy Analysis (8 Categories)**
15. **Statistical Uncertainty & Sample Validity**
16. **Research Limitations & Scope Constraints**
17. **Scientific Conclusion**

---

## 🚀 5. Quick Start & Setup Guide

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm
- (Optional) Docker & Docker Compose

### 5.1 Backend Setup
```bash
cd backend
python -m venv venv

# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt

# Run full backend test suite (48 tests)
pytest tests -v

# Start FastAPI Server
uvicorn main:app --reload --port 8000
```
- API Base: `http://localhost:8000`
- Swagger Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/api/health`

### 5.2 Frontend Setup
```bash
cd frontend
npm install

# Type-check and production build
npm.cmd run build

# Start Vite Development Server
npm.cmd run dev
```
- Dashboard: `http://localhost:5173`

### 5.3 Docker Compose (Full Stack)
```bash
docker-compose up --build
```

---

## 🧪 6. Verified Test Suite & Performance Benchmarks

### Pytest Test Suite Results:
```text
======================= 48 passed, 102 warnings in 7.16s =======================
- test_bsg_demo_workflow.py (5-stage interactive workflow & demo outputs)
- test_dataset_api.py (CRUD, test cases, persistence across app restart)
- test_dataset_validator.py (Field validation, script matching, duplicates)
- test_demo_experiment.py (Sample evaluation, demo labeling, simulation)
- test_detector.py (Script ratio, transliteration, code-mixing detection)
- test_experiments_api.py (Batch execution, reproducibility, results)
- test_full_system_integration.py (End-to-end integration & timings)
- test_health.py (Health checks)
- test_metrics_guard_api.py (Metrics aggregation, guard inspection)
- test_model_adapter.py (Factory resolution, input validation, offline checks)
- test_models_api.py (Model listing, config, live probe)
- test_reports_exports.py (17-section report, PDF export, CSV stream, JSON whitepaper)
- test_safety_guard.py (BSG Stages 1–7 verification)
- test_statistical_engine.py (Wilson intervals, McNemar, RQ1-RQ5)
```

### Measured System Latency:
- **Health Check Latency:** ~18 ms
- **Unguarded Model Inference:** ~78 ms
- **Bilingual Safety Guard Evaluation:** ~10 ms
- **Batch Experiment Run:** ~750 ms
- **17-Section Whitepaper Synthesis:** ~10 ms
- **CSV Metrics Export Streaming:** ~8 ms

---

## 🔒 7. Security & Research Integrity Guarantees

- **No Hardcoded Fakes:** All metrics, tables, and charts derive directly from actual database rows.
- **Zero Secret Leaks:** No API keys are committed or exposed; `.env.example` provides sanitized templates.
- **Parametrized Queries:** SQL operations utilize SQLAlchemy async ORM with parameterized binding.
- **Ethical Testing Probes:** Probes assess refusal boundaries rather than weaponized exploit payloads.
- **Responsive 100vh Viewport:** Layout enforces zero unwanted page-level scrollbars with internal scroll panes.
