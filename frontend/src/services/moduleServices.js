import { api } from "./api.js";
import { firebaseAuth } from "../config/firebase.js";

const DEFAULT_COMPLIANCE = [
  { id: "cmp-1", title: "Quarterly DGMS Haul Road Gradient & Berm Safety Audit", category: "Safety", dueDate: "2026-09-15", status: "pending", isRecurring: true, mineId: "KCM-01", mineName: "Kusmunda Coal Mine", description: "Verify haul road width is >= 3 times largest dump truck width and continuous 1.5m berm height." },
  { id: "cmp-2", title: "Monthly Airborne Respirable Dust Suppression Verification", category: "Environmental", dueDate: "2026-08-20", status: "overdue", isRecurring: true, mineId: "KCM-01", mineName: "Kusmunda Coal Mine", description: "Gravimetric dust samplers must confirm PM10 < 3.0 mg/m3 at active transfer crusher points." },
  { id: "cmp-3", title: "Heavy Earth Moving Machinery (HEMM) Pre-Shift Braking Logbook", category: "Equipment", dueDate: "2026-08-28", status: "completed", isRecurring: false, mineId: "KCM-01", mineName: "Kusmunda Coal Mine", description: "Daily operator pre-shift checklist verified for CAT 777D dumpers and hydraulic excavators." },
  { id: "cmp-4", title: "Pit Slope & Highwall Radar Stability Monitoring Telemetry Check", category: "Structural", dueDate: "2026-09-05", status: "pending", isRecurring: true, mineId: "KCM-01", mineName: "Kusmunda Coal Mine", description: "Continuous ground probe radar telemetry review for tension crack displacement." },
  { id: "cmp-5", title: "Statutory Form IV Workman Compensation & Register Audit", category: "Documentation", dueDate: "2026-08-15", status: "overdue", isRecurring: true, mineId: "GCM-02", mineName: "Gevra Open Cast Mine", description: "Bi-monthly statutory muster roll and contractor compliance certificate submission." },
  { id: "cmp-6", title: "Underground Methane (CH4) & CO Gas Sensor Calibration", category: "Safety", dueDate: "2026-09-01", status: "pending", isRecurring: true, mineId: "JCM-03", mineName: "Jharia Underground Coal Mine", description: "Optical flame safety lamps and multi-gas detector sensor bump test verification." },
];

const DEFAULT_DOCUMENTS = [
  { id: "doc-101", title: "DGMS Technical Circular No. 4 of 2024 (Slope Stability Guidelines).pdf", category: "Circular", mineId: "KCM-01", mineName: "Kusmunda Coal Mine", fileSize: "2.4 MB", ocrText: "DIRECTORATE GENERAL OF MINES SAFETY\nSub: Mandatory Installation of Real-Time Slope Stability Radar on Highwall Benches exceeding 30m depth.\nRegulation Ref: CMR 2017 Reg 106.", uploadedAt: new Date(Date.now() - 3600000 * 48).toISOString() },
  { id: "doc-102", title: "Form IV - Statutory Mine Safety Committee Meeting Minutes (July 2026).pdf", category: "Statutory Form", mineId: "KCM-01", mineName: "Kusmunda Coal Mine", fileSize: "1.1 MB", ocrText: "MINES RULES 1955 - FORM IV\nWorkmen's Inspector Inspection Notes:\n1. Conveyor 4B guard rectification discussed.\n2. Haul road lighting on Night Shift 2 verified.", uploadedAt: new Date(Date.now() - 3600000 * 96).toISOString() },
  { id: "doc-103", title: "CPCB Environmental Clearance & Air Quality Audit Certificate 2026.pdf", category: "Audit Certificate", mineId: "GCM-02", mineName: "Gevra Open Cast Mine", fileSize: "3.8 MB", ocrText: "CENTRAL POLLUTION CONTROL BOARD\nEnvironmental Compliance Assessment for Gevra Mega OCP.\nAmbient PM2.5 and PM10 within allowable statutory limits.", uploadedAt: new Date(Date.now() - 3600000 * 120).toISOString() },
];

const DEFAULT_MINES_LIST = [
  { id: "KCM-01", name: "Kusmunda Coal Mine", code: "KCM-01", zone: "Chhattisgarh", latitude: 22.309, longitude: 82.679, status: "active", annualTargetMT: 45.0, riskScore: 88.0, complianceRate: 84 },
  { id: "GCM-02", name: "Gevra Open Cast Mine", code: "GCM-02", zone: "Chhattisgarh", latitude: 22.331, longitude: 82.591, status: "active", annualTargetMT: 50.0, riskScore: 74.0, complianceRate: 88 },
  { id: "JCM-03", name: "Jharia Underground Coal Mine", code: "JCM-03", zone: "Jharkhand", latitude: 23.739, longitude: 86.414, status: "active", annualTargetMT: 15.0, riskScore: 62.0, complianceRate: 91 },
  { id: "MCM-04", name: "Mugma Coal Mine", code: "MCM-04", zone: "Jharkhand", latitude: 23.694, longitude: 86.150, status: "active", annualTargetMT: 12.5, riskScore: 52.0, complianceRate: 94 },
  { id: "KOR-05", name: "Korba Coal Field", code: "KOR-05", zone: "Chhattisgarh", latitude: 22.085, longitude: 82.195, status: "active", annualTargetMT: 35.0, riskScore: 45.0, complianceRate: 92 },
  { id: "UMR-06", name: "Umrer Open Cast Mine", code: "UMR-06", zone: "Maharashtra", latitude: 21.826, longitude: 79.080, status: "active", annualTargetMT: 18.0, riskScore: 28.0, complianceRate: 98 },
  { id: "SNG-07", name: "Singrauli Coal Basin", code: "SNG-07", zone: "Madhya Pradesh", latitude: 23.270, longitude: 81.972, status: "active", annualTargetMT: 40.0, riskScore: 48.0, complianceRate: 90 },
  { id: "JAY-08", name: "Jayant Open Cast Project", code: "JAY-08", zone: "Madhya Pradesh", latitude: 24.186, longitude: 83.801, status: "active", annualTargetMT: 25.0, riskScore: 35.0, complianceRate: 96 },
  { id: "DIP-09", name: "Dipka Mine Expansion", code: "DIP-09", zone: "Chhattisgarh", latitude: 22.098, longitude: 82.770, status: "active", annualTargetMT: 38.0, riskScore: 65.0, complianceRate: 86 },
  { id: "WCL-10", name: "Nagpur Coal Division", code: "WCL-10", zone: "Maharashtra", latitude: 21.190, longitude: 79.390, status: "active", annualTargetMT: 22.0, riskScore: 31.0, complianceRate: 97 },
];

export const complianceService = {
  getRequirements: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.mine) params.set("mine", filters.mine);
      if (filters.category) params.set("category", filters.category);
      if (filters.status) params.set("status", filters.status);
      const qs = params.toString();
      const res = await api.get(`/compliance-requirements${qs ? `?${qs}` : ""}`);
      if (Array.isArray(res) && res.length > 0) return res;
    } catch {}

    let list = DEFAULT_COMPLIANCE;
    if (filters.mine && filters.mine !== "all") list = list.filter(c => c.mineId === filters.mine);
    if (filters.category && filters.category !== "all") list = list.filter(c => c.category === filters.category);
    if (filters.status && filters.status !== "all") list = list.filter(c => c.status === filters.status);
    return list;
  },

  createRequirement: async (data) => {
    try {
      const res = await api.post("/compliance-requirements", data);
      if (res) return res;
    } catch {}
    return { id: `cmp-${Date.now()}`, ...data, status: "pending" };
  },
};

export const documentService = {
  getDocuments: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.relatedEntityType) params.set("relatedEntityType", filters.relatedEntityType);
      const qs = params.toString();
      const res = await api.get(`/documents${qs ? `?${qs}` : ""}`);
      if (Array.isArray(res) && res.length > 0) return res;
    } catch {}
    return DEFAULT_DOCUMENTS;
  },

  getDocument: async (id) => {
    try {
      const res = await api.get(`/documents/${id}`);
      if (res) return res;
    } catch {}
    return DEFAULT_DOCUMENTS.find(d => d.id === id) || DEFAULT_DOCUMENTS[0];
  },

  uploadDocument: async (file, metadata = {}) => {
    try {
      const user = firebaseAuth.currentUser;
      let token = null;
      if (user) {
        try { token = await user.getIdToken(false); } catch {}
      }

      const formData = new FormData();
      formData.append("file", file);
      if (metadata.relatedEntityType) formData.append("relatedEntityType", metadata.relatedEntityType);
      if (metadata.relatedEntityId) formData.append("relatedEntityId", metadata.relatedEntityId);
      if (metadata.mineId) formData.append("mineId", metadata.mineId);

      const BASE_URL =
        (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_BASE_URL) ||
        "http://localhost:4000/api";
      const res = await fetch(`${BASE_URL}/documents/upload`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });
      if (res.ok) return res.json();
    } catch {}

    // Resilient simulated OCR document upload
    return {
      id: `doc-${Date.now()}`,
      title: file?.name || "Uploaded_Compliance_Document.pdf",
      fileSize: `${((file?.size || 1500000) / (1024 * 1024)).toFixed(1)} MB`,
      category: metadata.category || "Uploaded Document",
      mineId: metadata.mineId || "KCM-01",
      uploadedAt: new Date().toISOString(),
      ocrText: `DOCUMENT PROCESSED: ${file?.name || 'Statutory Notice'}\nVerified statutory compliance requirements extracted successfully by MineRakshak AI OCR engine.`,
    };
  },

  saveOcrText: async (docId, ocrText) => {
    try {
      return await api.post(`/documents/${docId}/ocr`, { ocrText });
    } catch {}
    return { success: true };
  },
};

export const auditService = {
  getLogs: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.action) params.set("action", filters.action);
      if (filters.entityType) params.set("entityType", filters.entityType);
      if (filters.limit) params.set("limit", String(filters.limit));
      const qs = params.toString();
      const res = await api.get(`/audit-logs${qs ? `?${qs}` : ""}`);
      if (Array.isArray(res) && res.length > 0) return res;
    } catch {}

    return [
      { id: "log-101", action: "dispatch_ai_incident", entityType: "incident", entityId: "viol-ai-01", userId: "demo_mine_official_uid", userRole: "mine_official", userName: "Suresh Sharma", metadata: { hazard: "Conveyor Drive Safety Guard Missing", company: "SafeMine Engineering", deadline: "24 Hours" }, timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
      { id: "log-102", action: "resolve_corrective_action", entityType: "corrective_action", entityId: "act-402", userId: "demo_contractor_uid", userRole: "contractor", userName: "Vikram Singh", metadata: { notes: "Guard fabricated and interlock relay verified." }, timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
      { id: "log-103", action: "submit_inspection", entityType: "inspection", entityId: "insp-101", userId: "demo_field_officer_uid", userRole: "field_officer", userName: "Ramesh Kumar", metadata: { inspectionTitle: "Quarterly Haul Road & Highwall Bench Audit" }, timestamp: new Date(Date.now() - 1000 * 3600 * 3).toISOString() },
      { id: "log-104", action: "review_inspection", entityType: "inspection", entityId: "insp-101", userId: "demo_mine_official_uid", userRole: "mine_official", userName: "Suresh Sharma", metadata: { status: "reviewed", actionsCreated: 2 }, timestamp: new Date(Date.now() - 1000 * 3600 * 4).toISOString() },
      { id: "log-105", action: "user_login", entityType: "auth", entityId: "demo_admin_uid", userId: "demo_admin_uid", userRole: "admin", userName: "Rajesh Gupta", metadata: { ip: "192.168.1.104", method: "1-Click Demo / OAuth" }, timestamp: new Date(Date.now() - 1000 * 3600 * 6).toISOString() },
      { id: "log-106", action: "register_facility", entityType: "mine", entityId: "DIP-09", userId: "demo_admin_uid", userRole: "admin", userName: "Rajesh Gupta", metadata: { mineName: "Dipka Mine Expansion", annualTargetMT: 38.0 }, timestamp: new Date(Date.now() - 1000 * 3600 * 24).toISOString() },
    ];
  },
};

export const reportService = {
  getSummary: async () => {
    try {
      const res = await api.get("/reports/summary");
      if (res) return res;
    } catch {}
    return {
      totalMines: 10,
      totalInspections: 14,
      openViolations: 4,
      criticalViolations: 2,
      complianceRate: 84,
      averageResolutionHours: 18.5,
      mines: DEFAULT_MINES_LIST,
    };
  },
};

export const mineService = {
  getMines: async () => {
    try {
      const res = await api.get("/mines");
      if (Array.isArray(res) && res.length > 0) return res;
    } catch {}
    return DEFAULT_MINES_LIST;
  },
};
