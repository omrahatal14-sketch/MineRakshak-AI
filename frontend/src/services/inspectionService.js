import { api } from "./api.js";

const DEFAULT_MINES = [
  { id: "KCM-01", name: "Kusmunda Coal Mine", zone: "Korba, Chhattisgarh" },
  { id: "GVR-02", name: "Gevra Mega Open Cast", zone: "Korba, Chhattisgarh" },
  { id: "DPA-03", name: "Dipka Open Cast Mine", zone: "Korba, Chhattisgarh" },
];

const DEFAULT_INSPECTORS = [
  { uid: "inspector1", name: "Rahul Sharma (Field Inspector)", email: "inspector1@minerakshak.demo" },
  { uid: "inspector2", name: "Amit Verma (Safety Officer)", email: "inspector2@minerakshak.demo" },
];

export const inspectionService = {
  // Get inspections with optional query filters (status, mine, search)
  getInspections: async (params = {}) => {
    try {
      const query = new URLSearchParams();
      if (params.status && params.status !== "all") query.set("status", params.status);
      if (params.mine && params.mine !== "all") query.set("mine", params.mine);
      if (params.search) query.set("search", params.search);
      const queryString = query.toString() ? `?${query.toString()}` : "";
      const res = await api.get(`/inspections${queryString}`);
      if (res) return res;
    } catch {}
    return [];
  },

  // Get single inspection with observations
  getInspectionById: async (id) => {
    return api.get(`/inspections/${id}`);
  },

  // Create new inspection (Admin / Mine Official)
  createInspection: async (data) => {
    return api.post("/inspections", data);
  },

  // Update draft inspection
  updateInspection: async (id, data) => {
    return api.put(`/inspections/${id}`, data);
  },

  // Submit inspection for review (Field Officer)
  submitInspection: async (id, data = {}) => {
    return api.post(`/inspections/${id}/submit`, data);
  },

  // Review inspection (Mine Official)
  reviewInspection: async (id, data) => {
    return api.post(`/inspections/${id}/review`, data);
  },

  // Add observation to inspection
  addObservation: async (inspectionId, data) => {
    return api.post(`/inspections/${inspectionId}/observations`, data);
  },

  // Update observation
  updateObservation: async (inspectionId, obsId, data) => {
    return api.put(`/inspections/${inspectionId}/observations/${obsId}`, data);
  },

  // Delete observation
  deleteObservation: async (inspectionId, obsId) => {
    return api.delete(`/inspections/${inspectionId}/observations/${obsId}`);
  },

  // Get list of mines
  getMines: async () => {
    try {
      const res = await api.get("/mines");
      if (res && res.length > 0) return res;
    } catch {}
    return DEFAULT_MINES;
  },

  // Get list of officers/inspectors
  getInspectors: async () => {
    try {
      const res = await api.get("/users?role=field_officer");
      if (res && res.length > 0) return res;
    } catch {}
    return DEFAULT_INSPECTORS;
  },
};
