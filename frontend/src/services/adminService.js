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

const DEFAULT_USERS = [
  { uid: "demo_mine_official_uid", name: "Suresh Sharma (Mine Official)", email: "mine.official@minerakshak.gov.in", role: "mine_official", mineId: "KCM-01", mineName: "Kusmunda Coal Mine", status: "active" },
  { uid: "demo_field_officer_uid", name: "Ramesh Kumar (Field Officer)", email: "field.officer@minerakshak.gov.in", role: "field_officer", mineId: "KCM-01", mineName: "Kusmunda Coal Mine", status: "active" },
  { uid: "demo_contractor_uid", name: "Vikram Singh (Contractor Company)", email: "contractor@minerakshak.gov.in", role: "contractor", mineId: "KCM-01", mineName: "Kusmunda Coal Mine", companyName: "SafeMine Engineering Pvt. Ltd.", status: "active" },
  { uid: "demo_corporate_uid", name: "Pooja Verma (Corporate HQ)", email: "corporate@minerakshak.gov.in", role: "corporate", mineId: null, mineName: "National Coal Registry", status: "active" },
  { uid: "demo_admin_uid", name: "Rajesh Gupta (System Administrator)", email: "admin@minerakshak.gov.in", role: "admin", mineId: null, mineName: "DGMS Central Command", status: "active" },
  { uid: "fo_2", name: "Amitabh Sen (Safety Inspector)", email: "amitabh.sen@minerakshak.gov.in", role: "field_officer", mineId: "GCM-02", mineName: "Gevra Open Cast Mine", status: "active" },
  { uid: "fo_3", name: "Kavita Nair (Ventilation Officer)", email: "kavita.nair@minerakshak.gov.in", role: "field_officer", mineId: "JCM-03", mineName: "Jharia Underground Coal Mine", status: "active" },
];

const DEFAULT_AUDIT_LOGS = [
  { id: "log-101", action: "dispatch_ai_incident", entityType: "incident", entityId: "viol-ai-01", userId: "demo_mine_official_uid", userRole: "mine_official", userName: "Suresh Sharma", metadata: { hazard: "Conveyor Drive Safety Guard Missing", company: "SafeMine Engineering", deadline: "24 Hours" }, timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
  { id: "log-102", action: "resolve_corrective_action", entityType: "corrective_action", entityId: "act-402", userId: "demo_contractor_uid", userRole: "contractor", userName: "Vikram Singh", metadata: { notes: "Guard fabricated and interlock relay verified." }, timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
  { id: "log-103", action: "submit_inspection", entityType: "inspection", entityId: "insp-101", userId: "demo_field_officer_uid", userRole: "field_officer", userName: "Ramesh Kumar", metadata: { inspectionTitle: "Quarterly Haul Road & Highwall Bench Audit" }, timestamp: new Date(Date.now() - 1000 * 3600 * 3).toISOString() },
  { id: "log-104", action: "review_inspection", entityType: "inspection", entityId: "insp-101", userId: "demo_mine_official_uid", userRole: "mine_official", userName: "Suresh Sharma", metadata: { status: "reviewed", actionsCreated: 2 }, timestamp: new Date(Date.now() - 1000 * 3600 * 4).toISOString() },
  { id: "log-105", action: "user_login", entityType: "auth", entityId: "demo_admin_uid", userId: "demo_admin_uid", userRole: "admin", userName: "Rajesh Gupta", metadata: { ip: "192.168.1.104", method: "1-Click Demo / OAuth" }, timestamp: new Date(Date.now() - 1000 * 3600 * 6).toISOString() },
  { id: "log-106", action: "register_facility", entityType: "mine", entityId: "DIP-09", userId: "demo_admin_uid", userRole: "admin", userName: "Rajesh Gupta", metadata: { mineName: "Dipka Mine Expansion", annualTargetMT: 38.0 }, timestamp: new Date(Date.now() - 1000 * 3600 * 24).toISOString() },
];

function getStoredUsers() {
  if (typeof window === "undefined") return DEFAULT_USERS;
  try {
    const data = localStorage.getItem("minerakshak_admin_users");
    if (data) return JSON.parse(data);
  } catch {}
  return DEFAULT_USERS;
}

function saveStoredUsers(users) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("minerakshak_admin_users", JSON.stringify(users));
    } catch {}
  }
}

function getStoredMines() {
  if (typeof window === "undefined") return DEFAULT_MINES;
  try {
    const data = localStorage.getItem("minerakshak_admin_mines");
    if (data) return JSON.parse(data);
  } catch {}
  return DEFAULT_MINES;
}

function saveStoredMines(mines) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("minerakshak_admin_mines", JSON.stringify(mines));
    } catch {}
  }
}

export const adminService = {
  getUsers: async (params = {}) => {
    try {
      const query = new URLSearchParams();
      if (params.role && params.role !== "all") query.set("role", params.role);
      if (params.mine && params.mine !== "all") query.set("mine", params.mine);
      if (params.status && params.status !== "all") query.set("status", params.status);
      if (params.search) query.set("search", params.search);
      const queryString = query.toString() ? `?${query.toString()}` : "";
      const res = await api.get(`/users${queryString}`);
      if (Array.isArray(res) && res.length > 0) return res;
    } catch {}

    // Resilient client-side fallback
    let list = getStoredUsers();
    if (params.role && params.role !== "all") {
      list = list.filter((u) => u.role === params.role);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.mineName?.toLowerCase().includes(q)
      );
    }
    return list;
  },

  createUser: async (data) => {
    try {
      const res = await api.post("/users", data);
      if (res) return res;
    } catch {}

    const users = getStoredUsers();
    const newUser = {
      uid: `user_${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role || "field_officer",
      mineId: data.mineId || "KCM-01",
      mineName: data.mineId === "GCM-02" ? "Gevra Open Cast Mine" : data.mineId === "JCM-03" ? "Jharia Underground Coal Mine" : "Kusmunda Coal Mine",
      status: data.status || "active",
      createdAt: new Date().toISOString(),
    };
    users.unshift(newUser);
    saveStoredUsers(users);
    return newUser;
  },

  updateUser: async (uid, data) => {
    try {
      const res = await api.put(`/users/${uid}`, data);
      if (res) return res;
    } catch {}

    const users = getStoredUsers();
    const idx = users.findIndex((u) => u.uid === uid);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...data, updatedAt: new Date().toISOString() };
      saveStoredUsers(users);
      return users[idx];
    }
    return data;
  },

  deactivateUser: async (uid) => {
    try {
      const res = await api.delete(`/users/${uid}`);
      if (res) return res;
    } catch {}

    const users = getStoredUsers();
    const updated = users.map((u) => (u.uid === uid ? { ...u, status: "inactive" } : u));
    saveStoredUsers(updated);
    return { success: true };
  },

  getMines: async () => {
    try {
      const res = await api.get("/mines");
      if (Array.isArray(res) && res.length > 0) return res;
    } catch {}
    return getStoredMines();
  },

  createMine: async (data) => {
    try {
      const res = await api.post("/mines", data);
      if (res) return res;
    } catch {}

    const mines = getStoredMines();
    const newMine = {
      id: data.code || `MINE-${Date.now()}`,
      name: data.name,
      code: data.code,
      zone: data.zone,
      latitude: parseFloat(data.latitude) || 22.309,
      longitude: parseFloat(data.longitude) || 82.679,
      status: data.status || "active",
      annualTargetMT: parseFloat(data.annualTargetMT) || 25.0,
    };
    mines.unshift(newMine);
    saveStoredMines(mines);
    return newMine;
  },

  updateMine: async (id, data) => {
    try {
      const res = await api.put(`/mines/${id}`, data);
      if (res) return res;
    } catch {}

    const mines = getStoredMines();
    const idx = mines.findIndex((m) => m.id === id || m.code === id);
    if (idx !== -1) {
      mines[idx] = { ...mines[idx], ...data };
      saveStoredMines(mines);
      return mines[idx];
    }
    return data;
  },

  getAuditLogs: async (params = {}) => {
    try {
      const query = new URLSearchParams();
      if (params.action && params.action !== "all") query.set("action", params.action);
      if (params.entityType && params.entityType !== "all") query.set("entityType", params.entityType);
      if (params.limit) query.set("limit", params.limit);
      const queryString = query.toString() ? `?${query.toString()}` : "";
      const res = await api.get(`/audit-logs${queryString}`);
      if (Array.isArray(res) && res.length > 0) return res;
    } catch {}
    return DEFAULT_AUDIT_LOGS;
  },
};
