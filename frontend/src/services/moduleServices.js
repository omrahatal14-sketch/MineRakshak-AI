import { api } from "./api.js";
import { firebaseAuth } from "../config/firebase.js";

export const complianceService = {
  getRequirements: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.mine) params.set("mine", filters.mine);
    if (filters.category) params.set("category", filters.category);
    if (filters.status) params.set("status", filters.status);
    const qs = params.toString();
    return api.get(`/compliance-requirements${qs ? `?${qs}` : ""}`);
  },

  createRequirement: async (data) => {
    return api.post("/compliance-requirements", data);
  },
};

export const documentService = {
  getDocuments: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.relatedEntityType) params.set("relatedEntityType", filters.relatedEntityType);
    const qs = params.toString();
    return api.get(`/documents${qs ? `?${qs}` : ""}`);
  },

  getDocument: async (id) => {
    return api.get(`/documents/${id}`);
  },

  uploadDocument: async (file, metadata = {}) => {
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
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Upload failed: ${res.status}`);
    }
    return res.json();
  },

  saveOcrText: async (docId, ocrText) => {
    return api.post(`/documents/${docId}/ocr`, { ocrText });
  },
};

export const auditService = {
  getLogs: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.action) params.set("action", filters.action);
    if (filters.entityType) params.set("entityType", filters.entityType);
    if (filters.limit) params.set("limit", String(filters.limit));
    const qs = params.toString();
    return api.get(`/audit-logs${qs ? `?${qs}` : ""}`);
  },
};

export const reportService = {
  getSummary: async () => {
    return api.get("/reports/summary");
  },
};

export const mineService = {
  getMines: async () => {
    return api.get("/mines");
  },
};
