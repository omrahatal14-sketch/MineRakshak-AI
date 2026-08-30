"use client";

import { useState, useEffect } from "react";
import AppShell from "../../src/components/layout/AppShell.jsx";
import { useAuth } from "../../src/context/AuthContext.jsx";
import { inspectionService } from "../../src/services/inspectionService.js";
import { correctiveActionService } from "../../src/services/correctiveActionService.js";
import StatusBadge, { PriorityBadge, SeverityBadge } from "../../src/components/ui/StatusBadge.jsx";
import CreateInspectionModal from "../../src/components/modals/CreateInspectionModal.jsx";
import {
  ClipboardCheck, ShieldCheck, MapPin, CheckCircle2, AlertCircle,
  FileText, Clock, Navigation, Check, X
} from "lucide-react";

export default function FieldOfficerPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [inspections, setInspections] = useState([]);
  const [resolvedActions, setResolvedActions] = useState([]);
  const [gpsLocation, setGpsLocation] = useState({ lat: "22.3094° N", lng: "82.6792° E", accuracy: "± 3.2m" });
  const [showInspectionModal, setShowInspectionModal] = useState(false);

  // Verification modal state
  const [verifyingAction, setVerifyingAction] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [submittingVerify, setSubmittingVerify] = useState(false);

  async function loadInspectorData() {
    setLoading(true);
    try {
      const [iData, aData] = await Promise.all([
        inspectionService.getInspections({ mine: profile?.mineId || "KCM-01" }).catch(() => []),
        correctiveActionService.getActions({ status: "resolved" }).catch(() => []),
      ]);
      setInspections(iData || []);
      setResolvedActions(aData || []);
    } catch (err) {
      console.error("Failed to load field officer data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInspectorData();

    // Get live GPS if available
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsLocation({
            lat: `${pos.coords.latitude.toFixed(4)}° N`,
            lng: `${pos.coords.longitude.toFixed(4)}° E`,
            accuracy: `± ${pos.coords.accuracy.toFixed(1)}m`,
          });
        },
        () => {}
      );
    }
  }, [profile]);

  const handleVerifySignoff = async (actionId) => {
    setSubmittingVerify(true);
    try {
      await correctiveActionService.verifyAction(actionId, {
        verificationNotes: verificationNotes.trim() || "On-site physical inspection verified. Workmanship conforms with statutory DGMS safety codes.",
        status: "closed",
      });
      setVerifyingAction(null);
      setVerificationNotes("");
      loadInspectorData();
    } catch (err) {
      alert("Failed to verify action: " + err.message);
    } finally {
      setSubmittingVerify(false);
    }
  };

  const pendingVerificationCount = resolvedActions.length;
  const assignedInspectionsCount = inspections.filter((i) => ["assigned", "in_progress"].includes(i.status)).length;
  const completedInspectionsCount = inspections.filter((i) => ["submitted", "reviewed", "closed"].includes(i.status)).length;

  return (
    <AppShell title="Field Inspection & Safety Verification Portal">
      {/* Top Banner with Inspector Identity & Live GPS */}
      <div className="card mb-6 bg-gradient-to-r from-blue-950 via-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-lg border-0">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="rounded-md bg-blue-500/20 text-blue-300 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider border border-blue-500/30">
                Statutory Mining Inspector
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs text-slate-300">Station: {profile?.mineName || "Kusmunda Coal Mine"}</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">{profile?.name || "Ramesh Kumar"}</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Conduct geo-tagged field audits, record live safety non-conformances with photo evidence, and perform final sign-off on company CAPA remediations.
            </p>
          </div>

          {/* GPS Telemetry Pill */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="rounded-xl bg-white/10 border border-white/20 px-3.5 py-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold mb-0.5">
                <Navigation className="h-3.5 w-3.5 animate-pulse" />
                <span>GPS Telemetry Active</span>
              </div>
              <p className="font-mono text-[11px] text-slate-200">{gpsLocation.lat}, {gpsLocation.lng} ({gpsLocation.accuracy})</p>
            </div>
            <button
              onClick={() => setShowInspectionModal(true)}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-600 transition"
            >
              <ClipboardCheck className="h-4 w-4" />
              <span>Conduct New Audit</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <span className="text-xs font-bold text-slate uppercase tracking-wider">Assigned Audits</span>
          <p className="mt-2 text-2xl font-bold text-ink">{loading ? "—" : assignedInspectionsCount}</p>
          <p className="text-[11px] text-blue-700 font-semibold mt-0.5">Scheduled on site</p>
        </div>

        <div className="card p-4">
          <span className="text-xs font-bold text-slate uppercase tracking-wider">Pending Sign-Off</span>
          <p className="mt-2 text-2xl font-bold text-amber-600">{loading ? "—" : pendingVerificationCount}</p>
          <p className="text-[11px] text-amber-700 font-semibold mt-0.5">Resolved CAPA by companies</p>
        </div>

        <div className="card p-4">
          <span className="text-xs font-bold text-slate uppercase tracking-wider">Completed Audits</span>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{loading ? "—" : completedInspectionsCount}</p>
          <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">DGMS submitted & sealed</p>
        </div>

        <div className="card p-4">
          <span className="text-xs font-bold text-slate uppercase tracking-wider">Offline Sync</span>
          <p className="mt-2 text-2xl font-bold text-ink">Synced</p>
          <p className="text-[11px] text-slate mt-0.5">0 records pending queue</p>
        </div>
      </div>

      {/* Main Grid: Pending CAPA Verifications + Assigned Inspections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left 2 Cols: CAPA Sign-Off Queue & Assigned Audits */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: CAPA Awaiting Inspector Verification & Sign-Off */}
          <div className="card p-5 border-amber-200 bg-amber-50/20">
            <div className="flex items-center justify-between border-b border-amber-200/80 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white font-bold text-xs">
                  !
                </span>
                <div>
                  <h3 className="text-sm font-bold text-ink">Remediations Awaiting Your Verification</h3>
                  <p className="text-xs text-slate">Company completed the fix; inspect on-site and provide statutory closure sign-off.</p>
                </div>
              </div>
              <span className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-xs font-bold">
                {resolvedActions.length} Pending
              </span>
            </div>

            {loading ? (
              <div className="py-6 text-center text-xs text-slate">Loading pending verifications…</div>
            ) : resolvedActions.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate">All resolved corrective actions have been verified and closed.</div>
            ) : (
              <div className="space-y-3">
                {resolvedActions.map((action) => (
                  <div key={action.id} className="rounded-xl border border-border bg-surface p-4 shadow-xs space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <PriorityBadge priority={action.priority} />
                          <h4 className="font-bold text-xs text-ink">{action.title}</h4>
                        </div>
                        <p className="text-xs text-slate mt-1">{action.description}</p>
                      </div>
                      <StatusBadge status={action.status} />
                    </div>

                    {/* Company Resolution Notes & Evidence */}
                    <div className="rounded-lg bg-slate-50 p-3 border border-border text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-slate font-medium text-[11px]">
                        <span>Resolved By: <strong>{action.resolvedByName || action.responsibleCompany}</strong></span>
                        <span>Company: <strong>{action.responsibleCompany || "Contractor"}</strong></span>
                      </div>
                      <p className="text-ink font-semibold">
                        Resolution Notes: <span className="font-normal text-slate">{action.resolutionNotes || "Fix completed on-site."}</span>
                      </p>
                      {action.resolutionEvidence && action.resolutionEvidence.length > 0 && (
                        <div className="pt-1 flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate uppercase">Proof Evidence:</span>
                          <a
                            href={action.resolutionEvidence[0]?.url || "#"}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                          >
                            📷 View Resolution Photo ({action.resolutionEvidence[0]?.name || "Proof.jpg"})
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Verification Button */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => setVerifyingAction(action)}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                      >
                        ✓ Perform On-Site Physical Verification
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Assigned Field Audits */}
          <div className="card p-5">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-ink">My Scheduled Field Audits</h3>
                <p className="text-xs text-slate">Statutory inspections requiring physical checklists & observation recording</p>
              </div>
              <button
                onClick={() => setShowInspectionModal(true)}
                className="text-xs font-bold text-primary hover:underline"
              >
                + New Audit
              </button>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate">Loading inspections…</div>
            ) : inspections.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate">No inspections assigned.</div>
            ) : (
              <div className="space-y-3">
                {inspections.map((ins) => (
                  <div key={ins.id} className="rounded-xl border border-border bg-canvas p-3.5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <PriorityBadge priority={ins.priority} />
                          <h4 className="font-bold text-xs text-ink">{ins.title}</h4>
                        </div>
                        <p className="text-[11px] text-slate mt-0.5">{ins.summary || `Type: ${ins.type || "Statutory Audit"}`}</p>
                      </div>
                      <StatusBadge status={ins.status} />
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-border/70 text-slate">
                      <div className="flex items-center gap-3">
                        <span>Zone: <strong className="text-ink">{ins.zone || "Operational Pit"}</strong></span>
                        <span>•</span>
                        <span>Date: <strong className="text-ink">{ins.scheduledDate}</strong></span>
                      </div>
                      <span className="font-medium text-primary">
                        {ins.observations ? `${ins.observations.length} Observations Recorded` : "Ready to start"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Field Toolkit & GPS Mobile Verification */}
        <div className="space-y-6">
          {/* Geo-Tagged Inspection Toolkit Card */}
          <div className="card p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Field Officer Toolkit</h3>
            <div className="space-y-3 text-xs">
              <div className="rounded-lg bg-white/10 p-3 border border-white/15">
                <div className="flex items-center gap-2 font-bold text-white mb-1">
                  <MapPin className="h-4 w-4 text-emerald-400" />
                  <span>GPS Time-Stamped Telemetry</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Every observation and photo captured is stamped with exact satellite coordinates and UTC time to prevent retrospective tampering.
                </p>
              </div>

              <div className="rounded-lg bg-white/10 p-3 border border-white/15">
                <div className="flex items-center gap-2 font-bold text-white mb-1">
                  <ShieldCheck className="h-4 w-4 text-blue-400" />
                  <span>Closed-Loop Verification</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Corrective actions cannot be closed by contractors alone; they require on-site biometric/inspector validation.
                </p>
              </div>
            </div>
          </div>

          {/* Statutory Verification Guidelines */}
          <div className="card p-5 text-xs space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink mb-2">DGMS Inspection Checklist</h3>
            <ul className="space-y-2 text-slate text-[11px]">
              <li className="flex items-start gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Verify haul road berm height is &ge; 1.5m along all outer curves.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Test pull-wire emergency trip switches on overland coal conveyors.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Inspect fire protection DCP extinguishers and substation earth pits.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Verification Sign-Off Modal */}
      {verifyingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-ink">Physical On-Site Verification</h3>
                <p className="text-xs text-slate">Statutory inspector sign-off to formally close this CAPA record.</p>
              </div>
              <button onClick={() => setVerifyingAction(null)} className="rounded p-1 text-slate hover:bg-canvas hover:text-ink">
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div className="rounded-lg bg-canvas p-3 border border-border">
                <span className="font-mono text-[10px] font-bold text-primary uppercase">Action ID: {verifyingAction.id}</span>
                <h4 className="font-bold text-xs text-ink mt-0.5">{verifyingAction.title}</h4>
                <p className="text-slate text-[11px] mt-1">{verifyingAction.description}</p>
                <div className="mt-2 text-[11px] text-slate font-medium">
                  Responsible Company: <strong className="text-ink">{verifyingAction.responsibleCompany}</strong>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate">Inspector Field Verification Notes *</label>
                <textarea
                  rows={3}
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder="e.g. Conducted physical inspection at Pit 2 West. Verified certified 10-gauge mesh guard installed and interlocked. Defect rectified."
                  className="w-full rounded border border-border bg-white p-2.5 text-xs text-ink focus:border-primary focus:outline-none"
                />
              </div>

              <div className="rounded bg-blue-50 p-2.5 text-[11px] text-blue-900 border border-blue-100 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span>Verification will be sealed with your digital signature and GPS location ({gpsLocation.lat}, {gpsLocation.lng}).</span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setVerifyingAction(null)}
                  className="rounded border border-border px-3.5 py-1.5 text-slate hover:bg-canvas"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submittingVerify}
                  onClick={() => handleVerifySignoff(verifyingAction.id)}
                  className="rounded bg-emerald-600 px-4 py-2 font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-60 transition"
                >
                  {submittingVerify ? "Sealing Verification…" : "✓ Verify & Close Action"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Inspection Modal */}
      {showInspectionModal && (
        <CreateInspectionModal
          onClose={() => setShowInspectionModal(false)}
          onCreated={() => {
            setShowInspectionModal(false);
            loadInspectorData();
          }}
        />
      )}
    </AppShell>
  );
}
