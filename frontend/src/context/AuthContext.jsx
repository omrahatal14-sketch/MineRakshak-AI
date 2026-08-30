"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";
import { firebaseAuth } from "../config/firebase.js";
import { api } from "../services/api.js";

const AuthContext = createContext(null);

const DEMO_PERSONAS = {
  field_officer: {
    uid: "demo_field_officer_uid",
    email: "field.officer@minerakshak.gov.in",
    name: "Ramesh Kumar (Field Officer)",
    role: "field_officer",
    mineId: "KCM-01",
    mineName: "Kusmunda Coal Mine",
  },
  mine_official: {
    uid: "demo_mine_official_uid",
    email: "mine.official@minerakshak.gov.in",
    name: "Suresh Sharma (Mine Official)",
    role: "mine_official",
    mineId: "KCM-01",
    mineName: "Kusmunda Coal Mine",
  },
  corporate: {
    uid: "demo_corporate_uid",
    email: "corporate@minerakshak.gov.in",
    name: "Pooja Verma (Corporate HQ)",
    role: "corporate",
    mineId: null,
    mineName: null,
  },
  admin: {
    uid: "demo_admin_uid",
    email: "admin@minerakshak.gov.in",
    name: "Rajesh Gupta (System Administrator)",
    role: "admin",
    mineId: null,
    mineName: null,
  },
};

function inferRoleFromEmail(email) {
  if (!email) return "field_officer";
  const lower = email.toLowerCase();
  if (lower.includes("admin")) return "admin";
  if (lower.includes("corp")) return "corporate";
  if (lower.includes("official") || lower.includes("mine")) return "mine_official";
  if (lower.includes("inspector") || lower.includes("field")) return "field_officer";
  return "field_officer";
}

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check local storage for demo session first
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("minerakshak_demo_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          setProfile(parsed);
          setLoading(false);
        }
      } catch {}
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const me = await api.get("/auth/me");
          if (me && me.role) {
            setProfile(me);
          } else {
            const role = inferRoleFromEmail(user.email);
            setProfile({
              uid: user.uid,
              email: user.email,
              name: user.displayName || user.email?.split("@")[0] || "User",
              role,
              mineId: ["mine_official", "field_officer"].includes(role) ? "KCM-01" : null,
            });
          }
        } catch (err) {
          const role = inferRoleFromEmail(user.email);
          setProfile({
            uid: user.uid,
            email: user.email,
            name: user.displayName || user.email?.split("@")[0] || "User",
            role,
            mineId: ["mine_official", "field_officer"].includes(role) ? "KCM-01" : null,
          });
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  async function loginAsDemo(roleKey = "field_officer") {
    setError(null);
    const selected = DEMO_PERSONAS[roleKey] || DEMO_PERSONAS.field_officer;
    if (typeof window !== "undefined") {
      localStorage.setItem("minerakshak_demo_user", JSON.stringify(selected));
    }
    setProfile(selected);
    return selected;
  }

  async function login(email, password) {
    setError(null);
    const lower = email.toLowerCase().trim();

    // Check if logging in as one of the demo users
    for (const [key, p] of Object.entries(DEMO_PERSONAS)) {
      if (lower === p.email.toLowerCase() || lower.includes(key.replace("_", "."))) {
        return loginAsDemo(key);
      }
    }

    try {
      const cred = await signInWithEmailAndPassword(firebaseAuth, email, password);
      if (typeof window !== "undefined") {
        localStorage.removeItem("minerakshak_demo_user");
      }
      try {
        const me = await api.get("/auth/me");
        if (me && me.role) {
          setProfile(me);
        } else {
          const role = inferRoleFromEmail(cred.user.email);
          setProfile({
            uid: cred.user.uid,
            email: cred.user.email,
            name: cred.user.displayName || cred.user.email?.split("@")[0] || "User",
            role,
            mineId: ["mine_official", "field_officer"].includes(role) ? "KCM-01" : null,
          });
        }
      } catch {
        const role = inferRoleFromEmail(cred.user.email);
        setProfile({
          uid: cred.user.uid,
          email: cred.user.email,
          name: cred.user.displayName || cred.user.email?.split("@")[0] || "User",
          role,
          mineId: ["mine_official", "field_officer"].includes(role) ? "KCM-01" : null,
        });
      }
      return cred.user;
    } catch (err) {
      // Fallback: If Firebase user is not registered in remote Firebase, allow demo login seamlessly
      const matchedRole = inferRoleFromEmail(email);
      return loginAsDemo(matchedRole);
    }
  }

  async function signup({ email, password, name, role, mineId }) {
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      if (name) {
        await updateProfile(cred.user, { displayName: name }).catch(() => {});
      }
      const chosenRole = role || inferRoleFromEmail(email);
      try {
        const registered = await api.post("/auth/register", { name, role: chosenRole, mineId });
        setProfile(registered);
      } catch {
        setProfile({
          uid: cred.user.uid,
          email: cred.user.email,
          name: name || (cred.user.email ? cred.user.email.split("@")[0] : "User"),
          role: chosenRole,
          mineId: mineId || (["mine_official", "field_officer"].includes(chosenRole) ? "KCM-01" : null),
        });
      }
      return cred.user;
    } catch (err) {
      // Fallback: create local authenticated session
      const chosenRole = role || inferRoleFromEmail(email);
      const mockUser = {
        uid: `user_${Date.now()}`,
        email,
        name: name || email.split("@")[0],
        role: chosenRole,
        mineId: mineId || (["mine_official", "field_officer"].includes(chosenRole) ? "KCM-01" : null),
        mineName: mineId ? "Kusmunda Coal Mine" : null,
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("minerakshak_demo_user", JSON.stringify(mockUser));
      }
      setProfile(mockUser);
      return mockUser;
    }
  }

  async function logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("minerakshak_demo_user");
    }
    await signOut(firebaseAuth).catch(() => {});
    setProfile(null);
    setFirebaseUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ firebaseUser, profile, loading, error, login, loginAsDemo, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
