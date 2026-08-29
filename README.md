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

## Comprehensive Project Setup Guide

Follow this step-by-step guide to set up and run MineRakshak AI locally.

### Step 1: Prerequisites

Ensure the following tools are installed on your machine:
- **Node.js** (v18.0.0 or higher) — [Download Node.js](https://nodejs.org/)
- **Python** (v3.10 or higher) — [Download Python](https://www.python.org/)
- **Git** — [Download Git](https://git-scm.com/)

---

### Step 2: Clone the Repository

```bash
git clone https://github.com/omrahatal14-sketch/MineRakshak-AI.git
cd MineRakshak-AI
```

---

### Step 3: Set Up Firebase (Cloud Backend)

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project (e.g., `minerakshak-ai`).
2. **Enable Authentication**:
   - Navigate to **Authentication** > **Sign-in method**.
   - Enable **Email/Password** authentication.
3. **Enable Firestore Database**:
   - Navigate to **Firestore Database** > **Create database**.
   - Select **Start in test mode** for development.
4. **Enable Firebase Storage**:
   - Navigate to **Storage** > **Get started**.
   - Create a default storage bucket for uploading hazard photos and evidence.
5. **Register a Web App**:
   - In Project Settings > General > Your apps > Click the **Web** (`</>`) icon.
   - Copy your Firebase configuration credentials.

---

### Step 4: Configure Environment Variables

Create a file named `.env` in the root of the project directory (use `.env.example` as a template):

```ini
# Firebase Configuration (Replace with your Firebase project values)
FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_API_BASE_URL=http://localhost:4000/api

# Service Ports
PORT=4000
AI_SERVICE_URL=http://localhost:8000
CORS_ORIGIN=http://localhost:5173
```

---

### Step 5: Install Dependencies

#### 1. Root & Backend Dependencies
```bash
# Install root launcher dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

#### 2. Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

#### 3. Python AI Microservice Dependencies
```bash
cd ai-service
pip install -r requirements.txt
cd ..
```

---

### Step 6: Start the Application

#### Option A: Single Terminal Launcher (Recommended)
Start all three microservices (Frontend, Backend, and AI Service) concurrently with a single command:

```bash
npm run dev
```

#### Option B: 1-Click Windows Launcher
- On Windows Command Prompt: Double-click **`start.bat`**
- On Windows PowerShell: Run **`.\start.ps1`**

---

### Step 7: Access the System

Once running, access the services in your browser:

- **Frontend Web Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API Health Check**: [http://localhost:4000/health](http://localhost:4000/health)
- **AI Service OpenAPI Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

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
