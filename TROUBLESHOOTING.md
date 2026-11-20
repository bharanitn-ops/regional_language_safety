# 🔧 BhashaShield AI — Troubleshooting & Operations Guide

This guide assists researchers, operators, and developers in diagnosing and resolving common operational issues across the BhashaShield AI platform.

---

## 1. Environment & Script Execution Policies

### Windows PowerShell `npm : File ... cannot be loaded`
**Symptom:** Running `npm` inside Windows PowerShell displays a `PSSecurityException` regarding script execution policies.  
**Resolution:**
- Run `npm.cmd` explicitly (e.g., `npm.cmd run build`, `npm.cmd run dev`).
- Alternatively, set your process execution policy:
  ```powershell
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
  ```

### Python Virtual Environment Activation
**Symptom:** Dependencies cannot be found when running `pytest` or `uvicorn`.  
**Resolution:**
- Ensure the dedicated virtual environment is active:
  ```powershell
  # Windows:
  .\backend\venv\Scripts\activate
  # Linux/macOS:
  source backend/venv/bin/activate
  ```
- Or run directly via the binary path:
  ```powershell
  .\backend\venv\Scripts\pytest tests -v
  ```

---

## 2. Port Conflicts & Server Startup

### Port 8000 (FastAPI Backend) already in use
**Symptom:** `[Errno 10048] error while attempting to bind on address ('0.0.0.0', 8000)`  
**Resolution:**
- Identify and terminate the lingering Python process:
  ```powershell
  Get-Process -Name python* | Stop-Process
  ```
- Or change the port when launching:
  ```powershell
  uvicorn main:app --port 8001 --reload
  ```
- Update `VITE_API_URL` in `frontend/.env` accordingly.

### Port 5173 (Vite Frontend) already in use
**Symptom:** Vite starts on port 5174 or 5175 instead of 5173.  
**Resolution:**
- Vite will automatically fallback to the next available port. Update CORS allowed origins in `backend/.env` if you access from a non-standard port:
  ```env
  CORS_ORIGINS=["http://localhost:5173","http://localhost:5174"]
  ```

---

## 3. Database & Migrations

### SQLite `OperationalError: table has no column named ...`
**Symptom:** Schema additions made during development do not appear in an existing SQLite `.db` file.  
**Resolution:**
- The application includes automatic non-destructive column migrations inside `backend/app/core/database.py` during `init_db()`.
- To completely reset to a clean state:
  ```powershell
  Remove-Item backend\bhashashield.db -Force
  .\backend\venv\Scripts\python -c "import asyncio; from main import app, init_db; asyncio.run(init_db())"
  ```

---

## 4. Open-Weight Model Adapters & API Keys

### Model reports `OFFLINE` or `Unconfigured Endpoint`
**Symptom:** Testing connection to `llama3-8b-instruct` or `sarvam-2b-indic` returns `OFFLINE`.  
**Resolution:**
- BhashaShield AI adheres strictly to the rule: **Never falsely report a model as available unless verified**.
- For live external inference, set the relevant API key and endpoint in `backend/.env`:
  ```env
  HUGGINGFACE_API_KEY="hf_..."
  SARVAM_API_KEY="sk_..."
  HOSTED_INFERENCE_ENDPOINT="https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct"
  ```
- If running offline or evaluating without cloud tokens, the platform provides the transparent **`mock-research-adapter`**, which empirically simulates cross-lingual refusal breakdown and guard interventions without requiring external GPU hardware.

---

## 5. Bilingual Safety Guard (BSG) Behavior

### Refusal trigger not firing on specialized slang
**Symptom:** A novel colloquial Kanglish phrase does not trigger pre-generation blockage.  
**Resolution:**
- Check the confidence threshold in `SettingsPage` or `backend/.env`:
  ```env
  GUARD_CONFIDENCE_THRESHOLD=0.70
  ```
- The 7-stage pipeline will route borderline probes to Stage 6 **Output Safety Verification**, intercepting any actionable exploit code post-generation even if pre-generation classifier confidence was moderate.

---

## 6. Docker Deployment

### Docker build error `failed to solve with frontend dockerfile`
**Symptom:** Docker cannot find dependencies or nginx fail.  
**Resolution:**
- Build with context from the project root:
  ```bash
  docker-compose build --no-cache
  docker-compose up
  ```
- Ensure port 8000 and 5173 are free before starting containers.
