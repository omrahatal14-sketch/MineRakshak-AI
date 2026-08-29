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
  const [profile, setProfile] = useState(null); // { uid, role, mineId, name, email, ... }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    return onAuthStateChanged(firebaseAuth, async (user) => {
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
          setError(err.message);
          const role = inferRoleFromEmail(user.email);
          setProfile({
            uid: user.uid,
            email: user.email,
            name: user.displayName || user.email?.split("@")[0] || "User",
            role,
            mineId: ["mine_official", "field_officer"].includes(role) ? "KCM-01" : null,
          });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
  }, []);

  async function login(email, password) {
    setError(null);
    const cred = await signInWithEmailAndPassword(firebaseAuth, email, password);
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
  }

  async function signup({ email, password, name, role, mineId }) {
    setError(null);
    const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    if (name) {
      await updateProfile(cred.user, { displayName: name }).catch(() => {});
    }
    const chosenRole = role || inferRoleFromEmail(email);
    try {
      const registered = await api.post("/auth/register", { name, role: chosenRole, mineId });
      setProfile(registered);
    } catch (err) {
      console.warn("Backend register error, fallback to local profile:", err);
      setProfile({
        uid: cred.user.uid,
        email: cred.user.email,
        name: name || (cred.user.email ? cred.user.email.split("@")[0] : "User"),
        role: chosenRole,
        mineId: mineId || (["mine_official", "field_officer"].includes(chosenRole) ? "KCM-01" : null),
      });
    }
    return cred.user;
  }

  async function logout() {
    await signOut(firebaseAuth);
    setProfile(null);
  }

  return (
    <AuthContext.Provider
      value={{ firebaseUser, profile, loading, error, login, signup, logout }}
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
