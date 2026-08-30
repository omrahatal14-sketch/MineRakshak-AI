"use client";

import { useState, useEffect } from "react";
import AppShell from "../../src/components/layout/AppShell.jsx";
import { useAuth } from "../../src/context/AuthContext.jsx";
import { correctiveActionService } from "../../src/services/correctiveActionService.js";
import { inspectionService } from "../../src/services/inspectionService.js";
import { complianceService } from "../../src/services/moduleServices.js";
import StatusBadge, { SeverityBadge, PriorityBadge, RiskBadge } from "../../src/components/ui/StatusBadge.jsx";
import AiIncidentModal from "../../src/components/incidents/AiIncidentModal.jsx";
import CreateActionModal from "../../src/components/modals/CreateActionModal.jsx";
import CreateInspectionModal from "../../src/components/modals/CreateInspectionModal.jsx";
import {
  Camera, AlertTriangle, ShieldCheck, ClipboardCheck, Calendar,
  TrendingUp, Clock, MapPin, CheckCircle2, ArrowRight
} from "lucide-react";

export default function MineOfficialPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [violations, setViolations] = useState([]);
  const [actions, setActions] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [complianceReqs, setComplianceReqs] = useState([]);

  // Modals
  const [showAiModal, setShowAiModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);

  const mineId = profile?.mineId || "KCM-01";
  const mineName = profile?.mineName || "Kusmunda Coal Mine";

  async function loadMineData() {
    setLoading(true);
    try {
      const [vData, aData, iData, cData] = await Promise.all([
        correctiveActionService.getViolations({ status: "open" }).catch(() => []),
        correctiveActionService.getActions({ mine: mineId }).catch(() => []),
        inspectionService.getInspections({ mine: mineId }).catch(() => []),
        complianceService.getRequirements({ mine: mineId }).catch(() => []),
      ]);
      setViolations(vData || []);
      setActions(aData || []);
      setInspections(iData || []);
      setComplianceReqs(cData || []);
    } catch (err) {
      console.error("Failed to load mine official data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMineData();
  }, [mineId]);

  const openViolationsCount = violations.length;
  const criticalViolationsCount = violations.filter((v) => v.severity === "critical").length;
  const pendingActionsCount = actions.filter((a) => ["assigned", "in_progress"].includes(a.status)).length;
  const complianceRate = complianceReqs.length > 0
    ? Math.round((complianceReqs.filter((c) => c.status === "completed").length / complianceReqs.length) * 100)
    : 78;

  return (
    <AppShell title="Mine Operations & Hazard Control Center">
      {/* Top Facility Banner & AI Action Bar */}
      <div className="card mb-6 bg-gradient-to-r from-slate-900 via-slate-800 to-primary-dark text-white p-6 rounded-2xl shadow-lg border-0">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="rounded-md bg-amber-500/20 text-amber-300 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider border border-amber-500/30">
                Primary Extraction Division
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs text-slate-300 font-mono">ID: {mineId}</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">{mineName}</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Real-time monitoring of open-cast pit safety, statutory DGMS standards, automated multi-party dispatch, and AI computer vision hazard detection.
            </p>
          </div>

          {/* Quick Action Trigger Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAiModal(true)}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-600 transition group"
            >
              <Camera className="h-4 w-4 transition group-hover:scale-110" />
              <span>Capture Incident (AI Vision)</span>
            </button>
            <button
              onClick={() => setShowInspectionModal(true)}
              className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-3.5 py-2.5 text-xs font-semibold text-white transition"
            >
              <Calendar className="h-4 w-4" />
              <span>Schedule Audit</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate uppercase tracking-wider">Open Hazards</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-ink">{loading ? "—" : openViolationsCount}</p>
          <p className="text-[11px] text-slate mt-0.5">
            <span className="font-semibold text-red-600">{criticalViolationsCount} Critical</span> severity
          </p>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate uppercase tracking-wider">Pending CAPA</span>
            <ShieldCheck className="h-4 w-4 text-blue-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-ink">{loading ? "—" : pendingActionsCount}</p>
          <p className="text-[11px] text-slate mt-0.5">Assigned to contractors</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate uppercase tracking-wider">Compliance Index</span>
            <ClipboardCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-ink">{loading ? "—" : `${complianceRate}%`}</p>
          <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">DGMS Statutory Compliant</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate uppercase tracking-wider">AI Risk Score</span>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-red-600">82.5 <span className="text-xs text-slate font-normal">/ 100</span></p>
          <p className="text-[11px] text-red-700 font-bold mt-0.5">High Risk (Preventive Alert)</p>
        </div>
      </div>

      {/* Main Grid: Explainable Risk + Live Hazards & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left 2 Cols: Active Violations & CAPA */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Detected Hazards */}
          <div className="card p-5">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-ink">Active Site Hazards & Violations</h3>
                <p className="text-xs text-slate">AI-detected and field officer recorded non-conformances</p>
              </div>
              <button
                onClick={() => setShowAiModal(true)}
                className="text-xs font-bold text-primary hover:underline"
              >
                + AI Scan
              </button>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate">Loading site hazards…</div>
            ) : violations.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate">No open hazards recorded for this mine.</div>
            ) : (
              <div className="divide-y divide-border">
                {violations.slice(0, 4).map((v) => (
                  <div key={v.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <SeverityBadge severity={v.severity} />
                        <h4 className="font-bold text-xs text-ink">{v.title}</h4>
                      </div>
                      <p className="text-[11px] text-slate line-clamp-1">{v.description}</p>
                      <div className="flex items-center gap-3 text-[10px] text-slate font-medium">
                        <span>Zone: <strong>{v.zone || v.location || "Pit Sector"}</strong></span>
                        <span>•</span>
                        <span>AI Risk: <strong className="text-red-600">{v.aiRiskScore || 75}/100</strong></span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowActionModal(true)}
                      className="shrink-0 rounded bg-canvas border border-border px-3 py-1.5 text-xs font-semibold text-ink hover:bg-primary-light hover:text-primary hover:border-primary/40 transition"
                    >
                      Remediate (CAPA)
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Corrective Actions with AI Deadlines */}
          <div className="card p-5">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-ink">Corrective Actions & Remediations (CAPA)</h3>
                <p className="text-xs text-slate">Multi-party accountability tracking with AI-assigned statutory deadlines</p>
              </div>
              <button
                onClick={() => setShowActionModal(true)}
                className="text-xs font-bold text-primary hover:underline"
              >
                + Create Action
              </button>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate">Loading corrective actions…</div>
            ) : actions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate">No active corrective actions.</div>
            ) : (
              <div className="space-y-3">
                {actions.slice(0, 4).map((a) => (
                  <div key={a.id} className="rounded-lg border border-border bg-canvas p-3.5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <PriorityBadge priority={a.priority} />
                          <h4 className="font-bold text-xs text-ink">{a.title}</h4>
                        </div>
                        <p className="text-[11px] text-slate mt-1">{a.description}</p>
                      </div>
                      <StatusBadge status={a.status} />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/70 text-[11px]">
                      <div className="flex items-center gap-3 text-slate">
                        <span>Company: <strong className="text-ink">{a.responsibleCompany || "Plant Engineering"}</strong></span>
                        <span>•</span>
                        <span>Inspector: <strong className="text-ink">{a.assignedToName || "Field Officer"}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 font-bold text-amber-700">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Deadline: {a.targetDate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Explainable Risk (XAI) & Quick Tools */}
        <div className="space-y-6">
          {/* Explainable Risk Breakdown */}
          <div className="card p-5">
            <div className="flex items-center justify-between border-b border-border pb-2.5 mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink">Explainable Risk Analysis (XAI)</h3>
              <RiskBadge level="high" />
            </div>

            <p className="text-xs text-slate mb-4">
              AI evaluates multi-factor statutory metrics to determine <strong>why</strong> this pit is ranked high risk:
            </p>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate">Mechanical / Conveyor Defects</span>
                  <span className="text-red-600 font-bold">40% Impact</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-red-600 rounded-full" style={{ width: "85%" }} />
                </div>
                <p className="text-[10px] text-slate">Missing mesh guards & exposed drive pulleys on Conveyor 4B.</p>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate">Highwall Geotechnical Fractures</span>
                  <span className="text-amber-600 font-bold">30% Impact</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: "65%" }} />
                </div>
                <p className="text-[10px] text-slate">15m longitudinal crest crack along Pit 2 bench 3.</p>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate">Overdue Dust Suppression</span>
                  <span className="text-amber-600 font-bold">20% Impact</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: "50%" }} />
                </div>
                <p className="text-[10px] text-slate">Haul road water bowser missed statutory gravimetric check.</p>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate">Worker Protection & Muster</span>
                  <span className="text-emerald-600 font-bold">10% Impact</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "20%" }} />
                </div>
                <p className="text-[10px] text-slate">All statutory shift muster rolls fully up-to-date.</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border bg-blue-50/50 rounded p-2.5 text-[11px] text-blue-950 font-medium">
              💡 <strong>AI Preventive Recommendation:</strong> Prioritize Conveyor 4B LOTO lockout and highwall prism monitoring to reduce overall risk score below 40.
            </div>
          </div>

          {/* Recent Submitted Inspections */}
          <div className="card p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink mb-3">Recent On-Site Audits</h3>
            {inspections.length === 0 ? (
              <p className="text-xs text-slate">No recent inspections logged.</p>
            ) : (
              <div className="space-y-2.5">
                {inspections.slice(0, 3).map((ins) => (
                  <div key={ins.id} className="rounded border border-border p-2.5 text-xs bg-canvas">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-ink truncate max-w-[170px]">{ins.title}</span>
                      <StatusBadge status={ins.status} />
                    </div>
                    <p className="text-[11px] text-slate mt-1 font-mono">Date: {ins.scheduledDate} • {ins.zone}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAiModal && (
        <AiIncidentModal
          onClose={() => setShowAiModal(false)}
          onDispatched={() => {
            setShowAiModal(false);
            loadMineData();
          }}
        />
      )}

      {showActionModal && (
        <CreateActionModal
          onClose={() => setShowActionModal(false)}
          onCreated={() => {
            setShowActionModal(false);
            loadMineData();
          }}
          initialData={{ mineId }}
        />
      )}

      {showInspectionModal && (
        <CreateInspectionModal
          onClose={() => setShowInspectionModal(false)}
          onCreated={() => {
            setShowInspectionModal(false);
            loadMineData();
          }}
        />
      )}
    </AppShell>
  );
}
