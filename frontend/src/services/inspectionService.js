import { api } from "./api.js";

export const inspectionService = {
  // Get inspections with optional query filters (status, mine, search)
  getInspections: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== "all") query.set("status", params.status);
    if (params.mine && params.mine !== "all") query.set("mine", params.mine);
    if (params.search) query.set("search", params.search);
    const queryString = query.toString() ? `?${query.toString()}` : "";
    return api.get(`/inspections${queryString}`);
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
    return api.get("/mines");
  },

  // Get list of officers/inspectors
  getInspectors: async () => {
    return api.get("/users?role=field_officer");
  },
};
