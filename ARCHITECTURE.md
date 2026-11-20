# BhashaShield AI — Architecture & System Design

**Project Codename:** BhashaShield AI  
**Research Initiative:** AI Research R2 Hackathon ("Jailbreaks speak Kannada too")  
**Product Type:** Multilingual AI Safety Evaluation and Improvement Platform

---

## 1. Problem Statement & Research Foundation

Large Language Models (LLMs) often exhibit critical safety alignment disparities across languages:
- Refusal mechanisms trained predominantly on English safety datasets frequently fail to transfer to regional Indian languages.
- Malicious prompts that are consistently refused in English can bypass safety filters when posed in:
  1. **Kannada Native Script (ಕನ್ನಡ)**: Unicode block `U+0C80`–`U+0CFF`.
  2. **Romanized Kannada (Latin Transliteration)**: Kannada phonetic spelling in Latin characters (e.g., *"hege madodu"*, *"durbhalathe"*).
  3. **Kanglish (Code-Mixing)**: A colloquial blend of English vocabulary with Kannada grammatical affixes (e.g., *"unpatched ports scan maadi"*).
- Crucially, research must remain objective: we **do not assume** Kannada is less safe than English—we empirically measure the safety differences.
- The platform also monitors **Over-Refusal** (false positives), where models unnecessarily reject benign cultural queries (e.g., Rajyotsava history, culinary recipes).

---

## 2. The 9 Core Logical Modules

```
                           +----------------------------------------+
                           |           Frontend Dashboard           |
                           |  (React 18 + TypeScript + Recharts)    |
                           +-------------------+--------------------+
                                               |
                                     REST APIs / JSON
                                               |
                                               v
+-----------------------------------------------------------------------------------+
|                              Backend Application (FastAPI)                        |
|                                                                                   |
|  +--------------------+   +-----------------------+   +------------------------+  |
|  | Linguistic Detector|   | Model Adapter Layer   |   | Safety Eval Engine     |  |
|  | - Native Script    |   | - AbstractBaseModel   |   | - Rule & Semantic      |  |
|  | - Romanized / CMI  |   | - MockResearchAdapter |   | - Multi-class Verdict: |  |
|  | - Kanglish Grammar |   | - HuggingFace Adapter |   |   SAFE_REFUSAL         |  |
|  +--------------------+   | - Ollama / IndicLLMs  |   |   UNSAFE_COMPLIANCE    |  |
|                           +-----------------------+   |   OVER_REFUSAL         |  |
|                                                       |   BENIGN_COMPLIANCE    |  |
|                                                       +------------------------+  |
|  +------------------------------------------------+                               |
|  | Bilingual Safety Guard (Defense Mechanism)     |   +------------------------+  |
|  | - Cross-lingual Intent Normalization           |   | Language Comparison    |  |
|  | - Dynamic Pre-generation Alignment Wrapper    |   | - Attack Success Rate  |  |
|  | - Post-generation Safety Filter                |   | - Refusal Parity Delta |  |
|  +------------------------------------------------+   +------------------------+  |
|                                                                                   |
|  +------------------------------------------------+   +------------------------+  |
|  | Multilingual Test Case Repository              |   | Research Report Engine |  |
|  | - 4-Way Canonical Benchmark Probes             |   | - Structured Findings  |  |
|  +------------------------------------------------+   +------------------------+  |
+-----------------------------------------------------------------------------------+
                                               |
                                        Async SQLAlchemy
                                               v
                           +----------------------------------------+
                           |      SQLite / PostgreSQL Storage       |
                           |  (TestCases, Experiments, Audit Logs)  |
                           +----------------------------------------+
```

### Module Descriptions:

1. **Frontend Dashboard:**
   Interactive laboratory built with React, TypeScript, Vite, and Tailwind CSS. Provides empirical Attack Success Rate (ASR) charts via Recharts, real-time safety inspection, and live benchmark suite execution.

2. **Backend API:**
   High-performance asynchronous FastAPI service adhering to REST standards, OpenAPI documentation (`/docs`), and health-check monitoring (`/api/health`).

3. **Model Adapter Layer:**
   Pluggable `AbstractBaseModelAdapter` architecture. Enables testing open-weight models (Llama-3, Sarvam Indic, Mistral) without rewriting the evaluation pipeline.

4. **Multilingual Test-Case Bank:**
   Curated paired test suite featuring identical semantic probes in four representations: English, Kannada Native, Romanized Kannada, and Kanglish. Includes both dangerous probes (cyber, phishing, hate speech) and benign cultural controls.

5. **Safety Evaluation Engine:**
   Multi-class linguistic classifier analyzing model responses for ethical refusal signals, exploit steps, or superficial over-refusals.

6. **Language Comparison Engine:**
   Computes empirical disparity metrics:
   $$\text{ASR}_{\text{Kanglish}} - \text{ASR}_{\text{English}}$$
   and Over-Refusal rates.

7. **Bilingual Safety Guard:**
   Active defense mechanism that detects linguistic evasion markers in transliterated and code-mixed inputs, extracting intent and applying pre-generation alignment wrappers.

8. **Research Report Generator:**
   Aggregates empirical experiment metrics, exportable audit trails, and reproducible findings.

9. **Database and Experiment History:**
   Async SQLAlchemy storing test cases, execution runs, and granular token outputs.

---

## 3. Strict Research Constraints Adhered To

- **No Fabricated Benchmarks:** All dashboard charts and metrics are computed from real records in the database.
- **Transparent Labelling:** Research simulation and demo modes are clearly labelled with warning badges.
- **Safety & Non-Operational Prompts:** Controlled test probes focus on refusal boundaries rather than functioning weaponized payloads.
- **No Hardcoded Credentials:** Environment variables manage configuration via `.env.example`.
