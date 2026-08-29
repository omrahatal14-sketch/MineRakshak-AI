import { firebaseAuth } from "../config/firebase.js";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

async function request(path, options = {}) {
  let user = firebaseAuth.currentUser;
  let token = null;

  if (user) {
    try {
      token = await user.getIdToken(false);
    } catch {
      token = null;
    }
  }

  let res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  // If token was expired (401), force refresh token once and retry
  if (res.status === 401 && user) {
    try {
      token = await user.getIdToken(true);
      res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });
    } catch {}
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: "DELETE" }),
};
