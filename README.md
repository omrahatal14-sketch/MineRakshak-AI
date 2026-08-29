# MineRakshak AI
> **Smart Compliance & AI-Powered Governance Platform for Coal Mines**

MineRakshak AI is an end-to-end statutory compliance, digital inspection, and AI hazard remediation platform designed for opencast and underground coal mining operations in alignment with Directorate General of Mines Safety (DGMS) regulatory standards.

---

## Key Capabilities

- **AI Incident Computer Vision**: Mine officials capture on-site hazard photos. The AI computer vision engine automatically classifies defects (mechanical, structural, geotechnical, environmental, transport), assesses severity, evaluates statutory risk indices (0-100), and calculates mandatory fix deadlines (e.g., 24h, 48h, 7 days).
- **Automated Dual Dispatch**: Instantly dispatches photographic remediation work orders to both the responsible vendor/contractor company and the assigned field inspector for on-site verification.
- **Role-Based Access Control (RBAC)**: Segregated operational workflows for 4 distinct user roles: Field Officer, Mine Official, Corporate Management, and System Administrator.
- **Multi-Mine Risk Analytics**: Corporate dashboard with multi-mine risk benchmarking, compliance trend telemetry, and 1-click executive CSV export.
- **Immutable Audit Trail**: Comprehensive logging of inspections, hazard creation, status transitions, review sign-offs, and administrative changes.

---

## User Roles & Operational Workflows

| Role | Core Responsibilities | Key Features |
| :--- | :--- | :--- |
| **Field Officer** | Ground inspections & observation recording | Assigned audits list, draft/submit workflow, multi-evidence uploads (photos, videos, PDFs), rectification proof submission. |
| **Mine Official** | Operations review & hazard governance | Submission review queue, AI computer vision incident camera, corrective action creation, contractor verification & sign-off. |
| **Corporate Management** | Multi-mine intelligence & executive oversight | Fleet-wide risk benchmarking, contractor deadline monitoring, monthly compliance trends, CSV report generation. |
| **System Administrator** | User governance, mine directories & audit logs | User CRUD & role assignment, mine facility management, real-time immutable audit trail stream. |

---

## AI Vision & Multi-Party Dispatch Flow

```
[Mine Official snaps hazard picture]
                  │
                  ▼
[AI Computer Vision Engine]
  ├── Classifies Defect Category & Severity
  ├── Computes AI Risk Index (0-100)
  ├── Calculates Statutory Remediation Deadline
  └── Suggests Actionable Fix Procedures
                  │
                  ▼
[1-Click Auto-Dispatch]
  ├── Field Officer: On-site inspection & verification task
  ├── Responsible Company / Vendor: Mandatory fix work order with deadline
  └── System Admin: Immutable event recorded to system audit trail
```

---

## Technology Stack

- **Frontend**: React 18, Vite, TailwindCSS, React Router 6, Firebase Client SDK
- **Backend API**: Node.js, Express, Firebase Admin SDK (with zero-config resilient fallback store)
- **AI Microservice**: Python 3.10+, FastAPI, Uvicorn, Rule-Based & Statistical Risk Scoring
- **Cloud & Storage**: Google Firebase (Authentication, Firestore Database, Firebase Storage)
- **Tooling & Orchestration**: Concurrently, PowerShell & Batch 1-click launchers, Docker Compose

---

## Project Structure

```
MineRakshak-AI/
├── ai-service/                # Python FastAPI AI Vision & Risk Scoring Service
│   ├── app/
│   │   ├── image_analysis.py  # Computer vision hazard identification & auto-deadlines
│   │   ├── risk_scoring.py    # Multi-factor mine risk calculation
│   │   ├── anomaly_detection.py# Statistical anomaly detector
│   │   └── main.py            # FastAPI endpoints
│   └── requirements.txt
├── backend/                   # Node.js Express REST API
│   ├── src/
│   │   ├── config/            # Firebase Admin & environment config
│   │   ├── middleware/        # JWT auth & RBAC validation
│   │   ├── modules/           # Auth, Inspections, Incidents, Actions, Dashboard, Admin
│   │   └── services/          # Vision bridge, Audit logger, Risk client
│   └── package.json
├── frontend/                  # React Vite Single Page Application
│   ├── src/
│   │   ├── components/        # AppShell, AI Incident Modal, Status Badges
│   │   ├── context/           # AuthContext (Role inference & token auto-refresh)
│   │   ├── pages/             # Field Officer, Mine Official, Corporate, Admin Dashboards
│   │   └── services/          # API, Storage, Incident, Inspection services
│   └── package.json
├── docs/                      # Technical documentation & data models
├── start.bat                  # 1-Click launcher for Windows Command Prompt
├── start.ps1                  # 1-Click launcher for Windows PowerShell
├── docker-compose.yml         # Containerized full-stack deployment
└── package.json               # Root orchestrator with concurrently
```

---

## Quick Start Guide

### Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)
- **npm** (v9 or higher)

### 1. Clone the Repository

```bash
git clone https://github.com/omrahatal14-sketch/MineRakshak-AI.git
cd MineRakshak-AI
```

### 2. Install Dependencies

```bash
# Root orchestrator dependencies
npm install

# Frontend dependencies
cd frontend && npm install && cd ..

# Backend dependencies
cd backend && npm install && cd ..

# AI Service dependencies
cd ai-service && pip install -r requirements.txt && cd ..
```

### 3. Configure Environment Variables

Create `.env` in the root directory (or copy from `.env.example`):

```ini
# Firebase Config
FIREBASE_PROJECT_ID=minerakshak-ai
VITE_FIREBASE_API_KEY=AIzaSyBZFLg73TEZUHoMloLJ_Q0FN81aqAsOwHA
VITE_FIREBASE_AUTH_DOMAIN=minerakshak-ai.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=minerakshak-ai
VITE_FIREBASE_STORAGE_BUCKET=minerakshak-ai.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=846866429131
VITE_FIREBASE_APP_ID=1:846866429131:web:1e83863b25d84cf4b1574e
VITE_API_BASE_URL=http://localhost:4000/api

# Ports
PORT=4000
AI_SERVICE_URL=http://localhost:8000
CORS_ORIGIN=http://localhost:5173
```

---

## Running the Application

### Option A: Single Command (Recommended)
Run all 3 services concurrently in a single terminal:

```bash
npm run dev
```

### Option B: 1-Click Windows Script
- Double-click **`start.bat`** (or run `.\start.ps1` in PowerShell).

### Service URLs

- **Frontend Web App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:4000/health](http://localhost:4000/health)
- **AI Service API**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Demo Accounts

All demo accounts share the password: `MineRakshak@123`

| Role | Email | Permissions |
| :--- | :--- | :--- |
| **Field Officer** | `inspector1@minerakshak.demo` | Conduct assigned audits, record observations, upload evidence. |
| **Mine Official** | `official1@minerakshak.demo` | Review submissions, AI incident capture, dispatch actions. |
| **Corporate HQ** | `corporate@minerakshak.demo` | Multi-mine risk benchmarks, compliance tracking, CSV export. |
| **System Admin** | `admin@minerakshak.demo` | User CRUD, mine facility directory, immutable audit logs. |

---

## Core API Endpoints

### AI Hazard Vision & Incidents
- `POST /api/incidents/ai-analyze` — Analyze incident image, identify defect, set fix deadline.
- `POST /api/incidents/dispatch` — Auto-dispatch corrective action to inspector & contractor.

### Inspections & Observations
- `GET /api/inspections` — List inspections (filtered by role and mine).
- `POST /api/inspections` — Schedule statutory inspection.
- `PUT /api/inspections/:id/submit` — Submit completed inspection for official review.
- `PUT /api/inspections/:id/review` — Official review and statutory sign-off.

### Corrective Actions
- `GET /api/corrective-actions` — List actions with deadlines and assignees.
- `PUT /api/corrective-actions/:id/resolve` — Submit rectification proof photos.
- `PUT /api/corrective-actions/:id/verify` — Management verification and closure.

### Corporate & Governance
- `GET /api/dashboard/corporate` — Multi-mine compliance benchmarks and risk index.
- `GET /api/reports/summary` — Statutory compliance summary for export.
- `GET /api/audit-logs` — Immutable platform audit trail stream.

---

## License

This project is developed for educational and industrial compliance governance in coal mining operations.
