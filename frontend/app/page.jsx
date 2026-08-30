"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../src/context/AuthContext.jsx";
import Link from "next/link";

export default function RootPage() {
  const { profile, loading, loginAsDemo } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && profile) {
      const destination =
        profile.role === "field_officer"
          ? "/field-officer"
          : profile.role === "mine_official"
          ? "/mine-official"
          : profile.role === "corporate"
          ? "/corporate"
          : "/admin";
      router.push(destination);
    }
  }, [profile, loading, router]);

  const handleQuickLogin = async (role) => {
    await loginAsDemo(role);
    const destination =
      role === "field_officer"
        ? "/field-officer"
        : role === "mine_official"
        ? "/mine-official"
        : role === "corporate"
        ? "/corporate"
        : "/admin";
    router.push(destination);
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full rounded-2xl border border-border bg-surface p-8 shadow-xl text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-white shadow-md mx-auto mb-4">
          MR
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">MineRakshak AI</h1>
        <p className="text-xs text-slate mt-1 mb-6">
          AI-based Smart Governance & Statutory Compliance Platform for Coal Mines
        </p>

        <div className="space-y-2.5 text-left">
          <p className="text-xs font-bold text-slate uppercase tracking-wider mb-2">
            Select Role to Access Dashboard:
          </p>

          <button
            onClick={() => handleQuickLogin("admin")}
            className="w-full flex items-center justify-between rounded-xl border border-border bg-canvas hover:bg-primary-light hover:border-primary/40 p-3.5 text-xs font-semibold text-ink transition group"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-700 font-bold">
                SA
              </span>
              <div>
                <p className="font-bold text-ink">System Administrator</p>
                <p className="text-[11px] text-slate">Governance & user control center</p>
              </div>
            </div>
            <span className="text-slate group-hover:text-primary transition font-bold">→</span>
          </button>

          <button
            onClick={() => handleQuickLogin("mine_official")}
            className="w-full flex items-center justify-between rounded-xl border border-border bg-canvas hover:bg-primary-light hover:border-primary/40 p-3.5 text-xs font-semibold text-ink transition group"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700 font-bold">
                MO
              </span>
              <div>
                <p className="font-bold text-ink">Mine Official (Manager)</p>
                <p className="text-[11px] text-slate">Operations & AI hazard vision</p>
              </div>
            </div>
            <span className="text-slate group-hover:text-primary transition font-bold">→</span>
          </button>

          <button
            onClick={() => handleQuickLogin("field_officer")}
            className="w-full flex items-center justify-between rounded-xl border border-border bg-canvas hover:bg-primary-light hover:border-primary/40 p-3.5 text-xs font-semibold text-ink transition group"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-bold">
                FO
              </span>
              <div>
                <p className="font-bold text-ink">Field Officer (Inspector)</p>
                <p className="text-[11px] text-slate">On-site audit logs & evidence</p>
              </div>
            </div>
            <span className="text-slate group-hover:text-primary transition font-bold">→</span>
          </button>

          <button
            onClick={() => handleQuickLogin("corporate")}
            className="w-full flex items-center justify-between rounded-xl border border-border bg-canvas hover:bg-primary-light hover:border-primary/40 p-3.5 text-xs font-semibold text-ink transition group"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 font-bold">
                HQ
              </span>
              <div>
                <p className="font-bold text-ink">Corporate Headquarters</p>
                <p className="text-[11px] text-slate">Cross-mine risk analytics & GIS</p>
              </div>
            </div>
            <span className="text-slate group-hover:text-primary transition font-bold">→</span>
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-border text-[11px] text-slate">
          Ministry of Coal & DGMS Statutory Compliance System
        </div>
      </div>
    </div>
  );
}
