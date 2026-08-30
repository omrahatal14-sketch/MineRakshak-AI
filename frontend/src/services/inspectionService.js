import { api } from "./api.js";

const DEFAULT_MINES = [
  { id: "KCM-01", name: "Kusmunda Coal Mine", code: "KCM-01", zone: "Chhattisgarh", latitude: 22.309, longitude: 82.679, status: "active", annualTargetMT: 45.0 },
  { id: "GCM-02", name: "Gevra Open Cast Mine", code: "GCM-02", zone: "Chhattisgarh", latitude: 22.331, longitude: 82.591, status: "active", annualTargetMT: 50.0 },
  { id: "JCM-03", name: "Jharia Underground Coal Mine", code: "JCM-03", zone: "Jharkhand", latitude: 23.739, longitude: 86.414, status: "active", annualTargetMT: 15.0 },
  { id: "MCM-04", name: "Mugma Coal Mine", code: "MCM-04", zone: "Jharkhand", latitude: 23.694, longitude: 86.150, status: "active", annualTargetMT: 12.5 },
  { id: "KOR-05", name: "Korba Coal Field", code: "KOR-05", zone: "Chhattisgarh", latitude: 22.085, longitude: 82.195, status: "active", annualTargetMT: 35.0 },
  { id: "UMR-06", name: "Umrer Open Cast Mine", code: "UMR-06", zone: "Maharashtra", latitude: 21.826, longitude: 79.080, status: "active", annualTargetMT: 18.0 },
  { id: "SNG-07", name: "Singrauli Coal Basin", code: "SNG-07", zone: "Madhya Pradesh", latitude: 23.270, longitude: 81.972, status: "active", annualTargetMT: 40.0 },
  { id: "JAY-08", name: "Jayant Open Cast Project", code: "JAY-08", zone: "Madhya Pradesh", latitude: 24.186, longitude: 83.801, status: "active", annualTargetMT: 25.0 },
  { id: "DIP-09", name: "Dipka Mine Expansion", code: "DIP-09", zone: "Chhattisgarh", latitude: 22.098, longitude: 82.770, status: "active", annualTargetMT: 38.0 },
  { id: "WCL-10", name: "Nagpur Coal Division", code: "WCL-10", zone: "Maharashtra", latitude: 21.190, longitude: 79.390, status: "active", annualTargetMT: 22.0 },
];

const DEFAULT_INSPECTORS = [
  { uid: "demo_field_officer_uid", name: "Ramesh Kumar (Field Officer)", email: "field.officer@minerakshak.gov.in" },
  { uid: "fo_2", name: "Amitabh Sen (Safety Inspector)", email: "amitabh.sen@minerakshak.gov.in" },
  { uid: "fo_3", name: "Kavita Nair (Ventilation Officer)", email: "kavita.nair@minerakshak.gov.in" },
];

const DEFAULT_INSPECTIONS = [
  {
    id: "insp-101",
    title: "Quarterly Haul Road & Highwall Bench Stability Audit",
    type: "Slope Stability & Bench Inspection",
    mineId: "KCM-01",
    mineName: "Kusmunda Coal Mine",
    zone: "Pit 2 West Bench",
    inspectorId: "demo_field_officer_uid",
    inspectorName: "Ramesh Kumar (Field Officer)",
    scheduledDate: "2026-08-28",
    priority: "critical",
    status: "submitted",
    summary: "Conducted exhaustive on-site audit of Pit 2 West crest. Observed 1 critical mechanical defect on Conveyor 4B and crest crack along bench 3.",
    observations: [
      {
        id: "obs-101-1",
        category: "Heavy Machinery & Conveyor",
        severity: "critical",
        location: "Conveyor 4B Drive Head Pulley",
        description: "Missing mechanical protective steel mesh guard around high-speed drive pulley. Immediate worker entanglement risk.",
        recommendations: "Immediate stop-work on drive pulley until certified guard is fitted and interlocked.",
        evidence: [{ name: "conveyor_drive_exposed.jpg", url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&q=80", type: "image/jpeg" }],
      },
      {
        id: "obs-101-2",
        category: "Structural",
        severity: "high",
        location: "Pit 2 Bench 3 Crest",
        description: "15-meter longitudinal tension crack (width 40mm) observed 2.5m from crest edge.",
        recommendations: "Erect danger signage, demarcate 5m exclusion zone, install displacement prism markers.",
        evidence: [{ name: "bench_crack_photo.jpg", url: "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=500&q=80", type: "image/jpeg" }],
      },
    ],
    submittedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "insp-102",
    title: "Electrical Substation & Fire Protection Statutory Audit",
    type: "Electrical & Substation Safety",
    mineId: "KCM-01",
    mineName: "Kusmunda Coal Mine",
    zone: "East Substation 33kV",
    inspectorId: "demo_field_officer_uid",
    inspectorName: "Ramesh Kumar (Field Officer)",
    scheduledDate: "2026-08-27",
    priority: "high",
    status: "submitted",
    summary: "Audit of 33kV switchgear, transformer oil dielectric strength, and automatic nitrogen fire extinguishing systems.",
    observations: [
      {
        id: "obs-102-1",
        category: "Electrical",
        severity: "high",
        location: "Transformer Bay 2",
        description: "Transformer neutral earth pit resistance measured at 4.8 ohms (DGMS limit is <= 2.0 ohms).",
        recommendations: "Treat earth pit with bentonite clay/salt mixture and re-measure electrode resistance within 48 hours.",
      },
    ],
    submittedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: "insp-103",
    title: "Underground Ventilation Velocity & Gas Concentration Survey",
    type: "Underground Ventilation & Gas Survey",
    mineId: "JCM-03",
    mineName: "Jharia Underground Coal Mine",
    zone: "North Shaft 3rd Incline",
    inspectorId: "fo_3",
    inspectorName: "Kavita Nair (Ventilation Officer)",
    scheduledDate: "2026-08-30",
    priority: "high",
    status: "in_progress",
    summary: "Airflow velocity, methane (CH4), and carbon monoxide (CO) telemetry validation along main intake and return splits.",
    observations: [],
  },
  {
    id: "insp-104",
    title: "Fugitive Dust Suppression & Effluent Discharge Audit",
    type: "Environmental & Pollution Control",
    mineId: "GCM-02",
    mineName: "Gevra Open Cast Mine",
    zone: "Crusher Plant Area",
    inspectorId: "fo_2",
    inspectorName: "Amitabh Sen (Safety Inspector)",
    scheduledDate: "2026-09-03",
    priority: "medium",
    status: "scheduled",
    summary: "Scheduled verification of PM10 gravimetric samplers and high-pressure water mist dust suppression canons.",
    observations: [],
  },
];

function getStoredInspections() {
  if (typeof window === "undefined") return DEFAULT_INSPECTIONS;
  try {
    const data = localStorage.getItem("minerakshak_inspections");
    if (data) return JSON.parse(data);
  } catch {}
  return DEFAULT_INSPECTIONS;
}

function saveStoredInspections(inspections) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("minerakshak_inspections", JSON.stringify(inspections));
    } catch {}
  }
}

export const inspectionService = {
  getInspections: async (params = {}) => {
    try {
      const query = new URLSearchParams();
      if (params.status && params.status !== "all") query.set("status", params.status);
      if (params.mine && params.mine !== "all") query.set("mine", params.mine);
      if (params.search) query.set("search", params.search);
      const queryString = query.toString() ? `?${query.toString()}` : "";
      const res = await api.get(`/inspections${queryString}`);
      if (Array.isArray(res) && res.length > 0) return res;
    } catch {}

    let list = getStoredInspections();
    if (params.status && params.status !== "all") {
      list = list.filter((i) => i.status === params.status);
    }
    if (params.mine && params.mine !== "all") {
      list = list.filter((i) => i.mineId === params.mine);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (i) =>
          i.title?.toLowerCase().includes(q) ||
          i.mineName?.toLowerCase().includes(q) ||
          i.zone?.toLowerCase().includes(q) ||
          i.inspectorName?.toLowerCase().includes(q)
      );
    }
    return list;
  },

  getInspectionById: async (id) => {
    try {
      const res = await api.get(`/inspections/${id}`);
      if (res) return res;
    } catch {}
    const list = getStoredInspections();
    return list.find((i) => i.id === id) || list[0];
  },

  createInspection: async (data) => {
    try {
      const res = await api.post("/inspections", data);
      if (res) return res;
    } catch {}

    const inspections = getStoredInspections();
    const newInsp = {
      id: `insp-${Date.now()}`,
      title: data.title,
      type: data.type || "General Safety Audit",
      mineId: data.mineId || "KCM-01",
      mineName: data.mineId === "GCM-02" ? "Gevra Open Cast Mine" : data.mineId === "JCM-03" ? "Jharia Underground Coal Mine" : "Kusmunda Coal Mine",
      zone: data.zone || "Pit A",
      inspectorId: data.inspectorId || "demo_field_officer_uid",
      inspectorName: data.inspectorName || "Ramesh Kumar (Field Officer)",
      scheduledDate: data.scheduledDate || new Date().toISOString().split("T")[0],
      priority: data.priority || "high",
      status: "scheduled",
      observations: [],
      createdAt: new Date().toISOString(),
    };
    inspections.unshift(newInsp);
    saveStoredInspections(inspections);
    return newInsp;
  },

  updateInspection: async (id, data) => {
    try {
      const res = await api.put(`/inspections/${id}`, data);
      if (res) return res;
    } catch {}

    const inspections = getStoredInspections();
    const idx = inspections.findIndex((i) => i.id === id);
    if (idx !== -1) {
      inspections[idx] = { ...inspections[idx], ...data, updatedAt: new Date().toISOString() };
      saveStoredInspections(inspections);
      return inspections[idx];
    }
    return data;
  },

  submitInspection: async (id, data = {}) => {
    try {
      const res = await api.post(`/inspections/${id}/submit`, data);
      if (res) return res;
    } catch {}

    const inspections = getStoredInspections();
    const idx = inspections.findIndex((i) => i.id === id);
    if (idx !== -1) {
      inspections[idx] = {
        ...inspections[idx],
        status: "submitted",
        summary: data.summary || inspections[idx].summary || "Audit concluded and submitted for review.",
        submittedAt: new Date().toISOString(),
      };
      saveStoredInspections(inspections);
      return inspections[idx];
    }
    return { success: true };
  },

  reviewInspection: async (id, data) => {
    try {
      const res = await api.post(`/inspections/${id}/review`, data);
      if (res) return res;
    } catch {}

    const inspections = getStoredInspections();
    const idx = inspections.findIndex((i) => i.id === id);
    if (idx !== -1) {
      inspections[idx] = {
        ...inspections[idx],
        status: "reviewed",
        reviewNotes: data.notes || "Statutory audit approved and signed off.",
        reviewedAt: new Date().toISOString(),
      };
      saveStoredInspections(inspections);
      return inspections[idx];
    }
    return { success: true };
  },

  addObservation: async (inspectionId, data) => {
    try {
      const res = await api.post(`/inspections/${inspectionId}/observations`, data);
      if (res) return res;
    } catch {}

    const inspections = getStoredInspections();
    const idx = inspections.findIndex((i) => i.id === inspectionId);
    if (idx !== -1) {
      const newObs = {
        id: `obs-${Date.now()}`,
        category: data.category || "General Safety",
        severity: data.severity || "high",
        location: data.location || "On-site",
        description: data.description,
        recommendations: data.recommendations,
        evidence: data.evidence || [],
        createdAt: new Date().toISOString(),
      };
      inspections[idx].observations = inspections[idx].observations || [];
      inspections[idx].observations.push(newObs);
      saveStoredInspections(inspections);
      return newObs;
    }
    return { id: `obs-${Date.now()}`, ...data };
  },

  updateObservation: async (inspectionId, obsId, data) => {
    try {
      const res = await api.put(`/inspections/${inspectionId}/observations/${obsId}`, data);
      if (res) return res;
    } catch {}
    return data;
  },

  deleteObservation: async (inspectionId, obsId) => {
    try {
      const res = await api.delete(`/inspections/${inspectionId}/observations/${obsId}`);
      if (res) return res;
    } catch {}
    return { success: true };
  },

  getMines: async () => {
    try {
      const res = await api.get("/mines");
      if (Array.isArray(res) && res.length > 0) return res;
    } catch {}
    return DEFAULT_MINES;
  },

  getInspectors: async () => {
    try {
      const res = await api.get("/users?role=field_officer");
      if (Array.isArray(res) && res.length > 0) return res;
    } catch {}
    return DEFAULT_INSPECTORS;
  },
};
