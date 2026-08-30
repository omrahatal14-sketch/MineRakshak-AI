import { api } from "./api.js";

const DEFAULT_ACTIONS = [
  {
    id: "act-401",
    title: "Conveyor 4B High-Speed Drive Pulley Mesh Guard Installation",
    description: "Fabricate and install heavy-gauge statutory protective mesh enclosure around exposed drive pulley with electrical trip interlock relay.",
    category: "Heavy Machinery & Conveyor",
    mineId: "KCM-01",
    mineName: "Kusmunda Coal Mine",
    zone: "Pit 2 West Bench",
    priority: "critical",
    severity: "critical",
    targetDate: "2026-09-02",
    status: "assigned",
    assignedTo: "demo_field_officer_uid",
    assignedToName: "Ramesh Kumar (Field Officer)",
    responsibleCompany: "SafeMine Engineering Pvt. Ltd.",
    aiRiskScore: 88.0,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: "act-402",
    title: "Highwall Tension Crack Excavation & Exclusion Berm Construction",
    description: "Demarcate 5m danger exclusion zone along Pit 2 Bench 3 crest. Install permanent warning reflective signage and optical displacement prism markers.",
    category: "Structural",
    mineId: "KCM-01",
    mineName: "Kusmunda Coal Mine",
    zone: "Pit 2 Bench 3 Crest",
    priority: "high",
    severity: "high",
    targetDate: "2026-09-04",
    status: "in_progress",
    assignedTo: "demo_field_officer_uid",
    assignedToName: "Ramesh Kumar (Field Officer)",
    responsibleCompany: "Eastern Earthmovers Consortium",
    aiRiskScore: 78.5,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: "act-403",
    title: "Fugitive Dust Suppression High-Pressure Mist Cannon Maintenance",
    description: "Replace worn brass nozzles on mist suppression array at Primary In-Pit Crusher discharge chute.",
    category: "Environmental",
    mineId: "GCM-02",
    mineName: "Gevra Open Cast Mine",
    zone: "Primary Crusher Unit 1",
    priority: "medium",
    severity: "medium",
    targetDate: "2026-09-10",
    status: "resolved",
    assignedTo: "fo_2",
    assignedToName: "Amitabh Sen (Safety Inspector)",
    responsibleCompany: "EcoVentilate Systems",
    aiRiskScore: 54.0,
    resolutionNotes: "All 18 nozzles replaced with stainless steel atomizing jets. Flow rate verified at 4.2 bar.",
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
  {
    id: "act-404",
    title: "Overland Coal Conveyor Emergency Pull-Wire Switch Cable Replacement",
    description: "Install continuous emergency trip wire with audio-visual pre-start sirens on Transfer Tower 3B.",
    category: "Safety",
    mineId: "KCM-01",
    mineName: "Kusmunda Coal Mine",
    zone: "Transfer Tower 3B",
    priority: "high",
    severity: "high",
    targetDate: "2026-08-25",
    status: "closed",
    assignedTo: "demo_field_officer_uid",
    assignedToName: "Ramesh Kumar (Field Officer)",
    responsibleCompany: "SafeMine Engineering Pvt. Ltd.",
    aiRiskScore: 68.0,
    verificationNotes: "Physical trip test successfully performed. Both sirens functioning within statutory response latency.",
    createdAt: new Date(Date.now() - 3600000 * 120).toISOString(),
  },
];

const DEFAULT_VIOLATIONS = [
  {
    id: "viol-01",
    title: "Missing Mechanical Protective Guard on High-Speed Pulley",
    description: "Violation of CMR 2017 Regulation 184. Exposed drive mechanism presents direct risk of severe personnel entanglement.",
    severity: "critical",
    mineId: "KCM-01",
    mineName: "Kusmunda Coal Mine",
    zone: "Pit 2 West Bench",
    status: "open",
    aiRiskScore: 88.0,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: "viol-02",
    title: "Tension Crack Observed Along Highwall Bench Crest",
    description: "Violation of DGMS Technical Circular No. 3/2021. 15m longitudinal displacement crack observed 2.5m from bench edge.",
    severity: "high",
    mineId: "KCM-01",
    mineName: "Kusmunda Coal Mine",
    zone: "Pit 2 Bench 3 Crest",
    status: "open",
    aiRiskScore: 78.5,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

function getStoredActions() {
  if (typeof window === "undefined") return DEFAULT_ACTIONS;
  try {
    const data = localStorage.getItem("minerakshak_actions");
    if (data) return JSON.parse(data);
  } catch {}
  return DEFAULT_ACTIONS;
}

function saveStoredActions(actions) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("minerakshak_actions", JSON.stringify(actions));
    } catch {}
  }
}

export const correctiveActionService = {
  getActions: async (params = {}) => {
    try {
      const query = new URLSearchParams();
      if (params.status && params.status !== "all") query.set("status", params.status);
      if (params.priority && params.priority !== "all") query.set("priority", params.priority);
      if (params.mine && params.mine !== "all") query.set("mine", params.mine);
      if (params.search) query.set("search", params.search);
      const queryString = query.toString() ? `?${query.toString()}` : "";
      const res = await api.get(`/corrective-actions${queryString}`);
      if (Array.isArray(res) && res.length > 0) return res;
    } catch {}

    let list = getStoredActions();
    if (params.status && params.status !== "all") {
      list = list.filter((a) => a.status === params.status);
    }
    if (params.priority && params.priority !== "all") {
      list = list.filter((a) => a.priority === params.priority);
    }
    if (params.mine && params.mine !== "all") {
      list = list.filter((a) => a.mineId === params.mine);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (a) =>
          a.title?.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q) ||
          a.responsibleCompany?.toLowerCase().includes(q)
      );
    }
    return list;
  },

  getActionById: async (id) => {
    try {
      const res = await api.get(`/corrective-actions/${id}`);
      if (res) return res;
    } catch {}
    const actions = getStoredActions();
    return actions.find((a) => a.id === id) || null;
  },

  createAction: async (data) => {
    try {
      const res = await api.post("/corrective-actions", data);
      if (res) return res;
    } catch {}

    const actions = getStoredActions();
    const newAction = {
      id: `act-${Date.now()}`,
      title: data.title,
      description: data.description,
      category: data.category || "Safety",
      mineId: data.mineId || "KCM-01",
      mineName: data.mineName || "Kusmunda Coal Mine",
      zone: data.zone || "Pit 1",
      priority: data.priority || "high",
      severity: data.priority || "high",
      targetDate: data.targetDate || new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
      status: "assigned",
      assignedTo: data.assignedTo || "demo_field_officer_uid",
      assignedToName: data.assignedToName || "Field Officer",
      responsibleCompany: data.responsibleCompany || "SafeMine Engineering Pvt. Ltd.",
      aiRiskScore: data.aiRiskScore || 75.0,
      createdAt: new Date().toISOString(),
    };
    actions.unshift(newAction);
    saveStoredActions(actions);
    return newAction;
  },

  updateAction: async (id, data) => {
    try {
      const res = await api.put(`/corrective-actions/${id}`, data);
      if (res) return res;
    } catch {}

    const actions = getStoredActions();
    const idx = actions.findIndex((a) => a.id === id);
    if (idx !== -1) {
      actions[idx] = { ...actions[idx], ...data, updatedAt: new Date().toISOString() };
      saveStoredActions(actions);
      return actions[idx];
    }
    return data;
  },

  resolveAction: async (id, data) => {
    try {
      const res = await api.post(`/corrective-actions/${id}/resolve`, data);
      if (res) return res;
    } catch {}

    const actions = getStoredActions();
    const idx = actions.findIndex((a) => a.id === id);
    if (idx !== -1) {
      actions[idx] = {
        ...actions[idx],
        status: "resolved",
        resolutionNotes: data.notes || data.resolutionNotes || "Mandatory repair completed.",
        resolutionEvidence: data.evidence || [],
        resolvedAt: new Date().toISOString(),
      };
      saveStoredActions(actions);
      return actions[idx];
    }
    return { success: true };
  },

  verifyAction: async (id, data) => {
    try {
      const res = await api.post(`/corrective-actions/${id}/verify`, data);
      if (res) return res;
    } catch {}

    const actions = getStoredActions();
    const idx = actions.findIndex((a) => a.id === id);
    if (idx !== -1) {
      actions[idx] = {
        ...actions[idx],
        status: "closed",
        verificationNotes: data.notes || data.verificationNotes || "Verified on-site and closed.",
        closedAt: new Date().toISOString(),
      };
      saveStoredActions(actions);
      return actions[idx];
    }
    return { success: true };
  },

  getViolations: async (params = {}) => {
    try {
      const query = new URLSearchParams();
      if (params.status) query.set("status", params.status);
      if (params.severity) query.set("severity", params.severity);
      const queryString = query.toString() ? `?${query.toString()}` : "";
      const res = await api.get(`/violations${queryString}`);
      if (Array.isArray(res) && res.length > 0) return res;
    } catch {}
    return DEFAULT_VIOLATIONS;
  },

  createViolation: async (data) => {
    try {
      const res = await api.post("/violations", data);
      if (res) return res;
    } catch {}
    return { id: `viol-${Date.now()}`, ...data, status: "open", createdAt: new Date().toISOString() };
  },
};
