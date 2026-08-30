# MineRakshak AI
> **Smart Compliance, AI-Powered Incident Detection & Governance Platform for Coal Mines**

MineRakshak AI is an end-to-end statutory compliance, digital safety inspection, and AI hazard remediation platform designed for opencast and underground coal mining operations in alignment with Directorate General of Mines Safety (DGMS) regulatory standards.

---

## 📌 What is MineRakshak AI?

In coal mining operations, safety is governed by strict statutory guidelines (under the *Mines Act, 1952* and *Coal Mines Regulations, 2017*). Traditional safety inspections and hazard reporting rely on slow, paper-based logbooks. When a critical hazard is discovered on-site (such as a highwall tension crack or a conveyor trip-switch defect), it often takes days for work orders to reach the responsible maintenance contractor.

**MineRakshak AI automates and accelerates this entire safety lifecycle:**
1. **AI Hazard Vision**: A Mine Official captures a photo of a defect on-site. The AI computer vision engine instantly identifies the hazard, classifies severity, calculates an explainable AI Risk Score (0–100), and automatically computes a statutory fix deadline.
2. **Instant Dual Dispatch**: In a single click, the platform creates a tracked work order and dispatches notifications to both the **Responsible Contractor/Vendor Company** (with the mandatory fix deadline) and the on-ground **Field Inspector** (for physical verification).
3. **Enterprise Governance**: Corporate Management (The Mining Company HQ) monitors real-time multi-mine risk benchmarks, contractor remediation deadlines, and exports statutory compliance reports.

---

## 🚀 Key Features & Innovations

- **AI Computer Vision Hazard Analysis**: Evaluates visual defect features across 5 major mine hazard categories: Mechanical/Conveyor, Geotechnical/Slope Stability, Heavy Machinery (HEMM), Haul Road Safety Berms, and Environmental Dust Suppression.
- **Auto-Calculated Statutory Deadlines**: Dynamically calculates remediation timelines based on DGMS severity guidelines (e.g. 24 Hours for Critical stop-work defects, 48 Hours for High equipment risks, 5–7 Days for Medium maintenance).
- **Role-Based Access Control (RBAC)**: 4 segregated user roles (Field Officer, Mine Official, Corporate Management, System Administrator).
- **Multi-Mine Risk Benchmarking**: Real-time comparative safety telemetry across all operational pits and subsidiaries.
- **Immutable DGMS Audit Trail**: Tamper-proof logging of all incident creation, status transitions, review sign-offs, and administrative changes.
- **1-Click Executive Report Export**: Instant `.csv` summary generator for board presentations and regulatory audits.

---

## 👥 User Roles & Operational Workflows

| Role | Who They Are | Key Responsibilities |
| :--- | :--- | :--- |
| **Field Officer** | Ground Safety Inspector | Conducts scheduled audits, records digital observations, uploads multi-evidence proofs (photos/videos/PDFs), and verifies contractor fixes. |
| **Mine Official** | Mine Agent / Pit Manager | Captures on-site hazards with AI Vision, reviews submitted field inspections, auto-dispatches contractor work orders, and signs off on verified fixes. |
| **Corporate Management** | Mining Company HQ | Executive oversight across all mines, monitors contractor fix deadlines, tracks fleet-wide risk indices, and exports compliance reports. |
| **System Administrator** | IT & Governance Officer | Manages platform user credentials, maintains mine facility directories, and monitors the immutable system audit trail. |

---

## 🔄 End-to-End Incident Lifecycle

```
[1. Incident Spotted on Ground]
                  │
                  ▼
[2. AI Vision Analysis & Auto-Deadline]
  ├── Classifies Defect Category & Severity
  ├── Computes AI Risk Index (0-100)
  ├── Calculates Statutory Remediation Deadline
  └── Suggests Actionable Fix Procedures
                  │
                  ▼
[3. 1-Click Multi-Party Dispatch]
  ├── Field Officer: On-site inspection & verification task
  ├── Responsible Contractor Company: Mandatory fix work order with deadline
  └── System Admin: Immutable event recorded to system audit trail
                  │
                  ▼
[4. Contractor Completes Fix & Inspector Uploads Photo Proof]
                  │
                  ▼
[5. Mine Official Reviews Proof & Clicks "Verify & Close"]
                  │
                  ▼
[6. Corporate HQ Sees Risk Score Drop & Compliance Record Updated]
```

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Next.js / Vite, TailwindCSS, React Router, Firebase Client SDK
- **Backend API**: Node.js, Express, Firebase Admin SDK (with resilient zero-config fallback store)
- **AI Microservice**: Python 3.10+, FastAPI, Uvicorn, Rule-Based & Statistical Risk Scoring
- **Cloud Database & Storage**: Google Firebase (Authentication, Cloud Firestore, Firebase Storage)
- **Tooling & Orchestration**: Concurrently, PowerShell & Batch 1-click launchers, Docker Compose

---

## 📁 Project Structure

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
├── frontend/                  # React / Next.js Web Application
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

## ⚡ Quick Start & Setup Guide

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher)
- **Python** (v3.10 or higher)
- **Git**

### 2. Clone the Repository
```bash
git clone https://github.com/omrahatal14-sketch/MineRakshak-AI.git
cd MineRakshak-AI
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory (or copy from `.env.example`):
```ini
# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_BASE_URL=http://localhost:4000/api

# Service Ports
PORT=4000
AI_SERVICE_URL=http://localhost:8000
CORS_ORIGIN=http://localhost:5173
```

### 4. Install Dependencies
```bash
# Root launcher dependencies
npm install

# Backend dependencies
cd backend && npm install && cd ..

# Frontend dependencies
cd frontend && npm install && cd ..

# AI Service dependencies
cd ai-service && pip install -r requirements.txt && cd ..
```

### 5. Run the Application
Start all three services concurrently with a single command:
```bash
npm run dev
```
*(Or double-click `start.bat` on Windows)*

---

## 🔑 Demo Accounts for Testing

All demo accounts share the password: `MineRakshak@123`

| Role | Email | Key Capabilities to Test |
| :--- | :--- | :--- |
| **Field Officer** | `inspector1@minerakshak.demo` | Conduct assigned inspections, upload photo evidence, submit rectification proofs. |
| **Mine Official** | `official1@minerakshak.demo` | Capture incidents with AI Vision, auto-dispatch to contractor, review findings. |
| **Corporate HQ** | `corporate@minerakshak.demo` | Multi-mine risk benchmarks, contractor fix deadlines, 1-click CSV report export. |
| **System Admin** | `admin@minerakshak.demo` | Manage user credentials, mine facility directory, immutable system audit logs. |

---

## 📡 Core API Endpoints

### AI Hazard Vision & Incidents
- `POST /api/incidents/ai-analyze` — Analyze incident photo, classify defect, compute risk score & deadline.
- `POST /api/incidents/dispatch` — Auto-dispatch corrective action work order to inspector & contractor.

### Inspections & Observations
- `GET /api/inspections` — List inspections (filtered by role and mine).
- `POST /api/inspections` — Schedule a new statutory audit.
- `PUT /api/inspections/:id/submit` — Submit completed field inspection for official review.
- `PUT /api/inspections/:id/review` — Mine official review and statutory sign-off.

### Corrective Actions
- `GET /api/corrective-actions` — List actions with deadlines, priorities, and assigned companies.
- `PUT /api/corrective-actions/:id/resolve` — Submit rectification description and proof photos.
- `PUT /api/corrective-actions/:id/verify` — Management verification and final closure.

### Corporate & Audit Logs
- `GET /api/dashboard/corporate` — Multi-mine compliance benchmarks and risk telemetry.
- `GET /api/reports/summary` — Statutory compliance summary data for export.
- `GET /api/audit-logs` — Immutable platform audit trail stream.

---

## 📄 License

This project is developed for educational, industrial compliance, and safety governance in coal mining operations.
