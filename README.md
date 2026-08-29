# MineRakshak AI

AI-based Smart Governance and Compliance Monitoring Platform for Coal Mines — SIH prototype.

## Architecture

```
minerakshak-ai/
├── frontend/     React + Tailwind + Vite           (role-based dashboards)
├── backend/      Node.js + Express + Firebase Admin (REST API, RBAC, Firestore access)
├── ai-service/   Python + FastAPI + Scikit-learn    (risk scoring, anomaly detection)
├── firebase/     Firestore rules, indexes, seed data
└── docs/         Architecture & Data Model specifications
```

**Database: Cloud Firestore** (via Firebase). Auth: **Firebase Authentication**, with role
stored as a custom claim on each user and mirrored into a `users` Firestore document.

## Prerequisites

- Node.js 18+
- Python 3.11+
- A Firebase project (free Spark plan is enough for the prototype) — create one at
  https://console.firebase.google.com, enable **Authentication (Email/Password)** and
  **Firestore Database**.
- Firebase CLI: `npm install -g firebase-tools`

## 1. Firebase project setup

```bash
cd firebase
firebase login
firebase use --add          # select your Firebase project
firebase deploy --only firestore:rules,firestore:indexes
```

Download a **service account key** (Project Settings → Service Accounts → Generate new
private key) and save it as `firebase/service-account.json` (git-ignored — see
`.env.example` for the path variable).

## 2. Environment variables

```bash
cp .env.example .env
# fill in your Firebase project config (frontend) and service account path (backend/ai-service)
```

## 3. Seed synthetic demo data

```bash
cd firebase/seed
npm install
npm run seed
```

This creates a handful of mines, one user per role, and several months of synthetic
inspections/observations/violations/corrective actions so every dashboard has data to show
on first run. Seeded login credentials are printed at the end of the script.

## 4. Run everything

```bash
docker compose up --build
```

Or run each service manually:

```bash
# backend
cd backend
npm install
npm run dev      # http://localhost:4000

# ai-service
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000  # http://localhost:8000

# frontend
cd frontend
npm install
npm run dev     # http://localhost:5173
```

## Project status

This repo is structured for modular expansion.
- **Frontend**: Role-based access and dashboards (Field Officer, Mine Official, Corporate Management, System Admin).
- **Backend**: Modular Express REST API with unified Firebase authentication and RBAC middleware.
- **AI Service**: FastAPI service providing risk scoring, Isolation Forest anomaly detection, and inspection prioritization.
- **Firebase**: Centralized Firestore security rules, composite indexes, and demo data seeder.
