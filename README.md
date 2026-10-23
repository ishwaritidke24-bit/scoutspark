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
  6. Track progression across an 8-stage acquisition pipeline.

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
   - Real-time pipeline stage count badges.
   - Priority prospect shortlist with 1-click dossier inspection.
   - Today's research signal feed and recent outbound action audit log.

2. **Find Prospects**:
   - Multi-parameter filtering (by Industry, Pipeline Stage, and minimum Fit Score slider).
   - Real-time search query matching company names, buyer titles, and tech tags.
   - Dual-view toggle: High-craft **Grid Cards** vs. Dense **Table View**.
   - Visual fit score badges (e.g. 96% exceptional, 92%, 88%, 78%, 42%).
   - Verified facts count vs. hypothesis flags on every account.

3. **Prospect Detail Dossier (Slide-over Drawer)**:
   - Fit score gauge and ICP compatibility breakdown.
   - **Observed Facts**: Verifiable public data with dates and sources.
   - **AI Hypotheses**: Quarantined reasoning steps with confidence levels (`high`, `medium`, `speculative`).
   - **Missing Information & Uncertainty Flags**: Prevents overconfidence on unknown variables (e.g., cloud bills, internal procurement policies).
   - **Outreach Studio**: Target buyer persona, synthesized angle (Hook, Value Prop, CTA), editable email draft, word count, copy-to-clipboard, and the celebratory **"Approve Draft for Founder Outbound"** button.

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
   - LocalStorage persistence with 1-click factory reset.

---

## 🛠️ Technology Stack & Architecture

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Custom Design Tokens (`index.css`)
- **Icons**: `lucide-react`
- **Animations & Delight**: Framer Motion + Pure SVG/CSS Keyframes + `canvas-confetti`
- **Architecture Pattern**:
  - Clean separation between UI components and the typed data layer.
  - `src/types/index.ts`: Strongly-typed domain models (`Prospect`, `IdealCustomerProfile`, `ResearchSignal`, `EvaluationMetric`).
  - `src/services/prospectService.ts`: Decoupled service layer storing data in `localStorage` with async Promise interfaces. Easily swappable for a backend REST/FastAPI API without modifying UI components.
  - `src/services/mockData.ts`: 8 internally consistent fictional B2B companies across Developer Tools, HealthTech, Fintech, AI Operations, Logistics, HR Tech, and Cybersecurity.

---

## 📂 Project Structure

```
scoutspark/
├── index.html                     # HTML shell, favicon & Google Fonts
├── package.json                   # Dependencies & npm scripts
├── tsconfig.json                  # TypeScript compiler settings
├── vite.config.ts                 # Vite bundler configuration
├── src/
│   ├── types/
│   │   └── index.ts               # Core TypeScript domain types
│   ├── services/
│   │   ├── mockData.ts            # Seed accounts, signals, eval metrics
│   │   └── prospectService.ts     # Typed service layer with LocalStorage
│   ├── components/
│   │   ├── ScoutMascot.tsx        # 4-point star SVG creature with expressions
│   │   ├── Navbar.tsx             # Brand header, demo badge, navigation & CTA
│   │   ├── GuidedDiscoveryModal.tsx # 4-step interactive research runner
│   │   └── ProspectDetailDrawer.tsx # Intelligence dossier & email approval
│   ├── views/
│   │   ├── OverviewView.tsx       # Welcome dashboard, shortlist & signals
│   │   ├── ProspectsView.tsx      # Filtering, search, cards & table
│   │   ├── PipelineView.tsx       # 8-stage visual acquisition board
│   │   ├── CampaignStudioView.tsx # Multi-touch sequence reviewer
│   │   ├── EvaluationLabView.tsx  # Factual grounding & precision benchmarks
│   │   └── SettingsView.tsx       # Editable ICP parameters & exclusions
│   ├── index.css                  # Color tokens, typography, tactile utilities
│   ├── App.tsx                    # Root state coordinator
│   └── main.tsx                   # React root entry point
└── README.md                      # Documentation & run instructions
```

---

## 💻 Setup & Run Instructions

### Prerequisites
- Node.js (v18+ or v22+)
- npm (v9+)

### Installation
```bash
npm install
```

### Run Locally in Development Mode
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your web browser.

### Build for Production
```bash
npm run build
```

---

## ⚖️ Simulated vs. Implemented Disclosures

- **Data Origin**: All company records (`KiteMetrics`, `AuraPulse Health`, etc.), executive names, and incident quotes are fictional seed records created for user experience demonstration.
- **Search & Signals**: Signal detection and research extraction are simulated deterministically via local state to demonstrate the UX. No live web scrapers or third-party CRM credentials are connected.
- **Email Delivery**: ScoutSpark produces copyable drafts and approval records. It **never** connects to an SMTP server, CRM, or email provider to send automatic outbound emails.
- **Evaluation Benchmarks**: All scores in the Evaluation Lab are illustrative demo metrics designed to showcase the future evaluation methodology.
