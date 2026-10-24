# ScoutSpark ✦ Find your next yes.
Stop guessing. Let's find your next customer.

ScoutSpark is an AI-powered B2B research tool. It searches public web sources for businesses that may need a product, explains why they might fit, and prepares outreach messages for a person to review.
Human review comes first. ScoutSpark does not send emails automatically.

# Features
- Search public web sources for potential customers.
- Use editable target customer profiles and product-specific settings.
- Show source-backed details, unconfirmed guesses, and missing information separately.
- Score company fit using clear rules and flag possible competitors.
- Draft and edit outreach messages, then track prospects in a pipeline.
- Save prospects, settings, drafts, and activity in SQLite.
- Import prospect lists from CSV and use a clearly labelled demo mode.

# How it works
1. Choose a target customer profile.
2. Search public sources with Tavily.
3. Use Gemini and LangGraph to organize and review the results.
4. Check source references and score company fit using rules.
5. Review the findings and edit the outreach draft.
A fit score is an estimate, not proof that a company will buy. Review source links before relying on a claim.

# Tech stack
- Frontend: React, TypeScript, Vite
- Backend: Python, FastAPI, Pydantic
- AI workflow: LangGraph, Google Gemini API
- Web search: Tavily Search API
- Storage: SQLite, SQLAlchemy
- Testing: Pytest, TypeScript and Vite build checks

# Run locally
- Requirements
Install Node.js/npm and Python 3.11 or newer.
1. Install frontend packages
npm install
2. Set up the backend
Windows PowerShell:
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
Copy-Item backend/.env.example backend/.env

Open backend/.env and add your own provider keys for live research:
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
TAVILY_API_KEY=
SCOUTSPARK_RESEARCH_MODE=live

Use demo for the sample workflow or live for real public-web searches. Check that the selected Gemini model is available to your account. Never put secret API keys in frontend environment variables or commit them to GitHub.
3. Start the app
Open two terminals in the project folder.

Terminal 1 — Backend:
.\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
Terminal 2 — Frontend:
npm run dev
Open the URL printed by Vite, usually http://localhost:5173. Backend API docs are at http://localhost:8000/docs.

# Tests
Windows PowerShell:
.\.venv\Scripts\python.exe -m pytest -v
npm run build
Run these commands on your current checkout to verify its status.

# Production Deployment

### 1. Backend Deployment (Render)
1. In your [Render Dashboard](https://dashboard.render.com/), click **New** > **Web Service**.
2. Connect your GitHub repository (`scoutspark`, branch `main`).
3. Set the following service configuration:
   - **Name:** `scoutspark-backend`
   - **Environment:** `Python 3`
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path:** `/health`
4. Configure Environment Variables in Render:
   - `PYTHON_VERSION`: `3.12.0`
   - `SCOUTSPARK_RESEARCH_MODE`: `live`
   - `GEMINI_MODEL`: `gemini-2.5-flash`
   - `GEMINI_API_KEY`: *(Your private Google AI Studio API key)*
   - `TAVILY_API_KEY`: *(Your private Tavily Search API key)*
   - `CORS_ORIGINS`: `https://your-scoutspark-app.vercel.app` *(update once your Vercel URL is known)*
   - `DATABASE_URL`: *(Recommended: Your managed PostgreSQL connection URL, or see Data Persistence below)*

*(Alternatively, use Render Blueprints with the provided `render.yaml` in the repo root).*

### 2. Frontend Deployment (Vercel)
1. In your [Vercel Dashboard](https://vercel.com/), click **Add New Project** and import the `scoutspark` GitHub repository.
2. Set the project configuration:
   - **Framework Preset:** Vite
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://scoutspark-backend.onrender.com` *(your deployed Render backend URL, without a trailing slash)*
4. Click **Deploy**. Vercel will build the frontend with `vercel.json` handling SPA client routing.
5. Once your Vercel deployment completes, copy your Vercel domain (e.g. `https://scoutspark.vercel.app`) and ensure it is included in Render's `CORS_ORIGINS` environment variable.

### 3. Data Persistence & Storage Setup
Render's web service filesystem is ephemeral — any files written to local disk (such as `scoutspark.db`) are wiped whenever the service redeploys or restarts. To ensure your discovered leads, target customer profiles, and outreach drafts persist permanently across server restarts:

- **Option A (Recommended): Managed PostgreSQL Database**
  - Create a PostgreSQL database on Render, Supabase, Neon, or Railway.
  - Set `DATABASE_URL=postgresql://user:password@host:port/dbname` in Render Web Service environment variables.
  - ScoutSpark automatically handles table creation and schema initialization on startup.
- **Option B: Render Persistent Disk (Starter plan and above)**
  - Add a Disk mounted at `/var/data` (size: 1GB+).
  - Set `DATABASE_URL=sqlite:////var/data/scoutspark.db`.
- **Option C: Ephemeral SQLite (Zero-cost hobby)**
  - If no `DATABASE_URL` is set, ScoutSpark runs with default SQLite. Seeding runs idempotently on start, but records created during runtime reset when Render deploys a new container.

### 4. End-to-End Verification Checklist
1. Visit `https://<your-backend>.onrender.com/health` to confirm the backend returns `{"status":"ok","database":"connected",...}`.
2. Open your Vercel URL (`https://<your-frontend>.vercel.app`).
3. Check the connection pill in the navbar — it should show `Connected` to your Render API.
4. Go to **Settings**, modify your ICP or select a preset, and click **Save Target Customer Settings**.
5. Click **Find My Next…** to open Guided Discovery, enter an ideal customer keyword, and click **Search for Leads**.
6. Verify live leads are discovered, scored against your ICP, and saved to your pipeline.

# Safety and limitations
- Live research depends on provider access, quotas, and available public information.
- A source URL or search snippet does not automatically prove every claim.
- Unknown company details and buyer information should stay marked as unknown.
- Demo records are fictional sample data, not live findings.
- Fit scores and controlled test cases do not prove real-world accuracy or sales growth.
- Outreach drafts require human review; no emails are sent automatically.
- Keep backend/.env, API keys, and local database files out of version control.

ScoutSpark — Find businesses. See why they fit. Write better messages.