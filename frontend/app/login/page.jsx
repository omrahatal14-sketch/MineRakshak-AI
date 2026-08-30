"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../src/context/AuthContext.jsx";
import Link from "next/link";
import {
  ShieldAlert, User, Lock, Mail, ArrowRight, CheckCircle2,
  Building2, HardHat, ShieldCheck, ArrowLeft, Wrench
} from "lucide-react";

export default function LoginPage() {
  const { login, loginAsDemo, signup, profile } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState("quick"); // "quick" | "credentials"
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("mine_official");
  const [mineId, setMineId] = useState("KCM-01");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getDestination = (userRole) => {
    switch (userRole) {
      case "field_officer":
        return "/field-officer";
      case "mine_official":
        return "/mine-official";
      case "contractor":
        return "/contractor";
      case "corporate":
        return "/corporate";
      case "admin":
      default:
        return "/admin";
    }
  };

  const handleQuickLogin = async (roleKey) => {
    setLoading(true);
    setError(null);
    try {
      const user = await loginAsDemo(roleKey);
      router.push(getDestination(user.role));
    } catch (err) {
      setError(err.message || "Failed to sign in");
      setLoading(false);
    }
  };

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isSignup) {
        const user = await signup({ email, password, name, role, mineId });
        router.push(getDestination(user.role));
      } else {
        const user = await login(email, password);
        router.push(getDestination(user.role));
      }
    } catch (err) {
      setError(err.message || "Authentication failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center items-center px-4 py-12">
      {/* Back to Landing Link */}
      <div className="max-w-md w-full mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate hover:text-primary transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </Link>
        <span className="text-[11px] font-mono text-slate">DGMS Statutory Platform</span>
      </div>

      <div className="max-w-md w-full rounded-2xl border border-border bg-surface p-8 shadow-xl">
        {/* Brand Logo & Header */}
        <div className="text-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-white shadow-md mx-auto mb-3">
            MR
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">MineRakshak AI Portal</h1>
          <p className="text-xs text-slate mt-1">
            Smart Compliance & Governance for Indian Coal Mines
          </p>
        </div>

        {/* Tab Toggle: 1-Click Demo vs Credentials */}
        <div className="flex items-center rounded-xl bg-canvas p-1 border border-border mb-6">
          <button
            type="button"
            onClick={() => setMode("quick")}
            className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition ${
              mode === "quick"
                ? "bg-surface text-ink shadow-xs border border-border/80"
                : "text-slate hover:text-ink"
            }`}
          >
            1-Click Demo Sign-In
          </button>
          <button
            type="button"
            onClick={() => setMode("credentials")}
            className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition ${
              mode === "credentials"
                ? "bg-surface text-ink shadow-xs border border-border/80"
                : "text-slate hover:text-ink"
            }`}
          >
            Email & Password
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-status-overdue border border-red-200">
            {error}
          </div>
        )}

        {/* MODE 1: 1-Click Stakeholder Demo Sign-In */}
        {mode === "quick" && (
          <div className="space-y-3">
            <p className="text-[11px] font-bold text-slate uppercase tracking-wider mb-2">
              Select Stakeholder Persona:
            </p>

            <button
              onClick={() => handleQuickLogin("mine_official")}
              disabled={loading}
              className="w-full flex items-center justify-between rounded-xl border border-border bg-canvas hover:bg-purple-50/60 hover:border-purple-300 p-3 text-xs font-semibold text-ink transition group"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-700 font-bold">
                  MO
                </span>
                <div className="text-left">
                  <p className="font-bold text-ink">Mine Official (Manager)</p>
                  <p className="text-[11px] text-slate">Incident Vision & Active Pit CAPA</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate group-hover:text-purple-600 transition" />
            </button>

            <button
              onClick={() => handleQuickLogin("field_officer")}
              disabled={loading}
              className="w-full flex items-center justify-between rounded-xl border border-border bg-canvas hover:bg-blue-50/60 hover:border-blue-300 p-3 text-xs font-semibold text-ink transition group"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold">
                  FO
                </span>
                <div className="text-left">
                  <p className="font-bold text-ink">Field Officer (Inspector)</p>
                  <p className="text-[11px] text-slate">GPS Field Audits & Verification</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate group-hover:text-blue-600 transition" />
            </button>

            <button
              onClick={() => handleQuickLogin("contractor")}
              disabled={loading}
              className="w-full flex items-center justify-between rounded-xl border border-border bg-canvas hover:bg-orange-50/60 hover:border-orange-300 p-3 text-xs font-semibold text-ink transition group"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-700 font-bold">
                  <Wrench className="h-4.5 w-4.5" />
                </span>
                <div className="text-left">
                  <p className="font-bold text-ink">Contractor Company (Repair)</p>
                  <p className="text-[11px] text-slate">Assigned Tasks, Deadlines & Proof Upload</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate group-hover:text-orange-600 transition" />
            </button>

            <button
              onClick={() => handleQuickLogin("corporate")}
              disabled={loading}
              className="w-full flex items-center justify-between rounded-xl border border-border bg-canvas hover:bg-emerald-50/60 hover:border-emerald-300 p-3 text-xs font-semibold text-ink transition group"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold">
                  HQ
                </span>
                <div className="text-left">
                  <p className="font-bold text-ink">Corporate Management (Company HQ)</p>
                  <p className="text-[11px] text-slate">AI Prioritization & CAPA Deadlines</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate group-hover:text-emerald-600 transition" />
            </button>

            <button
              onClick={() => handleQuickLogin("admin")}
              disabled={loading}
              className="w-full flex items-center justify-between rounded-xl border border-border bg-canvas hover:bg-red-50/60 hover:border-red-300 p-3 text-xs font-semibold text-ink transition group"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-red-700 font-bold">
                  SA
                </span>
                <div className="text-left">
                  <p className="font-bold text-ink">System Administrator</p>
                  <p className="text-[11px] text-slate">User & Mine Controls, Audit Trail</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate group-hover:text-red-600 transition" />
            </button>
          </div>
        )}

        {/* MODE 2: Standard Credentials Sign-In & Sign-Up */}
        {mode === "credentials" && (
          <form onSubmit={handleCredentialsSubmit} className="space-y-3.5 text-xs">
            {isSignup && (
              <div>
                <label className="mb-1 block font-semibold text-slate">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full rounded-lg border border-border px-3 py-2 text-ink focus:border-primary focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="mb-1 block font-semibold text-slate">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@minerakshak.gov.in"
                className="w-full rounded-lg border border-border px-3 py-2 text-ink focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block font-semibold text-slate">Password *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-border px-3 py-2 text-ink focus:border-primary focus:outline-none"
              />
            </div>

            {isSignup && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block font-semibold text-slate">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-lg border border-border px-2 py-2 text-ink focus:border-primary focus:outline-none"
                  >
                    <option value="mine_official">Mine Official</option>
                    <option value="field_officer">Field Officer</option>
                    <option value="contractor">Contractor Company</option>
                    <option value="corporate">Corporate HQ</option>
                    <option value="admin">System Admin</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-slate">Mine</label>
                  <select
                    value={mineId}
                    onChange={(e) => setMineId(e.target.value)}
                    className="w-full rounded-lg border border-border px-2 py-2 text-ink focus:border-primary focus:outline-none"
                  >
                    <option value="KCM-01">Kusmunda Mine</option>
                    <option value="GCM-02">Gevra Mine</option>
                    <option value="JCM-03">Jharia Mine</option>
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary-dark disabled:opacity-60 transition mt-2"
            >
              {loading
                ? "Authenticating..."
                : isSignup
                ? "Create Account & Sign In"
                : "Sign In to Dashboard"}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsSignup(!isSignup)}
                className="text-xs text-primary font-semibold hover:underline"
              >
                {isSignup
                  ? "Already have an account? Sign In"
                  : "Need a new account? Register"}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-border text-center text-[11px] text-slate">
          Ministry of Coal & DGMS Smart Governance Initiative
        </div>
      </div>
    </div>
  );
}
