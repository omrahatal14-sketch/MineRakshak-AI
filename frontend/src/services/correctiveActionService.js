import { api } from "./api.js";

export const correctiveActionService = {
  getActions: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== "all") query.set("status", params.status);
    if (params.priority && params.priority !== "all") query.set("priority", params.priority);
    if (params.mine && params.mine !== "all") query.set("mine", params.mine);
    if (params.search) query.set("search", params.search);
    const queryString = query.toString() ? `?${query.toString()}` : "";
    return api.get(`/corrective-actions${queryString}`);
  },

  getActionById: async (id) => {
    return api.get(`/corrective-actions/${id}`);
  },

  createAction: async (data) => {
    return api.post("/corrective-actions", data);
  },

  updateAction: async (id, data) => {
    return api.put(`/corrective-actions/${id}`, data);
  },

  verifyAction: async (id, data) => {
    return api.post(`/corrective-actions/${id}/verify`, data);
  },

  getViolations: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.set("status", params.status);
    if (params.severity) query.set("severity", params.severity);
    const queryString = query.toString() ? `?${query.toString()}` : "";
    return api.get(`/violations${queryString}`);
  },

  createViolation: async (data) => {
    return api.post("/violations", data);
  },
};
