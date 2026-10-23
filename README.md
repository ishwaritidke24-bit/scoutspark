# ScoutSpark ✦ Find your next yes.

> **DEMO WORKSPACE — SIMULATED DATA**  
> An award-winning editorial technology product crafted for early-stage B2B startup founders to identify evidence-backed prospect intelligence, prioritize opportunities, and draft personalized outreach with humans strictly in control of outbound actions.

---

## 🌟 Product Overview

- **Name**: ScoutSpark
- **Tagline**: *Find your next yes.*
- **Target Audience**: Early-stage B2B founders, founding account executives, and AI engineering hiring managers.
- **Problem**: Early-stage sales teams spend 45+ minutes per account digging through engineering blogs, job descriptions, and GitHub commits to craft one mediocre cold email. Generic AI tools hallucinate citations, spam ungrounded claims, and auto-blast prospects.
- **The ScoutSpark Solution**: 
  1. Define an Ideal Customer Profile (ICP).
  2. Detect public signals (incident retrospectives, tech stack migrations, leadership hires, clinic expansions).
  3. Strictly separate **observed facts** from **AI hypotheses** with full provenance.
  4. Draft hyper-personalized cold outreach emails.
  5. Enforce **human review and approval**—the first version never auto-dispatches outbound emails.
  6. Track progression across an 8-stage acquisition pipeline with persistent SQLite storage.

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
  - SQLAlchemy 2.x + SQLite (`backend/scoutspark.db`, excluded in `.gitignore`)
  - Transparent deterministic baseline ICP scoring engine (`scoring_service.py`)
  - Idempotent seed script (`seed.py`) preserving user edits
  - Pytest + HTTPX test suite with isolated in-memory test database
  - Uvicorn development server
- **Frontend**:
  - React 19 + TypeScript + Vite
  - Tailwind CSS v4 + Custom Design Tokens (`src/index.css`)
  - Typed API client (`src/services/apiClient.ts` & `src/services/prospectService.ts`)
  - Framer Motion + Pure SVG/CSS Keyframes + `canvas-confetti`
- **Frontend Mode Selection**:
  - **API Mode (Default)**: Automatically connects to `VITE_API_BASE_URL` (default: `http://localhost:8000`). If unavailable, shows an offline connection alert banner with a "Retry Connection" action.
  - **Offline Demo Mode**: Set `VITE_DEMO_MODE=true` in `.env`, or click "Switch to Offline Demo Mode" in the UI banner to run strictly in-memory/localStorage without backend calls.

---

## 📂 Project Structure

```
scoutspark/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py              # App settings & strict CORS configuration
│   │   ├── database.py            # SQLite engine, session & Base
│   │   ├── models.py              # SQLAlchemy models: Prospect, ICP, Activity, Draft
│   │   ├── schemas.py             # Pydantic v2 schemas with camelCase serialization
│   │   ├── seed.py                # Idempotent seed script (8 fictional prospects)
│   │   ├── routers/
│   │   │   ├── health.py          # GET /health
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
│   │   └── test_import.py         # CSV validation & security tests
│   ├── requirements.txt           # Python dependencies
│   └── README.md                  # Backend API documentation
├── src/
│   ├── types/index.ts             # Domain TypeScript interfaces
│   ├── services/
│   │   ├── apiClient.ts           # Typed HTTP client for FastAPI endpoints
│   │   ├── prospectService.ts     # Abstraction supporting API & Demo modes
│   │   └── mockData.ts            # Fallback seed data & illustrative signals
│   ├── components/
│   │   ├── ScoutMascot.tsx        # 4-point star SVG creature with expressions
│   │   ├── Navbar.tsx             # Brand header, demo badge, navigation & CTA
│   │   ├── GuidedDiscoveryModal.tsx # 4-step interactive research runner
│   │   └── ProspectDetailDrawer.tsx # Intelligence dossier & email approval
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

# 2. Run automated backend test suite
.\.venv\Scripts\python.exe -m pytest backend\tests -v

# 3. Start FastAPI server
.\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API is live at: [http://localhost:8000/](http://localhost:8000/)
- Interactive Swagger documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health check: [http://localhost:8000/health](http://localhost:8000/health)

### Terminal 2 — Frontend (Vite + React)
```powershell
# 1. Install frontend dependencies (if not already installed)
npm install

# 2. Start Vite development server
npm run dev
```
- Web Application is live at: [http://localhost:5173/](http://localhost:5173/)

---

## 🧪 Tests & Build Commands Actually Run

1. **Backend Automated Tests (Pytest)**:
   ```powershell
   .\.venv\Scripts\python.exe -m pytest backend\tests -v
   ```
   **Result**: `29 passed in 0.71s` (100% pass rate across health, seed idempotency, prospects CRUD, stage/outcome updates, ICP persistence, outreach drafts, deterministic scoring, and CSV import validation).
2. **Frontend Type Check & Production Bundle**:
   ```powershell
   npm run build
   ```
   **Result**: `tsc && vite build` built cleanly in 291ms with zero errors.
3. **End-to-End Browser Verification**:
   - Verified footer indicates `SQLite Backend: Connected`.
   - Verified that editing outreach draft copy on KiteMetrics, saving changes, and clicking human approval persists into SQLite.
   - Verified that after full browser page refresh, KiteMetrics remains in `Approved` stage.
   - Verified CSV import modal download and modal dismissal.
   - Verified ICP Settings update persists across browser refreshes.

---

## ⚖️ Simulated vs. Implemented Disclosures

- **Data Origin**: All company records (`KiteMetrics`, `AuraPulse Health`, etc.), executive names, and incident quotes are fictional seed records stored in SQLite for user experience demonstration.
- **Search & Signals**: Signal detection and research extraction are simulated deterministically via local state to demonstrate the UX. No live web scrapers or third-party CRM credentials are connected.
- **Email Delivery**: ScoutSpark produces copyable drafts and approval records. It **never** connects to an SMTP server, CRM, or email provider to send automatic outbound emails.
- **Evaluation Benchmarks**: All scores in the Evaluation Lab are illustrative demo metrics designed to showcase the future evaluation methodology.
- **Recommended Next Task (Stage 3)**: Replace the simulated 4-step research steps in the Guided Discovery Modal with real LLM provider integration (via a pluggable provider abstraction, structured outputs, and environment-based API secrets) while preserving the verified facts vs hypotheses separation and human-in-the-loop guarantee.
