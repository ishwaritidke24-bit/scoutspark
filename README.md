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
GEMINI_MODEL=gemini-3.1-flash-lite
TAVILY_API_KEY=
SCOUTSPARK_RESEARCH_MODE=demo

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
& { $env:PYTHONPATH='.'; .\.venv\Scripts\python.exe -m pytest backend/tests -v }
npm run build
Run these commands on your current checkout to verify its status.

# Safety and limitations
- Live research depends on provider access, quotas, and available public information.
- A source URL or search snippet does not automatically prove every claim.
- Unknown company details and buyer information should stay marked as unknown.
- Demo records are fictional sample data, not live findings.
- Fit scores and controlled test cases do not prove real-world accuracy or sales growth.
- Outreach drafts require human review; no emails are sent automatically.
- Keep backend/.env, API keys, and local database files out of version control.

ScoutSpark — Find businesses. See why they fit. Write better messages.