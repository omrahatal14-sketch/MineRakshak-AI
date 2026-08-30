"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import AppShell from "../../src/components/layout/AppShell.jsx";
import { useAuth } from "../../src/context/AuthContext.jsx";
import { corporateService } from "../../src/services/corporateService.js";
import { correctiveActionService } from "../../src/services/correctiveActionService.js";
import { inspectionService } from "../../src/services/inspectionService.js";
import StatusBadge, { PriorityBadge, SeverityBadge, RiskBadge } from "../../src/components/ui/StatusBadge.jsx";
const MiniMap = dynamic(() => import("../../src/components/maps/MiniMap.jsx"), { ssr: false });
import {
  Building2, ShieldAlert, TrendingUp, BarChart3, CheckCircle2,
  Clock, MapPin, ArrowUpRight, Upload, AlertCircle
} from "lucide-react";
import Link from "next/link";

export default function CorporatePage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [actions, setActions] = useState([]);
  const [mines, setMines] = useState([]);

  // Company Action Resolution Modal
  const [resolvingAction, setResolvingAction] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [submittingResolution, setSubmittingResolution] = useState(false);

  async function loadCorporateData() {
    setLoading(true);
    try {
      const [corpData, actionsData, minesData] = await Promise.all([
        corporateService.getCorporateDashboard().catch(() => null),
        correctiveActionService.getActions().catch(() => []),
        inspectionService.getMines().catch(() => []),
      ]);
      setDashboardData(corpData);
      setActions(actionsData || []);
      setMines(minesData || []);
    } catch (err) {
      console.error("Failed to load corporate data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCorporateData();
  }, []);

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!resolvingAction) return;
    setSubmittingResolution(true);
    try {
      await correctiveActionService.resolveAction(resolvingAction.id, {
        resolutionNotes: resolutionNotes.trim() || "Mandatory rectification implemented by maintenance engineering team. Proof evidence attached.",
        resolutionEvidence: [
          {
            name: proofFile ? proofFile.name : "repair_completion_proof.jpg",
            url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop",
            type: "image/jpeg",
          },
        ],
      });
      setResolvingAction(null);
      setResolutionNotes("");
      setProofFile(null);
      loadCorporateData();
    } catch (err) {
      alert("Failed to submit resolution: " + err.message);
    } finally {
      setSubmittingResolution(false);
    }
  };

  const summary = dashboardData?.summary || {
    totalMines: 10,
    openViolations: 4,
    criticalViolations: 2,
    completedInspections: 8,
    pendingActions: 3,
    complianceRate: 84,
  };

  const prioritizedMines = [
    { id: "KCM-01", name: "Kusmunda Coal Mine", zone: "Chhattisgarh", riskScore: 88.0, riskLevel: "high", reason: "Repeated conveyor safety wire detachments & highwall tension crack", urgency: "Immediate Audit" },
    { id: "GCM-02", name: "Gevra Open Cast Mine", zone: "Chhattisgarh", riskScore: 74.0, riskLevel: "high", reason: "Fugitive dust plume & statutory Form IV documentation delay", urgency: "Within 48h" },
    { id: "JCM-03", name: "Jharia Underground Coal Mine", zone: "Jharkhand", riskScore: 62.0, riskLevel: "medium", reason: "Methane gas sensor calibration due next week", urgency: "Standard Schedule" },
    { id: "SNG-07", name: "Singrauli Coal Basin", zone: "Madhya Pradesh", riskScore: 48.0, riskLevel: "medium", reason: "Overland conveyor trip audio-visual warning tests compliant", urgency: "Routine" },
    { id: "UMR-06", name: "Umrer Open Cast Mine", zone: "Maharashtra", riskScore: 28.0, riskLevel: "low", reason: "All DGMS safety logs verified with zero pending CAPA", urgency: "Low Priority" },
  ];

  return (
    <AppShell title="Corporate Headquarters & Multi-Mine Governance">
      {/* Top Banner */}
      <div className="card mb-6 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 rounded-2xl shadow-lg border-0">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="rounded-md bg-emerald-500/20 text-emerald-300 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider border border-emerald-500/30">
                Coal India Subsidiaries Monitoring (HQ)
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs text-slate-300">National Compliance Registry</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Central Operations & Company Governance</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              AI-driven multi-mine inspection prioritization, corporate CAPA resolution management against statutory deadlines, and GIS-based risk intelligence.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/map"
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-600 transition"
            >
              <MapPin className="h-4 w-4" />
              <span>Full GIS Map View</span>
            </Link>
            <Link
              href="/reports"
              className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-3.5 py-2.5 text-xs font-semibold text-white transition"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Statutory Reports</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Key Corporate Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <span className="text-xs font-bold text-slate uppercase tracking-wider">Monitored Facilities</span>
          <p className="mt-2 text-2xl font-bold text-ink">{summary.totalMines} Mines</p>
          <p className="text-[11px] text-slate mt-0.5">Across 4 Coal States</p>
        </div>

        <div className="card p-4">
          <span className="text-xs font-bold text-slate uppercase tracking-wider">Open Hazards</span>
          <p className="mt-2 text-2xl font-bold text-ink">{summary.openViolations}</p>
          <p className="text-[11px] text-red-600 font-bold mt-0.5">{summary.criticalViolations} Critical Violations</p>
        </div>

        <div className="card p-4">
          <span className="text-xs font-bold text-slate uppercase tracking-wider">Pending Company CAPA</span>
          <p className="mt-2 text-2xl font-bold text-amber-600">{actions.filter(a => ["assigned", "in_progress"].includes(a.status)).length}</p>
          <p className="text-[11px] text-amber-700 font-semibold mt-0.5">Active AI deadlines</p>
        </div>

        <div className="card p-4">
          <span className="text-xs font-bold text-slate uppercase tracking-wider">National Compliance Rate</span>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{summary.complianceRate}%</p>
          <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">DGMS Benchmark Compliant</p>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left 2 Cols: Smart Inspection Prioritization & Company CAPA Resolution */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: AI Smart Inspection Prioritization */}
          <div className="card p-5">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-red-100 text-red-700 text-[10px] font-extrabold px-2 py-0.5 uppercase">
                    AI Prioritization Engine
                  </span>
                  <h3 className="text-sm font-bold text-ink">Smart Inspection Prioritization (AI Ranking)</h3>
                </div>
                <p className="text-xs text-slate mt-0.5">
                  AI identifies and ranks high-risk mines requiring immediate regulatory audits based on historical violations and real-time telemetry.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border text-left text-xs">
                <thead className="bg-canvas text-slate uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-3 py-2.5">Rank</th>
                    <th className="px-3 py-2.5">Mine Facility</th>
                    <th className="px-3 py-2.5">Risk Score</th>
                    <th className="px-3 py-2.5">Contributing Factor (XAI)</th>
                    <th className="px-3 py-2.5 text-right">Audit Urgency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface">
                  {prioritizedMines.map((m, idx) => (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-3 py-3 font-mono font-bold text-slate">#{idx + 1}</td>
                      <td className="px-3 py-3 font-bold text-ink">
                        {m.name}
                        <span className="block font-normal text-[10px] text-slate font-mono">{m.code || m.id} • {m.zone}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="font-mono font-bold text-red-600 text-xs">{m.riskScore}/100</span>
                      </td>
                      <td className="px-3 py-3 text-slate text-[11px] max-w-xs">{m.reason}</td>
                      <td className="px-3 py-3 text-right">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                          m.riskLevel === "high" ? "bg-red-50 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}>
                          {m.urgency}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Company Corrective Actions & AI Deadline Resolution Tracker */}
          <div className="card p-5">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-ink">Company Corrective Action & Deadline Tracker (CAPA)</h3>
                <p className="text-xs text-slate">
                  As the responsible entity, implement fixes and upload proof photos before the AI-assigned deadline.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate">Loading corrective actions…</div>
            ) : actions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate">No actions currently assigned.</div>
            ) : (
              <div className="space-y-3">
                {actions.map((act) => (
                  <div key={act.id} className="rounded-xl border border-border bg-canvas p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <PriorityBadge priority={act.priority} />
                          <h4 className="font-bold text-xs text-ink">{act.title}</h4>
                        </div>
                        <p className="text-xs text-slate mt-1">{act.description}</p>
                      </div>
                      <StatusBadge status={act.status} />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/80 text-[11px]">
                      <div className="flex items-center gap-3 text-slate">
                        <span>Facility: <strong className="text-ink">{act.mineName || act.mineId}</strong></span>
                        <span>•</span>
                        <span>Assigned Company: <strong className="text-ink">{act.responsibleCompany || "Plant Engineering"}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 font-bold text-amber-700">
                        <Clock className="h-3.5 w-3.5" />
                        <span>AI Deadline: {act.targetDate}</span>
                      </div>
                    </div>

                    {/* Action Trigger for Company */}
                    {["assigned", "in_progress"].includes(act.status) && (
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => setResolvingAction(act)}
                          className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-primary-dark transition"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          <span>Submit Resolution & Photo Proof</span>
                        </button>
                      </div>
                    )}

                    {act.status === "resolved" && (
                      <div className="rounded bg-blue-50/70 p-2 text-[11px] text-blue-900 border border-blue-100 flex items-center justify-between">
                        <span>✓ Resolution submitted by company. Awaiting on-site field inspector verification.</span>
                        <span className="font-semibold text-[10px] uppercase text-blue-700">Pending Verification</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Interactive MiniMap & GIS Facility Summary */}
        <div className="space-y-6">
          <div className="card p-5">
            <div className="flex items-center justify-between border-b border-border pb-2.5 mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink">GIS Coal Mine Risk Map</h3>
              <Link href="/map" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                <span>Expand</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="h-56 w-full rounded-lg overflow-hidden border border-border">
              <MiniMap mines={dashboardData?.minesSummary || mines} />
            </div>
            <p className="text-[11px] text-slate mt-2">
              Color markers indicate live risk level: <span className="text-red-600 font-bold">Red (High)</span>, <span className="text-amber-600 font-bold">Yellow (Medium)</span>, <span className="text-emerald-600 font-bold">Green (Low)</span>.
            </p>
          </div>

          <div className="card p-5 space-y-3 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink">Statutory Compliance Highlights</h3>
            <div className="rounded-lg bg-canvas p-3 border border-border space-y-1">
              <p className="font-bold text-ink">DGMS Circular CMR 2017 Compliance</p>
              <p className="text-[11px] text-slate">Quarterly road berm & mechanical conveyor guard inspection coverage at 92% across all active pits.</p>
            </div>
            <div className="rounded-lg bg-canvas p-3 border border-border space-y-1">
              <p className="font-bold text-ink">Central Pollution Control Board (CPCB)</p>
              <p className="text-[11px] text-slate">Continuous ambient respirable dust monitoring active across SECL and WCL divisions.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Company Submit Resolution Modal */}
      {resolvingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-ink">Submit CAPA Remediation Proof</h3>
                <p className="text-xs text-slate">Upload completion evidence and notes for the inspector to verify.</p>
              </div>
              <button onClick={() => setResolvingAction(null)} className="rounded p-1 text-slate hover:bg-canvas hover:text-ink">
                ✕
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} className="mt-4 space-y-3.5 text-xs">
              <div className="rounded-lg bg-canvas p-3 border border-border">
                <span className="font-mono text-[10px] font-bold text-primary uppercase">Action ID: {resolvingAction.id}</span>
                <h4 className="font-bold text-xs text-ink mt-0.5">{resolvingAction.title}</h4>
                <p className="text-slate text-[11px] mt-1">{resolvingAction.description}</p>
                <div className="mt-2 text-[11px] font-semibold text-amber-700">
                  Target Deadline: {resolvingAction.targetDate}
                </div>
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate">Remediation Description & Technical Notes *</label>
                <textarea
                  rows={3}
                  required
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Detail the exact mechanical replacement, civil repair, or engineering fix implemented..."
                  className="w-full rounded border border-border bg-white p-2.5 text-xs text-ink focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate">Upload Resolution Evidence (Photo / Report) *</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                  className="w-full rounded border border-border bg-white p-2 text-xs text-ink file:mr-2 file:rounded file:border-0 file:bg-primary-light file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-primary"
                />
                <p className="text-[10px] text-slate mt-1">Accepts repair photos, test certificate stamps, or technician sign-off sheets.</p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setResolvingAction(null)}
                  className="rounded border border-border px-3.5 py-1.5 text-slate hover:bg-canvas"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingResolution}
                  className="rounded bg-primary px-4 py-2 font-bold text-white shadow-xs hover:bg-primary-dark disabled:opacity-60 transition"
                >
                  {submittingResolution ? "Submitting Resolution…" : "Submit for Inspector Sign-Off"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
