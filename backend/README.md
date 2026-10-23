# ScoutSpark Backend API ✦ FastAPI & SQLite

FastAPI persistent backend service for ScoutSpark B2B Prospect Intelligence.

---

## 🌟 Overview

The backend provides:
- **Persistent Data Layer**: SQLite database using SQLAlchemy 2.x models for Prospects, Ideal Customer Profiles (ICP), Outreach Drafts, and Audit Activities.
- **REST API (`/api/v1`)**:
  - `GET /health`: Health status and database connectivity.
  - `GET /api/v1/dashboard/summary`: Live calculated pipeline stage counts and priority shortlist.
  - `GET /api/v1/prospects`: Multi-criteria querying, filtering by industry/stage/fit score, and sorting.
  - `GET /api/v1/prospects/{id}`: Single prospect dossier retrieval.
  - `POST /api/v1/prospects`: Create new prospect with deterministic baseline fit scoring.
  - `PATCH /api/v1/prospects/{id}`: Partial prospect update.
  - `DELETE /api/v1/prospects/{id}`: Delete prospect.
  - `PATCH /api/v1/prospects/{id}/stage`: Pipeline stage transitions with audit logging.
  - `PATCH /api/v1/prospects/{id}/outcome`: Record outcome notes.
  - `POST /api/v1/prospects/import`: Secure multipart CSV file upload with validation and row-level error reporting.
  - `GET /api/v1/icp` & `PUT /api/v1/icp`: Read and update ICP settings.
  - `GET /api/v1/research/config`: Provider configuration status and effective research mode (never exposes secret keys).
  - `POST /api/v1/research/run`: Bounded LangGraph research run with Tavily search, Gemini extraction, grounding validation, rules scoring, and SQLite persistence.
  - `GET /api/v1/outreach-drafts`, `POST`, `PATCH`: Personalized outreach drafts & human approval tracking.
  - `GET /api/v1/activities`: Audit trail of actions.
- **LangGraph Prospect Research Engine (`app/research/`)**:
  - `state.py`: Typed graph state, source references, extracted facts, and candidate models.
  - `providers.py`: Pluggable interfaces for Tavily Search API, Google Gemini API (`google-genai`), and offline mocks.
  - `graph.py`: StateGraph orchestration enforcing grounding validation, quarantining hallucinated URLs into hypotheses, rules scoring, and SQLite persistence.
  - `schemas.py`: Input validation for research requests and transparent outcome reports.
- **Transparent Baseline Scoring (`scoring_service.py`)**:
  - Deterministic evaluation (0–100) based on industry match, company scale/headcount, buyer role, verified evidence signals, and geography.
  - Explicit missing information detection and negative exclusion docking.
- **Idempotent Seeding (`seed.py`)**:
  - Automatically seeds the 8 internally consistent fictional prospects on first run.
  - Preserves user edits across restarts without duplication.
- **Interactive API Docs**:
  - Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
  - ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 💻 PowerShell Setup & Run Instructions

### 1. Create Virtual Environment & Install Dependencies
```powershell
# From project root: d:\MY PROJECTSZ\scoutspark
python -m venv .venv
.\.venv\Scripts\pip.exe install -r backend\requirements.txt
```

### 2. Run Backend Tests
```powershell
# Uses isolated in-memory SQLite database
.\.venv\Scripts\python.exe -m pytest backend\tests -v
```

### 3. Run FastAPI Development Server
```powershell
.\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
Server runs at: `http://localhost:8000`  
Swagger documentation: `http://localhost:8000/docs`

---

## 🔒 Security & Guardrails

- **CORS**: Strictly restricted to local Vite origins (`http://localhost:5173`, `http://127.0.0.1:5173`). No wildcard credentials.
- **CSV Security**: Only text/csv content is accepted. No arbitrary executable uploads are processed.
- **Human-in-the-Loop Protocol**: Outbound emails are drafted and human-approved; ScoutSpark never connects to SMTP or dispatches unsolicited outbound emails automatically.
- **Database Exclusion**: `backend/*.db` and SQLite database files are excluded in `.gitignore`.
