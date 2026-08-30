"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { uploadEvidenceFile } from "../../services/storageService.js";
import { incidentService } from "../../services/incidentService.js";
import { inspectionService } from "../../services/inspectionService.js";
import { SeverityBadge } from "../ui/StatusBadge.jsx";

const SAMPLE_HAZARD_PRESETS = [
  { label: "Conveyor Wire Detached", file: "conveyor_safety_wire_broken.jpg", text: "Conveyor 4B emergency trip switch disconnected, missing mesh guard" },
  { label: "Highwall Slope Crack", file: "highwall_bench_crack_sector3.jpg", text: "Pit 2 highwall longitudinal fracture and bench displacement" },
  { label: "Haul Road Dust Plume", file: "dust_sprinkler_nozzle_clogged.jpg", text: "Water tanker sprinkler manifold blocked, severe airborne dust" },
  { label: "HEMM Hydraulic Leak", file: "dumper_hydraulic_oil_leak.jpg", text: "100T CAT dumper high-pressure hydraulic fluid leak in engine bay" },
  { label: "Sub-standard Berm", file: "haul_road_berm_low_height.jpg", text: "Safety embankment berm height below 1.5m on steep turn" },
];

export default function AiIncidentModal({ onClose, onDispatched }) {
  const { profile } = useAuth();
  const [inspectors, setInspectors] = useState([]);
  const [mines, setMines] = useState([]);

  // Image & upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadedEvidence, setUploadedEvidence] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // AI Analysis state
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [error, setError] = useState(null);

  // Dispatch parameters
  const [mineId, setMineId] = useState(profile?.mineId || "KCM-01");
  const [zone, setZone] = useState("Pit A - Primary Extraction Zone");
  const [assignedInspector, setAssignedInspector] = useState("");
  const [responsibleCompany, setResponsibleCompany] = useState("");
  const [customDeadline, setCustomDeadline] = useState("");
  const [officialNotes, setOfficialNotes] = useState("");
  const [dispatching, setDispatching] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState(null);

  useEffect(() => {
    async function loadOptions() {
      try {
        const [inspectorsData, minesData] = await Promise.all([
          inspectionService.getInspectors().catch(() => []),
          inspectionService.getMines().catch(() => []),
        ]);
        setInspectors(inspectorsData || []);
        setMines(minesData || []);
        if (inspectorsData && inspectorsData.length > 0) {
          setAssignedInspector(inspectorsData[0].uid);
        }
      } catch {}
    }
    loadOptions();
  }, []);

  // Handle Photo selection
  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
    setAiResult(null);
    setError(null);

    // Upload to Firebase Storage
    setUploadingImage(true);
    try {
      const uploaded = await uploadEvidenceFile(file, `incidents/${Date.now()}`);
      setUploadedEvidence(uploaded);
      runAiAnalysis(file.name, file.name);
    } catch (err) {
      console.warn("Storage upload error:", err);
      runAiAnalysis(file.name, file.name);
    } finally {
      setUploadingImage(false);
    }
  }

  // Quick Preset Selector for Fast Demonstration
  function handlePresetSelect(preset) {
    setSelectedFile({ name: preset.file });
    setImagePreview("https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=600&auto=format&fit=crop");
    setUploadedEvidence({
      name: preset.file,
      url: "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=600&auto=format&fit=crop",
      type: "image/jpeg",
    });
    runAiAnalysis(preset.file, preset.text);
  }

  // Run AI Vision Analysis
  async function runAiAnalysis(fileName, contextText) {
    setAnalyzing(true);
    setError(null);
    try {
      const result = await incidentService.analyzeHazardImage({
        fileName,
        contextText,
        mineId,
      });
      setAiResult(result);
      setResponsibleCompany(result.suggestedResponsibleParty || "Plant Mechanical & Maintenance Contractor");
      setCustomDeadline(result.calculatedDeadline);
    } catch (err) {
      setError(err.message || "Failed to complete AI hazard analysis");
    } finally {
      setAnalyzing(false);
    }
  }

  // Auto-Dispatch Action to Inspector & Company
  async function handleDispatch(e) {
    e.preventDefault();
    if (!aiResult || !assignedInspector) {
      setError("Please ensure AI analysis is complete and an inspector is selected.");
      return;
    }

    const inspectorObj = inspectors.find((i) => i.uid === assignedInspector);
    const mineObj = mines.find((m) => m.id === mineId);

    setDispatching(true);
    setError(null);
    try {
      const res = await incidentService.dispatchIncident({
        image: uploadedEvidence || (selectedFile ? { name: selectedFile.name, url: imagePreview, type: "image/jpeg" } : null),
        aiAnalysis: aiResult,
        mineId,
        mineName: mineObj ? mineObj.name : "Kusmunda Coal Mine",
        zone,
        inspectorId: assignedInspector,
        inspectorName: inspectorObj ? (inspectorObj.name || inspectorObj.email) : "Field Officer",
        responsibleCompany: responsibleCompany.trim() || aiResult.suggestedResponsibleParty,
        customDeadline: customDeadline || aiResult.calculatedDeadline,
        notes: officialNotes.trim(),
      });

      setDispatchSuccess(res);
      setTimeout(() => {
        if (onDispatched) onDispatched(res);
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to dispatch incident.");
      setDispatching(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-3xl rounded-xl border border-border bg-surface p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-bold shadow-sm">
              AI
            </div>
            <div>
              <h2 className="text-base font-bold text-ink">AI Incident Vision & Auto-Dispatch</h2>
              <p className="text-xs text-slate">Analyze hazard images, evaluate statutory risk, set remediation deadline, and dispatch actions.</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded p-1 text-slate hover:bg-canvas hover:text-ink">
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded bg-red-50 p-3 text-xs text-status-overdue border border-red-200">
            {error}
          </div>
        )}

        {dispatchSuccess ? (
          <div className="my-8 rounded-lg border border-emerald-300 bg-emerald-50/60 p-6 text-center">
            <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-emerald-600 text-white text-xl font-bold mb-3 shadow-md">
              ✓
            </div>
            <h3 className="text-base font-bold text-emerald-950">Incident Analyzed & Dispatched Successfully</h3>
            <p className="text-xs text-emerald-900 mt-1 max-w-md mx-auto">
              {dispatchSuccess.message}
            </p>
            <div className="mt-4 inline-flex items-center gap-3 text-xs font-semibold text-emerald-800">
              <span>Deadline: {dispatchSuccess.effectiveDeadline}</span>
              <span>•</span>
              <span>Assigned Company: {dispatchSuccess.responsibleCompany}</span>
            </div>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Image Capture & Presets */}
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate">
                  1. Capture / Upload Incident Photo
                </label>

                <div className="relative rounded-lg border-2 border-dashed border-border bg-canvas p-4 text-center hover:border-primary transition">
                  {imagePreview ? (
                    <div className="relative group">
                      <img
                        src={imagePreview}
                        alt="Incident"
                        className="h-44 w-full rounded object-cover shadow-xs border border-border"
                      />
                      {analyzing && (
                        <div className="absolute inset-0 bg-black/60 rounded flex flex-col items-center justify-center text-white backdrop-blur-xs animate-pulse">
                          <div className="h-8 w-8 animate-spin rounded-full border-3 border-white border-t-transparent mb-2"></div>
                          <span className="text-xs font-bold">AI Computer Vision Scanning…</span>
                          <span className="text-[10px] text-slate-300">Extracting defect parameters</span>
                        </div>
                      )}
                      <label className="absolute bottom-2 right-2 cursor-pointer rounded bg-slate-900/80 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-xs hover:bg-slate-900">
                        Change Photo
                        <input type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" />
                      </label>
                    </div>
                  ) : (
                    <div className="py-8">
                      <p className="text-xs font-bold text-ink">Click to Take Photo or Upload Image</p>
                      <p className="text-[11px] text-slate mt-0.5">Supports Ground Cameras, Mobile Captures & Drone Snaps</p>
                      <label className="mt-3 inline-block cursor-pointer rounded bg-primary px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary-dark transition">
                        <span>Select Incident Photo</span>
                        <input type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Fast Test Presets */}
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate mb-1.5">
                  Test Sample Hazard Scenarios:
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  {SAMPLE_HAZARD_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handlePresetSelect(p)}
                      className="rounded border border-border bg-surface px-2.5 py-1.5 text-left font-medium text-slate hover:bg-primary-light hover:text-primary hover:border-primary/50 transition truncate"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mine & Zone selectors */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="mb-1 block font-semibold text-slate">Mine Facility</label>
                  <select
                    value={mineId}
                    onChange={(e) => setMineId(e.target.value)}
                    className="w-full rounded border border-border px-2.5 py-1.5 text-ink focus:border-primary focus:outline-none"
                  >
                    {mines.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-slate">Specific Pit / Zone</label>
                  <input
                    type="text"
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    className="w-full rounded border border-border px-2.5 py-1.5 text-ink focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: AI Diagnosis & Multi-Party Dispatch */}
            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate">
                2. AI Diagnosis & Auto-Deadline
              </label>

              {!aiResult && !analyzing ? (
                <div className="rounded-lg border border-dashed border-border bg-canvas p-8 text-center text-xs text-slate">
                  Upload an incident photo or select a hazard preset on the left to trigger the AI Vision engine.
                </div>
              ) : analyzing ? (
                <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-8 text-center text-xs text-blue-900">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-2"></div>
                  AI Vision is evaluating mechanical defects, structural integrity, and statutory DGMS severity…
                </div>
              ) : (
                <form onSubmit={handleDispatch} className="space-y-3.5 text-xs">
                  {/* AI Diagnosis Card */}
                  <div className="rounded-lg border border-primary/40 bg-blue-50/30 p-4 space-y-2.5 shadow-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-[10px] font-bold text-primary uppercase">
                          AI Detected • {aiResult.category} ({(aiResult.confidence * 100).toFixed(0)}% Confidence)
                        </span>
                        <h4 className="font-bold text-sm text-ink leading-tight mt-0.5">
                          {aiResult.detectedHazard}
                        </h4>
                      </div>
                      <SeverityBadge severity={aiResult.severity} />
                    </div>

                    <p className="text-xs text-ink leading-relaxed">
                      {aiResult.description}
                    </p>

                    {/* Risk Score & Statutory Deadline Pill */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/80">
                      <div className="rounded bg-white p-2 border border-border">
                        <span className="block text-[10px] font-bold text-slate uppercase">AI Risk Index</span>
                        <span className="font-mono text-sm font-bold text-red-600">
                          {aiResult.riskScore} / 100 ({aiResult.riskLevel.toUpperCase()})
                        </span>
                      </div>
                      <div className="rounded bg-white p-2 border border-border">
                        <span className="block text-[10px] font-bold text-slate uppercase">Fix Deadline (AI)</span>
                        <span className="font-mono text-xs font-bold text-amber-700">
                          {aiResult.deadlineFormatted}
                        </span>
                      </div>
                    </div>

                    {/* AI Recommendations */}
                    <div className="rounded bg-white/80 p-2.5 text-[11px] text-blue-950 border border-blue-100">
                      <span className="font-bold">AI Proposed Actions:</span> {aiResult.recommendations}
                    </div>
                  </div>

                  {/* Dispatch Assignees */}
                  <div className="space-y-2.5 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="mb-1 block font-semibold text-slate">
                          Assign Field Inspector (On-Site Verifier) *
                        </label>
                        <select
                          value={assignedInspector}
                          onChange={(e) => setAssignedInspector(e.target.value)}
                          required
                          className="w-full rounded border border-border bg-white px-2.5 py-1.5 text-xs text-ink focus:border-primary focus:outline-none font-medium"
                        >
                          {inspectors.map((i) => (
                            <option key={i.uid} value={i.uid}>
                              {i.name || i.email}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-1 block font-semibold text-slate">
                          Responsible Company / Contractor *
                        </label>
                        <input
                          type="text"
                          required
                          value={responsibleCompany}
                          onChange={(e) => setResponsibleCompany(e.target.value)}
                          placeholder="e.g. Apex Mechanical Engineering Ltd"
                          className="w-full rounded border border-border bg-white px-2.5 py-1.5 text-xs text-ink focus:border-primary focus:outline-none font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block font-semibold text-slate">
                        Official Instructions & Notes (Optional)
                      </label>
                      <textarea
                        rows={2}
                        value={officialNotes}
                        onChange={(e) => setOfficialNotes(e.target.value)}
                        placeholder="Add specific site access directions or plant shutdown timings..."
                        className="w-full rounded border border-border bg-white p-2 text-xs text-ink focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded border border-border px-3.5 py-1.5 text-slate hover:bg-canvas"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={dispatching}
                      className="rounded bg-primary px-5 py-2 font-bold text-white shadow-md hover:bg-primary-dark disabled:opacity-60 transition"
                    >
                      {dispatching ? "Dispatching Alerts…" : "Auto-Dispatch to Inspector & Company"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
