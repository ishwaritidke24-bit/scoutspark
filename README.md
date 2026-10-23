# ScoutSpark ✦ Find your next yes.

> **Stop guessing. Let's find your next customer.**  
> Find businesses that might need your product, see why they could be a good fit, and write messages that feel personal. You stay in control of every message.

---

## 🌟 What is ScoutSpark?

- **Name**: ScoutSpark
- **Tagline**: *Find your next yes.*
- **Who it is for**: Early-stage startup founders looking for their first business customers.
- **The Problem**: Founders spend hours digging through company websites, job posts, and social profiles just to write one cold email that usually gets ignored. Generic AI tools make things worse by guessing facts, making up sources, and blasting spam.
- **The ScoutSpark Solution**: 
  1. Tell Scout what kind of customers you are looking for (your target customer profile).
  2. Scout searches the web for relevant companies and real clues (job postings, tech updates, new hires).
  3. Proven facts are kept strictly separate from educated guesses.
  4. Scout writes a personal, friendly draft message citing real facts.
  5. **You stay in full control**—ScoutSpark never sends an email without your review and approval.
  6. Track conversations across an 8-stage pipeline saved to a local database.

---

## 🎨 Design Direction & Craft

- **Editorial Technology Meets Startup Energy**: High craft typography combining *Fraunces* (warm editorial display serif) with *Plus Jakarta Sans* (punchy modern sans) and *JetBrains Mono* (signal data & scores).
- **Curated Palette**:
  - Deep Ink / Forest: `#17271F`
  - Warm Paper: `#F7F2E8` & `#FAF7F0`
  - Punchy Coral: `#FF7054`
  - Electric Lime: `#D8FF65`
  - Mint: `#9DE3D0`
- **Original Mascot: Scout ✦**: An expressive 4-point star creature with eyes, tiny smile, and contextual expressions (`idle`, `curious`, `thinking`, `celebratory`, `focused`). Hand-crafted in pure SVG and CSS animations—no remote GIFs or external image dependencies.
- **Tactile UI**: Neobrutalist tactile shadows (`box-shadow: 2px 2px 0px #17271F`), sticker badges, hand-annotated labels, and confetti micro-celebrations upon human approval.
- **Accessibility**: Native `prefers-reduced-motion` support, high contrast ratios, and semantic ARIA labeling.

---

## 🚀 Views & Capabilities

1. **Overview Dashboard**:
   - Hero banner with primary CTA *"Find my next customers"*.
   - Scout mascot feature box with contextual daily quotes.
   - 4-step compact workflow explanation.
   - Live pipeline stage count badges computed from the SQLite database.
   - Priority prospect shortlist with 1-click dossier inspection.
   - Today's research signal feed and recent outbound action audit log.

2. **Find Prospects**:
   - Multi-parameter filtering (by Industry, Pipeline Stage, and minimum Fit Score slider).
   - Real-time search query matching company names, buyer titles, and tech tags.
   - Dual-view toggle: High-craft **Grid Cards** vs. Dense **Table View**.
   - **CSV Import Modal**: Upload multipart `.csv` files with column validation, row-level error reporting, and automated baseline fit scoring.
   - Verified facts count vs. hypothesis flags on every account.

3. **Prospect Detail Dossier (Slide-over Drawer)**:
   - Fit score gauge and ICP compatibility breakdown.
   - **Observed Facts**: Verifiable public data with dates and sources.
   - **AI Hypotheses**: Quarantined reasoning steps with confidence levels (`high`, `medium`, `speculative`).
   - **Missing Information & Uncertainty Flags**: Prevents overconfidence on unknown variables.
   - **Outreach Studio**: Target buyer persona, synthesized angle (Hook, Value Prop, CTA), editable email draft, word count, copy-to-clipboard, and the celebratory **"Approve Draft for Founder Outbound"** button with persistent SQLite database updates.

4. **Outreach & Acquisition Pipeline**:
   - 8 visual stages: *To Research*, *Ready to Review*, *Approved*, *Contacted*, *Replied*, *Meeting Booked*, *Won*, and *Not a Fit*.
   - Interactive stage progression (forward/backward movement buttons).
   - In-place outcome note recording for founder memory.

5. **Campaign Studio**:
   - Cohort targeting criteria & trigger signal definition.
   - 3-touch reviewable message sequence (Incident Hook, Technical Benchmark, Zero-Commitment Sandbox).
   - In-place copy editing and instant clipboard copying.
   - Anti-spam guardrail: explicit notice that ScoutSpark does not auto-send emails.

6. **Evaluation Lab**:
   - 4 core evaluation pillars: *Fact Grounding Rate* (99.2%), *ICP Qualification Precision* (91.8%), *Hypothesis Uncertainty Flagging* (94.5%), and *Research Time Reduction* (78.4%).
   - Prominently labeled **"Illustrative demo data — No fabricated claims"**.
   - Automated grounding test case matrix demonstrating regression detection against hallucination.

7. **Settings / ICP Studio**:
   - Editable company description, value proposition, and primary pain point.
   - Interactive tag managers for Target Industries, Target Buyer Roles, Target Geographies, and Negative Exclusions.
   - Full persistence to FastAPI backend & SQLite database.

---

## 🛠️ Technology Stack & Architecture

- **Backend**:
  - Python 3.12 + FastAPI + Pydantic v2
  - LangGraph 1.2+ for bounded, observable graph-based research orchestration
  - Tavily Search API (`tavily-python`) for genuine public-web prospect retrieval
  - Google Gemini API (`google-genai` SDK) with structured JSON extraction and query planning
  - SQLAlchemy 2.x + SQLite (`backend/scoutspark.db`, excluded in `.gitignore`)
  - Transparent deterministic baseline ICP scoring engine (`scoring_service.py`)
  - Strict grounding validation engine: hallucinated URLs or unknown source IDs are quarantined into hypotheses
  - Idempotent seed script preserving user edits with provenance tracking (`demo`, `researched`, `csv`)
  - Pytest + HTTPX test suite with isolated in-memory test database and mock provider fixtures
  - Uvicorn development server
- **Frontend**:
  - React 19 + TypeScript + Vite
  - Tailwind CSS v4 + Custom Design Tokens (`src/index.css`)
  - Typed API client (`src/services/apiClient.ts` & `src/services/prospectService.ts`)
  - Guided Discovery Modal with live LangGraph execution audit, honest progress states, and fallback demo simulation
  - Framer Motion + Pure SVG/CSS Keyframes + `canvas-confetti`
- **Frontend Mode Selection**:
  - **API Mode (Default)**: Automatically connects to `VITE_API_BASE_URL` (default: `http://localhost:8000`). If unavailable, shows an offline connection alert banner with a "Retry Connection" action.
  - **Offline Demo Mode**: Set `VITE_DEMO_MODE=true` in `.env`, or click "Switch to Offline Demo Mode" in the UI banner to run strictly in-memory/localStorage without backend calls.

---

## 🌐 Stage 3: Live Public-Web Prospect Research Architecture

ScoutSpark implements a genuine, bounded LangGraph orchestration workflow connecting Tavily and Gemini:

```
[Start Research Run]
         │
         ▼
 1. validate_input ────► Validate requested prospect count (1-10) & load saved ICP profile
         │
         ▼
 2. plan_queries   ────► Gemini structures 2-3 focused search queries for target businesses
         │
         ▼
 3. search_sources ────► Tavily Search API retrieves real public snippets (bounded to 4-5 results)
         │
         ▼
 4. extract_candidates ► Gemini extracts companies, public facts, buyer titles, and hypotheses
         │
         ▼
 5. ground_and_validate► Strict validator checks every cited URL against actual Tavily records;
         │              unsupported citations are demoted from observed facts to hypotheses
         ▼
 6. qualify_and_score  ► Independent deterministic rules engine calculates 0-100 ICP fit score
         │
         ▼
 7. synthesize_outreach► Personalized cold outreach draft generated citing verified evidence
         │
         ▼
 8. persist_records    ► Saves prospect with provenance='researched' to SQLite persistent store
         │
         ▼
      [END] ───────────► Returns transparent execution report with queries, sources, and audit trail
```

### Environment Configuration & Provider Keys

Configuration is read exclusively on the backend from `backend/.env` (or environment variables). Never commit `.env` or expose API keys to the frontend:

```ini
# backend/.env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.1-flash-lite
TAVILY_API_KEY=your_tavily_api_key_here
SCOUTSPARK_RESEARCH_MODE=live
```

A template file is available at `backend/.env.example`.

### Cost & Quota Guardrails

- **Bounded Queries**: Query planning produces a maximum of 2 to 3 queries per research run.
- **Conservative Search Limits**: Tavily search is capped at 4 results per query to conserve search credits.
- **Deduplication**: Result URLs and domains are deduplicated before LLM extraction.
- **Model Efficiency**: Uses `gemini-3.1-flash-lite` (or configurable `GEMINI_MODEL`) with strict JSON schema constraints.
- **Failsafe**: If search returns 0 results or provider quota is exceeded, the graph exits cleanly with informative step warnings rather than looping endlessly.

---

## 📂 Project Structure

```
scoutspark/
├── backend/
│   ├── .env.example               # Safe environment template with blank placeholders
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py              # App settings, environment loader & provider status
│   │   ├── database.py            # SQLite engine, session & Base
│   │   ├── models.py              # SQLAlchemy models: Prospect, ICP, Activity, Draft
│   │   ├── schemas.py             # Pydantic v2 schemas with camelCase serialization
│   │   ├── seed.py                # Idempotent seed script (8 fictional prospects)
│   │   ├── research/              # Stage 3 Research Engine
│   │   │   ├── __init__.py
│   │   │   ├── state.py           # Typed LangGraph ResearchState & Pydantic models
│   │   │   ├── providers.py       # Base, Tavily, Gemini, and Mock provider interfaces
│   │   │   ├── graph.py           # StateGraph nodes, grounding validation, scoring & persistence
│   │   │   └── schemas.py         # Request and Response schemas for research endpoints
│   │   ├── routers/
│   │   │   ├── health.py          # GET /health
│   │   │   ├── research.py        # GET /api/v1/research/config & POST /api/v1/research/run
│   │   │   ├── dashboard.py       # GET /api/v1/dashboard/summary
│   │   │   ├── prospects.py       # CRUD, filtering, stage/outcome, CSV import
│   │   │   ├── icp.py             # GET & PUT /api/v1/icp
│   │   │   ├── outreach.py        # GET, POST, PATCH /api/v1/outreach-drafts
│   │   │   └── activities.py      # GET /api/v1/activities
│   │   └── services/
│   │       ├── prospect_service.py # Database operations & activity logging
│   │       └── scoring_service.py  # Deterministic 0-100 baseline scoring
│   ├── tests/
│   │   ├── conftest.py            # In-memory SQLite fixture & TestClient
│   │   ├── test_health.py         # Health & root tests
│   │   ├── test_seed.py           # Seed idempotency tests
│   │   ├── test_prospects.py      # CRUD, filtering, sorting, stage tests
│   │   ├── test_icp.py            # ICP read/write persistence tests
│   │   ├── test_outreach.py       # Draft creation and approval tests
│   │   ├── test_scoring.py        # Score bounds, factors, exclusions tests
│   │   ├── test_import.py         # CSV validation & security tests
│   │   ├── test_research.py       # Research config, graph deduplication, grounding & error tests
│   │   └── test_evaluation_fixture.py # Curated evaluation test fixture for scoring & citations
│   ├── requirements.txt           # Python dependencies (includes google-genai, langgraph, tavily-python)
│   └── README.md                  # Backend API documentation
├── src/
│   ├── types/index.ts             # Domain TypeScript interfaces (including provenance)
│   ├── services/
│   │   ├── apiClient.ts           # Typed HTTP client for FastAPI endpoints & research API
│   │   ├── prospectService.ts     # Abstraction supporting API & Demo modes
│   │   └── mockData.ts            # Fallback seed data & illustrative signals
│   ├── components/
│   │   ├── ScoutMascot.tsx        # 4-point star SVG creature with expressions
│   │   ├── Navbar.tsx             # Brand header, demo badge, navigation & CTA
│   │   ├── GuidedDiscoveryModal.tsx # Live LangGraph research runner & demo walkthrough
│   │   └── ProspectDetailDrawer.tsx # Intelligence dossier with provenance & email approval
│   ├── views/
│   │   ├── OverviewView.tsx       # Welcome dashboard, shortlist & signals
│   │   ├── ProspectsView.tsx      # Filtering, search, cards, table & CSV import
│   │   ├── PipelineView.tsx       # 8-stage visual acquisition board
│   │   ├── CampaignStudioView.tsx # Multi-touch sequence reviewer
│   │   ├── EvaluationLabView.tsx  # Factual grounding & precision benchmarks
│   │   └── SettingsView.tsx       # Editable ICP parameters & exclusions
│   ├── index.css                  # Color tokens, typography, tactile utilities
│   ├── App.tsx                    # Root state coordinator with backend error handling
│   └── main.tsx                   # React root entry point
├── package.json                   # Frontend dependencies & scripts
├── tsconfig.json                  # TypeScript compiler settings
├── vite.config.ts                 # Vite bundler configuration
└── README.md                      # Complete project documentation
```

---

## 💻 Exact PowerShell Commands to Start Services

Open **two separate Windows PowerShell terminals** from the project root (`d:\MY PROJECTSZ\scoutspark`):

### Terminal 1 — Backend (FastAPI + Uvicorn)
```powershell
# 1. Activate virtual environment (or create if not present)
python -m venv .venv
.\.venv\Scripts\pip.exe install -r backend\requirements.txt

# 2. Configure provider keys in backend\.env (if running live research)
# Copy template and fill keys:
Copy-Item backend\.env.example backend\.env

# 3. Run automated backend test suite (runs 100% offline with mocks)
.\.venv\Scripts\python.exe -m pytest backend\tests -v

# 4. Start FastAPI server
.\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API is live at: [http://localhost:8000/](http://localhost:8000/)
- Interactive Swagger documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health check: [http://localhost:8000/health](http://localhost:8000/health)
- Research config check: [http://localhost:8000/api/v1/research/config](http://localhost:8000/api/v1/research/config)

### Terminal 2 — Frontend (Vite + React)
```powershell
# 1. Install frontend dependencies (if not already installed)
npm install

# 2. Verify TypeScript types and production build
npm run build

# 3. Start Vite development server
npm run dev
```
- Web Application is live at: [http://localhost:5173/](http://localhost:5173/)

---

## 📡 Sample Research API Request & Response

### Request: `POST /api/v1/research/run`
```bash
curl -X POST http://localhost:8000/api/v1/research/run \
  -H "Content-Type: application/json" \
  -d '{
    "maxProspects": 2,
    "mode": "live",
    "userInstructions": "Distributed tracing and Kafka broker buffer saturation"
  }'
```

### Response (Summary):
```json
{
  "status": "completed",
  "mode": "live",
  "queriesExecuted": [
    "\"distributed tracing\" kafka saturation postmortem engineering blog",
    "fintech infrastructure hiring \"VP of Engineering\" tracing"
  ],
  "totalSourcesFound": 6,
  "candidatesFound": 1,
  "candidatesSaved": 1,
  "savedProspectIds": ["prospect-live-a1b2c3d4"],
  "prospects": [
    {
      "id": "prospect-live-a1b2c3d4",
      "companyName": "TRM Labs",
      "domain": "trmlabs.com",
      "fitScore": 69,
      "fitLevel": "moderate",
      "provenance": "researched",
      "observedFacts": [
        {
          "fact": "Engineers published postmortem detailing distributed tracing saturation under high event volumes.",
          "sourceUrl": "https://www.trmlabs.com/post/engineering-tracing",
          "verified": true
        }
      ],
      "hypotheses": [
        {
          "hypothesis": "Infrastructure team is evaluating trace compression technologies.",
          "confidence": "medium",
          "rationale": "High span volume cited in engineering blog."
        }
      ]
    }
  ],
  "stepOutcomes": [
    {"step": "validate_input", "status": "success", "summary": "Input verified against saved ICP"},
    {"step": "plan_queries", "status": "success", "summary": "Gemini planned 2 targeted queries"},
    {"step": "search_sources", "status": "success", "summary": "Tavily retrieved 6 web sources"},
    {"step": "ground_and_validate", "status": "success", "summary": "Verified 2 factual claims against source URLs"},
    {"step": "qualify_and_score", "status": "success", "summary": "Applied deterministic rules scoring"},
    {"step": "persist_records", "status": "success", "summary": "Saved 1 prospect to SQLite store"}
  ],
  "warnings": []
}
```

---

## 🧪 Tests & Build Commands Actually Run

1. **Backend Automated Tests (Pytest)**:
   ```powershell
   .\.venv\Scripts\python.exe -m pytest backend\tests -v
   ```
   **Result**: `42 passed in 0.86s` (100% pass rate across health, seed idempotency, prospects CRUD, stage/outcome updates, ICP persistence, outreach drafts, deterministic scoring, CSV import validation, research configuration, graph deduplication, hallucination quarantine, empty search handling, provider error handling, and scoring evaluation fixtures).
2. **Frontend Type Check & Production Bundle**:
   ```powershell
   npm run build
   ```
   **Result**: `tsc && vite build` built cleanly in 316ms with zero errors.
3. **End-to-End Browser Audit**:
   - Verified footer indicates `SQLite Backend: Connected`.
   - Verified that clicking *Find my next customers* opens `GuidedDiscoveryModal` with active provider status (`LangGraph Live Web Research`, model `gemini-3.1-flash-lite`, and `Tavily & Gemini Active`).
   - Verified both *Live Public Web Search* and *Demo Walkthrough* modes function smoothly.
   - Verified live researched prospects are badged with `🌐 Live Web` / `LIVE` to cleanly separate them from demo seed data.
   - Verified human-in-the-loop email approval workflow persists to database and UI.

---

## ⚖️ Ethical Safeguards & Known Limitations

- **Public Web Only**: ScoutSpark searches only publicly indexed web sources via the Tavily Search API. It never scrapes behind authentication walls, circumvents robots.txt, or bypasses access controls.
- **Zero Auto-Send**: ScoutSpark generates personalized, reviewable email drafts. It contains **no automated email dispatch mechanisms**. Human founder approval is required for every draft.
- **Rules-Based ICP Scoring**: Numerical fit scores are strictly computed by deterministic heuristics based on explicit ICP rules. Scores represent criteria alignment—not purchase probabilities or intent guarantees.
- **Data Provenance**: Live researched records carry `provenance: 'researched'` and are kept distinct from demo seed records (`provenance: 'demo'`) and manual imports (`provenance: 'csv'`).

